# Conversational Contact Collection Slack Bot Framework

An open-source, customizable Slack bot framework for building conversational bots that can collect contact information while engaging users in natural conversation. Perfect for lead generation, customer outreach, or any scenario where you need to gather user contact details through friendly interaction.

## Features

- **Conversational AI**: Powered by OpenAI's GPT models for natural, engaging conversations
- **Smart Contact Extraction**: Automatically detects and extracts email addresses and phone numbers from user messages
- **Flexible Storage**: Supports both MongoDB for persistent storage and in-memory storage for development
- **Easy Customization**: Simple configuration to adapt the bot's personality and conversation flow
- **Contact Management**: Built-in contact viewing and management utilities
- **Robust Error Handling**: Graceful fallbacks and comprehensive logging
- **Production Ready**: Socket Mode support with retry logic and connection management

## Project Structure

```
slack-bot-framework/
├── .env.example          # Environment variables template
├── .gitignore            # Git ignore file
├── package.json          # Project dependencies
├── README.md             # This file
├── CUSTOMIZATION.md      # Detailed customization guide with examples
├── view-contacts.js      # Utility script to view collected contacts
├── src/                  # Source code directory
│   ├── app.js            # Main application entry point
│   ├── config/           # Configuration files
│   │   └── botConfig.js  # Customizable bot settings and defaults
│   ├── bot/              # Bot logic and handlers
│   │   ├── index.js      # Bot initialization and Slack app setup
│   │   ├── handlers/     # Event and interaction handlers
│   │   │   ├── messageHandlers.js  # Text message processing and LLM integration
│   │   │   ├── actionHandlers.js   # Button clicks and form submissions
│   │   │   └── eventHandlers.js    # Slack workspace events and mentions
│   │   └── conversations/  # Conversation flow definitions
│   │       └── contactInfoFlow.js  # Contact collection form workflows
│   ├── db/               # Database layer
│   │   ├── index.js      # MongoDB connection management
│   │   ├── memoryStorage.js # In-memory fallback storage for development
│   │   └── models/       # Data models and schemas
│   │       └── contact.js # Contact information model with validation
│   ├── services/         # External service integrations
│   │   └── llmService.js # OpenAI GPT integration for conversations
│   └── utils/            # Utility modules
│       ├── contactExtractor.js # Smart contact info extraction from text
│       ├── logger.js     # Winston-based logging configuration
│       └── validators.js # Email and phone validation utilities
└── logs/                 # Application logs (auto-generated)
```

## Setup Instructions

### Setting up the Slack App

1. Create a Slack app at [api.slack.com/apps](https://api.slack.com/apps)
2. Configure Event Subscriptions
   - Enable Events
   - Set Request URL: `https://your-app-url.com/slack/events`
   - Subscribe to bot events: `message.im`, `message.channels`, `app_mention`
3. Configure Interactive Components
   - Enable Interactivity
   - Set Request URL: `https://your-app-url.com/slack/events`
4. Add OAuth Scopes under "OAuth & Permissions"
   - `chat:write`
   - `im:history`
   - `channels:history`
   - `app_mentions:read`
   - `users:read`
   - `users:read.email`
5. Install the app to your workspace
6. Copy the Bot Token and Signing Secret to your `.env` file

### Setting up OpenAI for Conversational AI

This framework uses OpenAI's GPT models to power natural conversations:

1. Create an account at [OpenAI](https://platform.openai.com)
2. Generate an API key from your dashboard
3. Add the API key to your `.env` file:
   ```
   OPENAI_API_KEY=your-api-key-here
   ```

> **Model Configuration**: You can customize the AI model by setting `OPENAI_MODEL` in your `.env` file. The default is `gpt-4o`, but you can use `gpt-3.5-turbo`, `gpt-4`, or other available models based on your needs and budget.

### Setting up MongoDB (Optional)

For persistent contact storage, you can configure MongoDB:

1. **Local MongoDB**: Install MongoDB locally or use MongoDB Atlas (cloud)
2. **Connection String**: Add your MongoDB connection details to `.env`:
   ```
   MONGODB_URI=mongodb://localhost:27017
   DB_NAME=your-bot-database
   ```

> **Note**: If MongoDB is not configured, the bot will automatically fall back to in-memory storage for development purposes.

## Quick Start

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd slack-bot-framework

# 2. Install dependencies
npm install

# 3. Create environment configuration
cp .env.example .env
# Edit .env with your Slack and OpenAI credentials

# 4. Start the bot (development mode with auto-restart)
npm run dev
```

## Installation & Configuration

### 1. Clone and Install
```bash
git clone <your-repo-url>
cd slack-bot-framework
npm install
```

### 2. Environment Configuration
Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

Required environment variables:
```env
# Slack Configuration
SLACK_BOT_TOKEN=xoxb-your-bot-token
SLACK_APP_TOKEN=xapp-your-app-token
SLACK_SIGNING_SECRET=your-signing-secret

# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-4o

# MongoDB Configuration (Optional)
MONGODB_URI=mongodb://localhost:27017
DB_NAME=your-bot-database

# Application Settings
PORT=3000
```

### 3. Customize the Bot (Important!)
Before deploying, customize the bot for your specific use case:

- **Quick Setup**: Edit the system prompt in `src/services/llmService.js`
- **Advanced Setup**: Modify settings in `src/config/botConfig.js`
- **Detailed Guide**: See [CUSTOMIZATION.md](CUSTOMIZATION.md) for examples and advanced options

### 4. Start the Application
```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

### 5. View Collected Contacts
```bash
# Run the contact viewer utility
node view-contacts.js
```

## Customization Guide

### Bot Personality & Conversation Flow
The bot's personality is defined in `src/services/llmService.js`. Key areas you can customize:

- **System Prompt**: Modify the `systemContent` variable to change how your bot introduces itself and behaves
- **Conversation Goals**: Adjust what information the bot tries to collect
- **Response Style**: Change the tone, formality, and approach of conversations

### Contact Information Extraction
Customize what contact information to extract in `src/utils/contactExtractor.js`:

- **Email Patterns**: Modify regex patterns for email detection
- **Phone Formats**: Adjust phone number recognition and formatting
- **Additional Fields**: Extend to capture other information (LinkedIn, company, etc.)

### Data Storage
Extend the contact model in `src/db/models/contact.js`:

- **Additional Fields**: Add new fields like company, role, or custom notes
- **Validation Rules**: Implement custom validation for your specific needs
- **Indexing**: Optimize database queries with appropriate indexes

## Data Privacy & Compliance

**Important Notice**: This project collects personally identifiable information (PII) including email addresses and phone numbers. Organizations using this framework must ensure compliance with applicable privacy laws such as GDPR, CCPA, and other data protection regulations.

### Consent Requirements
- **Explicit Consent**: Always obtain clear, informed consent before collecting any contact information
- **Purpose Disclosure**: Clearly explain how the collected data will be used
- **Opt-in Process**: Implement affirmative consent mechanisms rather than pre-checked boxes

### Data Collection Best Practices
- **Minimal Data**: Only collect contact information that is necessary for your specific use case
- **Clear Purpose**: Inform users exactly why you're collecting their information
- **Voluntary Participation**: Make it clear that providing contact information is optional

### Data Security & Storage
- **Encryption**: Implement encryption for data at rest and in transit
- **Access Controls**: Use role-based access controls to limit who can view contact information
- **Audit Logging**: Maintain logs of who accesses contact data and when
- **Secure Infrastructure**: Deploy on secure, regularly updated infrastructure

### Data Retention & Management
- **Retention Policy**: Define and enforce clear data retention periods
- **Regular Cleanup**: Implement automated processes to delete expired data
- **Data Minimization**: Regularly review and remove unnecessary personal data

### User Rights & Data Requests
Organizations must provide users with:
- **Access Rights**: Allow users to request copies of their stored data
- **Correction Rights**: Enable users to update or correct their information
- **Deletion Rights**: Provide a clear process for users to request data deletion
- **Portability Rights**: Where applicable, allow users to export their data

### Recommended Implementation
1. Add privacy notices to your bot's initial interactions
2. Implement consent tracking in your data models
3. Create administrative tools for handling data subject requests
4. Establish data retention schedules and automated cleanup
5. Regular privacy impact assessments and compliance audits

> **Legal Disclaimer**: This framework provides technical capabilities only. Organizations are responsible for ensuring their specific implementation complies with all applicable privacy laws and regulations in their jurisdiction.

## Example Use Cases

- **Lead Generation**: Collect potential customer information at events or webinars
- **Customer Support**: Gather contact details for follow-up assistance
- **Event Registration**: Collect attendee information for events or workshops
- **Newsletter Signup**: Build email lists through conversational engagement
- **Sales Qualification**: Gather prospect information through natural conversation

## Extending the Framework

This framework is designed to be extensible. Common extensions include:

1. **Additional LLM Providers**: Support for Anthropic Claude, local models, etc.
2. **CRM Integration**: Connect to Salesforce, HubSpot, or other CRM systems
3. **Email Automation**: Trigger email sequences based on collected information
4. **Analytics Dashboard**: Track conversation metrics and contact collection rates
5. **Multi-language Support**: Extend conversations to multiple languages

## License

MIT