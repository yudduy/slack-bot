# Foundess Ambassador Slack Bot

A conversational Slack bot that acts as an ambassador for Foundess, engaging users in natural conversation while collecting their contact information (email and phone) for future outreach.

## Features

- Acts as a Foundess company ambassador and proactively asks for contact information
- Automatically extracts email and phone numbers from conversation
- Fully conversational using a free, locally-hosted LLM (Ollama)
- Engages in natural conversation on any topic with users
- Validates input data
- Stores contact information in MongoDB
- Ready for future integration with voice agent calling functionality

## Project Structure

```
foundess-slack-bot/
├── .env                  # Environment variables
├── .gitignore            # Git ignore file
├── package.json          # Project dependencies
├── src/                  # Source code directory
│   ├── app.js            # Main application entry point
│   ├── bot/              # Bot logic
│   │   ├── index.js      # Bot initialization
│   │   ├── handlers/     # Message and event handlers
│   │   │   ├── messageHandlers.js  # Handle text messages
│   │   │   ├── actionHandlers.js   # Handle button clicks, form submissions
│   │   │   └── eventHandlers.js    # Handle Slack events
│   │   └── conversations/  # Conversation flows
│   │       └── contactInfoFlow.js  # Contact info collection flow
│   ├── db/               # Database connections and models
│   │   ├── index.js      # DB initialization
│   │   └── models/       # Data models
│   │       └── contact.js # Contact model
│   └── utils/            # Utility functions
│       ├── logger.js     # Logging utility
│       └── validators.js # Input validation (email, phone)
└── logs/                 # Log files (generated at runtime)
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

### Setting up Hyperbolic (for conversational AI)

This bot uses Hyperbolic.xyz, a cloud-based LLM provider, to provide conversational abilities:

1. Create an account at [Hyperbolic.xyz](https://app.hyperbolic.xyz)
2. Get your API key from the dashboard
3. Update your `.env` file with the API key:
   ```
   HYPERBOLIC_API_KEY=your-api-key-here
   ```

> Note: You can use different models by changing the `HYPERBOLIC_MODEL` in your `.env` file. Options include `llama-3-70b-chat`, `mixtral-8x7b-instruct`, `claude-3-haiku`, etc. Check the [Models page](https://app.hyperbolic.xyz/models) for current offerings.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Add your Hyperbolic API key to .env file
# Get your API key from app.hyperbolic.xyz

# 3. Start the bot (in development mode)
npm run dev
```

## Installation

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Update the `.env` file with your Slack credentials and Hyperbolic API key
4. Start the application:
   ```
   npm start
   ```
   or for development with auto-restart:
   ```
   npm run dev
   ```

## Future Expansion

The project is structured to allow for future expansion, particularly for:

1. Integrating with a voice agent system to automatically call collected phone numbers
2. Enhancing the conversation flow with AI-powered responses
3. Adding an admin dashboard for managing collected contacts
4. Setting up scheduled follow-ups based on user interactions

## License

MIT