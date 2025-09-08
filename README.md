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
├── view-contacts.js      # Utility script to view collected contacts
├── src/                  # Source code directory
│   ├── app.js            # Main application entry point
│   ├── bot/              # Bot logic and handlers
│   │   ├── index.js      # Bot initialization and configuration
│   │   ├── handlers/     # Event and interaction handlers
│   │   │   ├── messageHandlers.js  # Text message processing
│   │   │   ├── actionHandlers.js   # Button clicks and form submissions
│   │   │   └── eventHandlers.js    # Slack workspace events
│   │   └── conversations/  # Conversation flow definitions
│   │       └── contactInfoFlow.js  # Contact collection workflows
│   ├── db/               # Database layer
│   │   ├── index.js      # Database connection management
│   │   ├── memoryStorage.js # In-memory fallback storage
│   │   └── models/       # Data models and schemas
│   │       └── contact.js # Contact information model
│   ├── services/         # External service integrations
│   │   └── llmService.js # AI/LLM service (OpenAI integration)
│   └── utils/            # Utility modules
│       ├── contactExtractor.js # Contact info extraction logic
│       ├── logger.js     # Logging configuration
│       └── validators.js # Input validation utilities
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

### 3. Customize the Bot Personality
Edit `src/services/llmService.js` to customize your bot's conversation style and behavior.

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