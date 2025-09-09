const { OpenAI } = require('openai');
const logger = require('../utils/logger');
const config = require('../config/botConfig');

/**
 * LLM Service - Handles conversational AI interactions
 * 
 * This service manages conversations with OpenAI's GPT models to create
 * natural, engaging interactions while guiding users toward providing
 * their contact information. The conversation style and goals can be
 * easily customized by modifying the system prompt below.
 */
class LLMService {
  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      logger.error('OPENAI_API_KEY environment variable is not set!');
      throw new Error('OpenAI API key is required');
    }

    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.modelName = process.env.OPENAI_MODEL || config.llm.defaultModel;
    this.conversations = new Map(); // Store conversation history keyed by user ID
    this.userProfiles = new Map(); // Store user profile data like first name

    logger.info(`LLMService initialized for OpenAI. Using model: ${this.modelName}`);
  }

  /**
   * Process a message with the LLM and get a response
   * @param {string} userId - The ID of the user
   * @param {string} message - The message to send to the LLM
   * @returns {Promise<string>} - The LLM's response
   */
  async processMessage(userId, message) {
    try {
      // Get conversation history for this user, or initialize if none exists
      if (!this.conversations.has(userId)) {
        this.conversations.set(userId, []);
      }
      const conversationHistory = this.conversations.get(userId);
      
      // Get user profile data
      const userProfile = this.userProfiles.get(userId) || {};
      const firstName = userProfile.firstName || config.conversation.defaultGreeting;
      
      // Create personalized system prompt - CUSTOMIZE THIS for your use case
      let systemContent = `You are a friendly and helpful conversational assistant. You are speaking with ${firstName}.

Your primary goal is to collect their phone number and email address through natural conversation. Address them by their first name occasionally to keep things personal.

**Initial Interaction:**
- If this is the *very first* message from ${firstName}, greet them warmly and explain you'd like to collect their contact information for follow-up.
- Example: "Hi ${firstName}! Great to meet you! To make sure we can follow up with you, could you share your phone number and email address with me?"

**Conversation Flow:**
1. Always respond naturally to what the user says first, then guide toward collecting contact information if still needed.
2. Ask for contact information casually: "By the way ${firstName}, what's the best number to reach you at?" or "What email should I use to send you information?"
3. When they provide contact info, acknowledge it positively and ask for the missing piece if needed.
4. After collecting BOTH phone and email, continue the conversation naturally based on the context. Ask relevant follow-up questions about their interests or needs.
5. Keep your tone conversational, helpful, and authentic throughout.

**Guidelines:**
- Be natural and avoid robotic responses
- Don't repeat the same phrases
- Acknowledge their contact information when provided
- Keep the conversation flowing after collecting contact details
- The system will handle validation, so treat all provided information as valid

Remember: Your goal is to have a genuine conversation while naturally collecting the contact information needed for follow-up.`;
      
      // Add user message to history *after* setting up the system prompt
      conversationHistory.push({ role: 'user', content: message });

      // Determine if this is the first user message to adjust prompt logic if needed (though the prompt itself guides this)
      const isFirstUserMessage = conversationHistory.filter(m => m.role === 'user').length === 1;

      // Prepare the messages payload for OpenAI API
      const messagesPayload = [
        { role: 'system', content: systemContent },
        // Use the *current* conversation history
        ...conversationHistory.slice(-config.conversation.maxHistoryLength) 
      ];

      logger.info('Sending request to OpenAI LLM', { model: this.modelName, userId: userId, isFirst: isFirstUserMessage });

      // Make API request using the OpenAI client
      const completion = await this.openai.chat.completions.create({
        model: this.modelName,
        messages: messagesPayload,
        temperature: config.llm.temperature,
        max_tokens: config.llm.maxTokens,
      });

      // Extract and save the LLM's response
      const llmResponse = completion.choices[0]?.message?.content?.trim();

      if (!llmResponse) {
          logger.error('Received empty response from OpenAI LLM', { completion });
          throw new Error('Empty response from LLM');
      }

      conversationHistory.push({ role: 'assistant', content: llmResponse });
      
      // Trim conversation history to prevent unbounded memory growth
      // Keep only the last N entries as defined by maxHistoryLength
      if (conversationHistory.length > config.conversation.maxHistoryLength) {
        const trimmedHistory = conversationHistory.slice(-config.conversation.maxHistoryLength);
        this.conversations.set(userId, trimmedHistory);
      }
      
      logger.info('Received response from OpenAI LLM', { userId: userId });
      return llmResponse;

    } catch (error) {
      let errorDetails = { message: error.message };
      if (error.response) { // Axios-style error checking (might not apply fully to openai lib)
          errorDetails.status = error.response.status;
          errorDetails.data = error.response.data;
      } else if (error.status) { // OpenAI library error structure
          errorDetails.status = error.status;
          errorDetails.errorBody = error.error;
      }
      logger.error('Error processing message with OpenAI LLM', errorDetails);
      // Provide a user-friendly error message
      return "I'm experiencing some technical difficulties right now. Could you please share your email and phone number so we can follow up with you directly?";
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