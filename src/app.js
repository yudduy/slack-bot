require('dotenv').config();
const { app } = require('./bot');
const db = require('./db');
const logger = require('./utils/logger');

const port = process.env.PORT || 3000;
const MAX_RETRIES = 5;
const INITIAL_DELAY_MS = 1000;

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

// Function to start the app with retry logic
async function startAppWithRetry(appInstance, currentPort) {
  let retries = 0;
  let delay = INITIAL_DELAY_MS;

  while (retries < MAX_RETRIES) {
    try {
      logger.info(`Attempting to start Slack app (Attempt ${retries + 1}/${MAX_RETRIES})...`);
      // Check token before attempting to start
      if (!process.env.SLACK_APP_TOKEN || !process.env.SLACK_APP_TOKEN.startsWith('xapp-')) {
        logger.error('CRITICAL: Socket Mode requires a valid SLACK_APP_TOKEN starting with "xapp-". Cannot start.');
        process.exit(1); // Exit if token is fundamentally wrong
      }      
      await appInstance.start(currentPort);
      logger.info(`⚡️ Foundess Bot is running successfully on port ${currentPort}`);
      logger.info(`Using Socket Mode: ${appInstance.socketMode ? 'Yes' : 'No'}`);
      
      // Attach diagnostic listeners *after* successful start attempt
      attachSocketModeListeners(appInstance);
      
      return; // Success, exit the function
    } catch (error) {
      logger.error(`Failed to start Slack app on attempt ${retries + 1}`, { error: error.message });

      // Check for the specific unhandled disconnect error OR other connection issues
      const isRetryableError = 
        error.message.includes("Unhandled event 'server explicit disconnect' in state 'connecting'") ||
        error.code === 'ECONNREFUSED' || // Example: Network issue
        error.message.includes('unable_to_socket_mode_start'); // Explicit start failure

      if (isRetryableError && retries < MAX_RETRIES - 1) {
        retries++;
        const backoffDelay = delay * Math.pow(2, retries - 1);
        logger.warn(`Retryable error detected. Retrying in ${backoffDelay / 1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
        // No need to update 'delay' variable here, backoffDelay calculates it directly
      } else {
        // Non-retryable error or max retries reached
        logger.error('CRITICAL: Could not start Slack bot after multiple retries or due to a non-retryable error.', { finalError: error.message, retries });
        if (error.message.includes('server explicit disconnect')) {
            logger.error("Persistent 'server explicit disconnect'. Please verify your SLACK_APP_TOKEN and SLACK_BOT_TOKEN are correct and have the necessary permissions in your Slack App configuration.");
            logger.error("Ensure Socket Mode is enabled and correctly configured under 'Socket Mode' in your Slack app settings.");
        }
        process.exit(1); // Exit after final failure
      }
    }
  }
}

// Function to attach Socket Mode listeners (separated for clarity)
function attachSocketModeListeners(appInstance) {
  if (appInstance.socketMode && appInstance.receiver && appInstance.receiver.client) {
      const smClient = appInstance.receiver.client;
      logger.info('Attaching Socket Mode client event listeners...');

      // Remove potentially duplicate listeners if start is retried (though ideally start fails before listeners attach)
      smClient.removeAllListeners('connecting');
      smClient.removeAllListeners('connected');
      smClient.removeAllListeners('reconnecting');
      smClient.removeAllListeners('disconnecting');
      smClient.removeAllListeners('disconnected');
      smClient.removeAllListeners('error');
      smClient.removeAllListeners('unable_to_socket_mode_start');

      smClient.on('connecting', () => {
        logger.info('Socket Mode client state: Connecting...');
      });

      smClient.on('connected', () => {
        logger.info('Socket Mode client state: Connected');
      });

      smClient.on('reconnecting', () => {
        logger.info('Socket Mode client state: Reconnecting...');
      });

      smClient.on('disconnecting', () => {
        logger.info('Socket Mode client state: Disconnecting...');
      });

      smClient.on('disconnected', (event) => {
        logger.warn('Socket Mode client state: Disconnected', { code: event?.code, reason: event?.reason, wasClean: event?.wasClean });
        // Optional: Trigger a restart/exit or more sophisticated recovery here if disconnects are frequent/unclean
      });

      smClient.on('error', (error) => {
        // Log the error message and pass the error object in metadata
        logger.error('Socket Mode client error', { error: error }); 
        if (error.message.includes("server explicit disconnect")) {
           logger.error("Socket Mode received 'server explicit disconnect' while running. This could be due to token revocation, Slack maintenance, or intermittent issues.");
        }
        // Potentially trigger reconnection logic or process exit depending on the error
      });

      smClient.on('unable_to_socket_mode_start', (error) => {
        logger.error('Socket Mode client: Event ' + 'unable_to_socket_mode_start' + ' received.', { error });
        // This often indicates configuration issues (e.g., bad app token)
        // Consider exiting the process here as retries might not help
        process.exit(1);
      });
      
      logger.info('Socket Mode client event listeners attached successfully.');
    } else if (appInstance.socketMode) {
      logger.warn('Socket Mode is enabled, but receiver.client was not found to attach listeners.');
    }
}

// Main application startup logic using the retry function
(async () => {
  // DB Connection logic remains here
  try {
    await db.connect();
    logger.info('Successfully connected to MongoDB');
  } catch (err) {
    logger.warn('Failed to connect to MongoDB. Contact information will be stored in memory only.');
    logger.warn('Ensure MongoDB is running or configure connection details properly.');
  }

  // Start the app using the retry wrapper
  await startAppWithRetry(app, port);
  
})(); // Removed the redundant try/catch around the IIFE itself, error handling is inside startAppWithRetry