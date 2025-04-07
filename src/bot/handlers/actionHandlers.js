const logger = require('../../utils/logger');
const Contact = require('../../db/models/contact');
const { validateEmail, validatePhone } = require('../../utils/validators');

/**
 * Register all action listeners with the Slack app
 * @param {Object} app - The Slack Bolt app instance
 */
function register(app) {
  // Handle the contact form submission
  app.action('submit_contact', async ({ body, ack, say, client }) => {
    try {
      // Acknowledge the action request
      await ack();
      
      // Extract the values from the submission
      const email = body.state.values.email_block.email_input.value;
      const phone = body.state.values.phone_block.phone_input.value;
      const userId = body.user.id;
      
      // Validate inputs
      let errors = [];
      
      if (!validateEmail(email)) {
        errors.push("Please provide a valid email address");
      }
      
      if (!validatePhone(phone)) {
        errors.push("Please provide a valid phone number");
      }
      
      // If there are validation errors, inform the user
      if (errors.length > 0) {
        const errorMessage = errors.join("\\n");
        await say(`There were some issues with your submission:\\n${errorMessage}\\nPlease try again.`);
        return;
      }
      
      // Get user info
      const userInfo = await client.users.info({
        user: userId
      });
      
      // Save to database
      const newContact = new Contact({
        userId,
        name: userInfo.user.real_name || userInfo.user.name,
        email,
        phone,
        slackTeamId: body.team.id,
        channel: body.channel.id,
        timestamp: new Date()
      });
      
      await newContact.save();
      
      // Confirm submission
      await say(`Thank you! Your contact information has been saved. Our team will reach out to you soon. Here's what we received:\\n• Email: ${email}\\n• Phone: ${phone}`);
      
      logger.info('Contact information saved', { userId, email });
    } catch (error) {
      logger.error('Error handling form submission', { error });
      await say("I'm sorry, there was an error processing your information. Please try again later.");
    }
  });
}

module.exports = { register };