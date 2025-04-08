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
      
      // If we found contact info, save/update it
      if (extractedInfo.hasContactInfo) {
        try {
          const userInfo = await client.users.info({ user: message.user });
          const userName = userInfo.user.real_name || userInfo.user.name;
          const updateData = {};
          if (extractedInfo.email) updateData.email = extractedInfo.email;
          if (extractedInfo.phone) updateData.phone = extractedInfo.phone;

          // Use findOneAndUpdate with upsert: true 
          // This finds a document and updates it, or creates it if it doesn't exist.
          // It also returns the updated document (or the new one).
          const updatedContact = await storage.findOneAndUpdate(
            { userId: message.user }, // Find criteria
            { 
              $set: updateData, // Fields to update/set
              $setOnInsert: { // Fields to set only when creating a new document
                userId: message.user,
                name: userName,
                slackTeamId: message.team || 'unknown',
                channel: message.channel,
                createdAt: new Date() // Add createdAt timestamp
              }
            },
            { 
              new: true, // Return the modified document rather than the original
              upsert: true, // Create the document if it doesn't exist
              runValidators: true // Ensure schema validation runs
            }
          );

          // Add improved validation logging
          if (updatedContact) {
            logger.info('Contact info saved/updated successfully', { 
              userId: updatedContact.userId,
              name: updatedContact.name,
              savedEmail: updatedContact.email,
              savedPhone: updatedContact.phone
            });
            // Verify the saved data matches extracted data
            if (extractedInfo.email && updatedContact.email !== extractedInfo.email) {
                 logger.warn('Saved email mismatch!', { expected: extractedInfo.email, actual: updatedContact.email });
            }
             if (extractedInfo.phone && updatedContact.phone !== extractedInfo.phone) {
                 logger.warn('Saved phone mismatch!', { expected: extractedInfo.phone, actual: updatedContact.phone });
            }
          } else {
            // This case should be rare with upsert:true, but log just in case
            logger.error('Failed to save/update contact info - findOneAndUpdate returned null', { userId: message.user });
          }
          
        } catch (error) {
          // Log detailed database errors
          logger.error('Error saving/updating contact info to database', { 
              userId: message.user,
              error: error.message,
              stack: error.stack 
          });
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