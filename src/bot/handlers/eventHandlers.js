const logger = require('../../utils/logger');

/**
 * Register all event listeners with the Slack app
 * @param {Object} app - The Slack Bolt app instance
 */
function register(app) {
  // Handle app_mention events (when someone @mentions the bot in a channel)
  app.event('app_mention', async ({ event, say }) => {
    try {
      await say({
        text: `Hi <@${event.user}>! I'm here to help collect contact information. If you'd like to share your details, just say "contact" or send me a direct message.`,
        thread_ts: event.ts
      });
    } catch (error) {
      logger.error('Error handling app_mention event', { error });
    }
  });

  // Handle app_home_opened event (when someone opens a DM with the bot)
  app.event('app_home_opened', async ({ event, client }) => {
    try {
      // Publish a welcome message in the Home tab
      await client.views.publish({
        user_id: event.user,
        view: {
          type: 'home',
          blocks: [
            {
              type: 'header',
              text: {
                type: 'plain_text',
                text: 'Welcome to the Contact Collector Bot! 👋',
                emoji: true
              }
            },
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: "I'm here to help collect your contact information so our team can reach out to you."
              }
            },
            {
              type: 'divider'
            },
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: '*How to use this bot:*\n• Say "hello" to get started\n• Say "contact" to share your contact information\n• Say "help" to see these instructions again'
              }
            }
          ]
        }
      });
    } catch (error) {
      logger.error('Error handling app_home_opened event', { error });
    }
  });
}

module.exports = { register };