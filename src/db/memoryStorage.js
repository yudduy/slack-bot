/**
 * A simple in-memory storage for contacts when MongoDB is not available
 */
const logger = require('../utils/logger');

class MemoryStorage {
  constructor() {
    this.contacts = [];
    this.connected = true;
    logger.info('Using in-memory storage for contacts');
  }

  /**
   * Find a contact by userId
   * @param {Object} query - The query object
   * @returns {Promise<Object>} - The found contact or null
   */
  async findOne(query) {
    try {
      if (!query.userId) return null;
      return this.contacts.find(contact => contact.userId === query.userId) || null;
    } catch (error) {
      logger.error('Error finding contact in memory storage', { error });
      return null;
    }
  }

  /**
   * Create a new contact model
   * @param {Object} data - The contact data
   * @returns {Object} - The created contact
   */
  async create(data) {
    try {
      const contact = {
        ...data,
        _id: Math.random().toString(36).substring(2, 15),
        createdAt: new Date(),
        updatedAt: new Date(),
        save: async function() {
          this.updatedAt = new Date();
          return this;
        }
      };
      
      this.contacts.push(contact);
      return contact;
    } catch (error) {
      logger.error('Error creating contact in memory storage', { error });
      throw error;
    }
  }
}

module.exports = new MemoryStorage();