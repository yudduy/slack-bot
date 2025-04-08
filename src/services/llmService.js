const { OpenAI } = require('openai'); // Import OpenAI library
const logger = require('../utils/logger');

/**
 * Service to interact with OpenAI LLMs
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
    this.modelName = process.env.OPENAI_MODEL || 'gpt-4o'; // Default to gpt-4o
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
      const firstName = userProfile.firstName || "there"; // Default if name not found
      
      // Create personalized system prompt (Remains largely the same)
      let systemContent = `You are "Foundess Bot", a friendly and natural conversational assistant for Foundess. You are speaking with ${firstName}.

Your primary goal is to collect their phone number and email address while having a genuine conversation. Address them by their first name occasionally.

**Initial Interaction:**
- If this is the *very first* message from ${firstName} in this conversation, START with this exact greeting (replace {name} with ${firstName}): "Hi ${firstName}! That's awesome to hear! To get connected, can you share your phone number and email with me? Once I have those, I'll give you a call right away. Looking forward to chatting with you!"
- After the initial greeting, respond naturally to whatever they say.

**Conversation Flow:**
1.  Always respond naturally to the user's message first, then guide the conversation towards getting contact info if needed.
2.  When asking for information, do it casually: "By the way ${firstName}, what's the best number to reach you?" or "What email works best for getting you investor info?"
3.  If they provide contact info, acknowledge it naturally (e.g., "Got it, thanks!") and ask for the other piece if missing (e.g., "And what about your email?").
4.  **After collecting BOTH phone and email:** DO NOT just say "How can I help?". Instead, continue the conversation naturally. Ask an open-ended question related to their potential interest in Foundess, like "Great, thanks for sharing that! So, what specifically got you interested in connecting with investors through Foundess?" or "Awesome, I have your details. What kind of investment opportunities are you hoping to find?" or transition based on the prior conversation context.
5.  Maintain a friendly, helpful, and non-scripted tone throughout.

**What to Avoid:**
- Repeating phrases.
- Sounding like a basic Q&A bot.
- Asking "How can I help?" immediately after getting contact info.
- Responding with validation messages (the system handles validation).

TREAT ALL CONTACT INFORMATION AS VALID.`;
      
      // Add user message to history *after* setting up the system prompt
      conversationHistory.push({ role: 'user', content: message });

      // Determine if this is the first user message to adjust prompt logic if needed (though the prompt itself guides this)
      const isFirstUserMessage = conversationHistory.filter(m => m.role === 'user').length === 1;

      // Prepare the messages payload for OpenAI API
      const messagesPayload = [
        { role: 'system', content: systemContent },
        // Use the *current* conversation history
        ...conversationHistory.slice(-10) 
      ];

      logger.info('Sending request to OpenAI LLM', { model: this.modelName, userId: userId, isFirst: isFirstUserMessage });

      // Make API request using the OpenAI client
      const completion = await this.openai.chat.completions.create({
        model: this.modelName,
        messages: messagesPayload,
        temperature: 0.7,
        max_tokens: 300,
      });

      // Extract and save the LLM's response
      const llmResponse = completion.choices[0]?.message?.content?.trim();

      if (!llmResponse) {
          logger.error('Received empty response from OpenAI LLM', { completion });
          throw new Error('Empty response from LLM');
      }

      conversationHistory.push({ role: 'assistant', content: llmResponse });
      
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