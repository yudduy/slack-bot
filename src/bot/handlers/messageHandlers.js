const logger = require('../../utils/logger');
const contactInfoFlow = require('../conversations/contactInfoFlow');
const llmService = require('../../services/llmService');
const contactExtractor = require('../../utils/contactExtractor');
const Contact = require('../../db/models/contact');

// Try to use MongoDB, fall back to memory storage if needed
let storage;
try {
  storage = Contact;
} catch (error) {
  logger.warn('Using in-memory storage fallback for contacts');
  storage = require('../../db/memoryStorage');
}

/**
 * Register all message listeners with the Slack app
 * @param {Object} app - The Slack Bolt app instance
 */
function register(app) {
  // Handle all messages with the LLM
  app.message(async ({ message, say, client }) => {
    // Don't respond to messages from bots or system messages
    if (message.subtype || message.bot_id) return;
    
    try {
      // Get user info to extract first name
      const userInfo = await client.users.info({
        user: message.user
      });
      
      // Extract first name from user's real_name or display_name
      const fullName = userInfo.user.real_name || userInfo.user.name || "";
      const firstName = fullName.split(" ")[0];
      
      // Store user's first name in conversation memory for the LLM
      if (!llmService.userProfiles.has(message.user)) {
        llmService.userProfiles.set(message.user, { firstName });
      }
      
      // Extract any contact information from the message
      const extractedInfo = contactExtractor.processMessage(message.text);
      
      // Log extracted information for debugging
      logger.info('Message received:', { 
        userId: message.user,
        text: message.text,
        extractedEmail: extractedInfo.email, 
        extractedPhone: extractedInfo.phone,
        hasContactInfo: extractedInfo.hasContactInfo
      });
      
      // If we found contact info, save it
      if (extractedInfo.hasContactInfo) {
        try {
          // Get user info
          const userInfo = await client.users.info({
            user: message.user
          });
          
          // Try to find existing contact
          let contact = await storage.findOne({ userId: message.user });
          
          if (!contact) {
            // Create new contact if none exists
            contact = await storage.create({
              userId: message.user,
              name: userInfo.user.real_name || userInfo.user.name,
              slackTeamId: message.team || 'unknown',
              channel: message.channel,
              email: extractedInfo.email || '',
              phone: extractedInfo.phone || ''
            });
            logger.info('Created new contact record', { userId: message.user });
          } else {
            // Update existing contact
            if (extractedInfo.email && !contact.email) {
              contact.email = extractedInfo.email;
              logger.info('Updated contact with email', { userId: message.user, email: extractedInfo.email });
            }
            if (extractedInfo.phone && !contact.phone) {
              contact.phone = extractedInfo.phone;
              logger.info('Updated contact with phone', { userId: message.user, phone: extractedInfo.phone });
            }
            await contact.save();
          }
        } catch (error) {
          logger.error('Error saving extracted contact info', { error });
        }
      }
      
      // Process the message with the LLM
      const llmResponse = await llmService.processMessage(message.user, message.text);
      
      // Log any contact information that was found in the user's message
      if (extractedInfo.hasContactInfo) {
        logger.info(`User ${message.user} provided contact info:`, {
          email: extractedInfo.email, 
          phone: extractedInfo.phone
        });
      }
      
      // Send the LLM response, ensuring it replies in the correct thread
      await say({ 
        text: llmResponse, 
        thread_ts: message.thread_ts || message.ts // Reply in thread if exists, otherwise start one
      });
    } catch (error) {
      logger.error('Error handling message with LLM', { error });
      // Ensure the error message also respects threading
      await say({ 
        text: "I'm having some trouble with my AI brain right now. Could you please share your email address and phone number so our team can reach out to you directly?",
        thread_ts: message.thread_ts || message.ts // Reply in thread if exists, otherwise start one
      });
    }
  });
}

module.exports = { register };