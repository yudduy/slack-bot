const axios = require('axios');
const logger = require('../utils/logger');

/**
 * Service to interact with Hyperbolic.xyz hosted LLMs
 */
class LLMService {
  constructor() {
    this.modelName = process.env.HYPERBOLIC_MODEL || 'llama-3-70b-chat';
    this.apiKey = process.env.HYPERBOLIC_API_KEY;
    // Prioritize dedicated GPU endpoint, then general API URL, then default
    this.apiUrl = process.env.HYPERBOLIC_GPU_ENDPOINT || process.env.HYPERBOLIC_API_URL || 'https://api.hyperbolic.xyz/v1/chat/completions';
    this.conversations = new Map(); // Store conversation history keyed by user ID
    this.userProfiles = new Map(); // Store user profile data like first name

    // Log the API URL being used for verification
    logger.info(`LLMService initialized. Using API URL: ${this.apiUrl}`);
    if (!this.apiKey) {
      logger.warn('HYPERBOLIC_API_KEY is not set!');
    }
  }

  /**
   * Process a message with the LLM and get a response
   * @param {string} userId - The ID of the user
   * @param {string} message - The message to send to the LLM
   * @returns {Promise<string>} - The LLM's response
   */
  async processMessage(userId, message) {
    if (!this.apiKey) {
      logger.error('Hyperbolic API Key is missing. Cannot process message.');
      return "Configuration error: My connection to the AI brain is missing credentials.";
    }
    try {
      // Get conversation history for this user, or initialize if none exists
      if (!this.conversations.has(userId)) {
        this.conversations.set(userId, []);
      }
      const conversationHistory = this.conversations.get(userId);
      
      // Add user message to history
      conversationHistory.push({ role: 'user', content: message });
      
      // Get user profile data
      const userProfile = this.userProfiles.get(userId) || {};
      const firstName = userProfile.firstName || "there";
      
      // Create personalized system prompt with user's name
      const systemContent = `You are "Foundess Bot", a naturally conversational assistant for Foundess. You're speaking with ${firstName}. Your objective is to have a genuine conversation while naturally collecting their contact information (phone number and email). Address them by their first name occasionally and never sound scripted.\n\nConversation Guidelines:\n1. Respond naturally to whatever ${firstName} says, while keeping your goal of getting their contact info in mind.\n2. DO NOT use the same phrasing repeatedly. Vary your language constantly.\n3. When asking for contact information, do it casually as part of the conversation: "By the way ${firstName}, what's a good number to reach you at?" or "What email works best for you?"\n4. If they give you contact information, acknowledge it naturally and continue the conversation. For example, "Great, got your number. And what about your email?" or "Thanks for your email. And your phone number?"\n5. Once you have their information, don't immediately end the conversation. Continue chatting naturally.\n6. Be genuinely helpful and friendly, not transactional.\n7. NEVER respond with validation messages about incorrect formats. The system will handle all validation.\n\nABSOLUTELY AVOID:\n- Repetitive phrasing\n- Templated responses\n- Formal validation messages\n- Ignoring what ${firstName} actually says\n\nTREAT ALL CONTACT INFORMATION AS VALID. The system will handle all validation and formatting.`;
      
      // Prepare the payload for Hyperbolic API
      const payload = {
        model: this.modelName,
        messages: [
          // System message with personalized content
          {
            role: 'system',
            content: systemContent
          },
          // Include recent conversation history (limited to avoid token limits)
          ...conversationHistory.slice(-5)
        ],
        temperature: 0.7,
        max_tokens: 500
      };
      
      logger.info('Sending request to Hyperbolic LLM', { url: this.apiUrl, model: this.modelName });
      
      // Make API request to Hyperbolic service
      const response = await axios.post(this.apiUrl, payload, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Extract and save the LLM's response
      const llmResponse = response.data.choices[0].message.content;
      conversationHistory.push({ role: 'assistant', content: llmResponse });
      
      logger.info('Received response from Hyperbolic LLM');
      return llmResponse;
    } catch (error) {
      // Log detailed error information
      let errorDetails = { 
        message: error.message,
        url: this.apiUrl, // Log the URL we tried to hit
      };
      if (error.response) {
        // Capture response status and data if available
        errorDetails.status = error.response.status;
        errorDetails.data = error.response.data;
      } else if (error.request) {
        // Capture request info if no response was received
        errorDetails.request = 'No response received';
      }
      logger.error('Error processing message with Hyperbolic LLM', errorDetails);

      // Provide a user-friendly error message
      return "I'm having trouble connecting to my AI brain right now. Can you please share your email and phone number so we can reach out to you directly?";
    }
  }
  
  /**
   * Clear conversation history for a user
   * @param {string} userId - The ID of the user
   */
  clearConversation(userId) {
    if (this.conversations.has(userId)) {
      this.conversations.delete(userId);
    }
  }
}

module.exports = new LLMService();