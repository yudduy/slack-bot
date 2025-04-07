const { App } = require('@slack/bolt');
const logger = require('../utils/logger');
const messageHandlers = require('./handlers/messageHandlers');
const actionHandlers = require('./handlers/actionHandlers');
const eventHandlers = require('./handlers/eventHandlers');

// Initialize your app
console.log('Initializing with Socket Mode enabled');

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
  logger: {
    debug: (...args) => logger.debug(...args),
    info: (...args) => logger.info(...args),
    warn: (...args) => logger.warn(...args),
    error: (...args) => logger.error(...args),
    setLevel: () => {},
    getLevel: () => {},
    setName: () => {},
  }
});

// Register all message listeners
messageHandlers.register(app);

// Register all action listeners (buttons, modals, etc.)
actionHandlers.register(app);

// Register all event listeners
eventHandlers.register(app);

module.exports = { app };