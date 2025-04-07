const logger = require('../../utils/logger');

/**
 * Start the contact information collection flow
 * @param {Function} say - The Slack say function to send messages
 */
async function startCollection(say) {
  try {
    await say({
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "Great! I'd like to collect your contact information so our team can reach out to you."
          }
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "Please provide your email and phone number using the form below:"
          }
        },
        {
          type: "input",
          block_id: "email_block",
          element: {
            type: "plain_text_input",
            action_id: "email_input",
            placeholder: {
              type: "plain_text",
              text: "you@example.com"
            }
          },
          label: {
            type: "plain_text",
            text: "Email Address"
          }
        },
        {
          type: "input",
          block_id: "phone_block",
          element: {
            type: "plain_text_input",
            action_id: "phone_input",
            placeholder: {
              type: "plain_text",
              text: "+1 (555) 123-4567"
            }
          },
          label: {
            type: "plain_text",
            text: "Phone Number"
          }
        },
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: {
                type: "plain_text",
                text: "Submit",
                emoji: true
              },
              style: "primary",
              action_id: "submit_contact"
            }
          ]
        }
      ]
    });
  } catch (error) {
    logger.error('Error starting contact collection flow', { error });
    await say("I'm sorry, I encountered an error while trying to show the contact form. Please try again later.");
  }
}

module.exports = { startCollection };