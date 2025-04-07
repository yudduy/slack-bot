require('dotenv').config();
const { app } = require('./bot');
const db = require('./db');
const logger = require('./utils/logger');

// Check for Hyperbolic API configuration if LLM is enabled
if (process.env.ENABLE_LLM === 'true') {
  if (!process.env.HYPERBOLIC_API_KEY) {
    logger.warn('LLM features are enabled but HYPERBOLIC_API_KEY is not set in .env file');
    logger.warn('Please set your Hyperbolic API key in the .env file');
    logger.warn('You can get an API key from https://app.hyperbolic.xyz');
  } else {
    logger.info('Hyperbolic API configuration found. LLM features are enabled.');
  }
}

const port = process.env.PORT || 3000;

// Verify database connection
db.connect()
  .then(() => {
    logger.info('Successfully connected to MongoDB');
  })
  .catch(err => {
    logger.warn('Failed to connect to MongoDB. Contact information will be stored in memory only.');
    logger.warn('If you need persistent storage, make sure MongoDB is installed and running.');
    logger.warn('For development, you can continue without MongoDB.');
  });

// Start the app
(async () => {
  try {
    // Check if we have the app token for Socket Mode
    if (!process.env.SLACK_APP_TOKEN || !process.env.SLACK_APP_TOKEN.startsWith('xapp-')) {
      logger.warn('Socket Mode requires a valid SLACK_APP_TOKEN starting with "xapp-"');
      logger.warn('Please check your .env file and make sure Socket Mode is enabled in your Slack app');
    }
    
    await app.start(port);
    logger.info(`⚡️ Foundess Bot is running on port ${port}`);
    logger.info(`Using Socket Mode: ${app.socketMode ? 'Yes' : 'No'}`);
  } catch (error) {
    logger.error('Failed to start Slack bot', { error });
    process.exit(1);
  }
})();