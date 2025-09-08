const mongoose = require('mongoose');
const logger = require('../utils/logger');

/**
 * Connect to MongoDB database
 * @returns {Promise} - Resolves when connected, rejects on error
 */
async function connect() {
  return new Promise(async (resolve, reject) => {
    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        dbName: process.env.DB_NAME || 'contact-bot'
      });
      logger.info('Connected to MongoDB');
      resolve();
    } catch (error) {
      logger.error('Failed to connect to MongoDB', { error });
      reject(error);
    }
  });
}

/**
 * Disconnect from MongoDB database
 */
async function disconnect() {
  try {
    await mongoose.disconnect();
    logger.info('Disconnected from MongoDB');
  } catch (error) {
    logger.error('Error disconnecting from MongoDB', { error });
  }
}

module.exports = {
  connect,
  disconnect
};