/**
 * Bot Configuration
 * 
 * This file contains customizable settings for your contact collection bot.
 * Modify these values to adapt the bot to your specific use case.
 */

module.exports = {
  // Bot personality and messaging
  botName: "Contact Collector Bot",
  
  // Conversation settings
  conversation: {
    // Maximum conversation history to keep in memory (number of messages)
    maxHistoryLength: 10,
    
    // Whether to include user's first name in conversations
    useFirstName: true,
    
    // Default greeting message when no user name is available
    defaultGreeting: "there",
  },
  
  // Contact collection settings
  collection: {
    // Required fields - at least one of these must be provided
    requiredFields: ['email', 'phone'],
    
    // Optional fields you can extend the bot to collect
    optionalFields: ['name', 'company', 'role'],
    
    // Whether to validate contact information before saving
    validateBeforeSaving: true,
  },
  
  // LLM settings
  llm: {
    // Model to use (can be overridden by OPENAI_MODEL env var)
    defaultModel: 'gpt-4o',
    
    // Default temperature for responses (0.0 = deterministic, 1.0 = creative)
    temperature: 0.7,
    
    // Maximum tokens in response
    maxTokens: 300,
  },
  
  // Database settings
  database: {
    // Default database name if not specified in env
    defaultDbName: 'contact-bot',
    
    // Whether to use in-memory storage as fallback
    allowMemoryFallback: true,
  },
  
  // Logging settings
  logging: {
    // Default log level if not specified in env
    defaultLevel: 'info',
    
    // Whether to log contact information (be careful with privacy)
    logContactInfo: false,
  }
};
