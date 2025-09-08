# Customization Guide

This guide will help you customize the contact collection bot for your specific needs.

## Quick Customization Checklist

### 1. Bot Personality (Required)
Edit `src/services/llmService.js` and modify the `systemContent` variable to change:
- Bot's name and introduction
- What information to collect
- Conversation style and tone
- Specific questions to ask

### 2. Configuration Settings
Edit `src/config/botConfig.js` to adjust:
- Bot name and messaging
- Required/optional contact fields
- LLM model settings
- Database preferences

### 3. Contact Information
Modify what contact info to collect by editing:
- `src/utils/contactExtractor.js` - Add new extraction patterns
- `src/db/models/contact.js` - Add new database fields
- `src/config/botConfig.js` - Update required/optional fields

## Detailed Customization Examples

### Example 1: Event Registration Bot

**Use Case**: Collect attendee information for an event

```javascript
// In src/services/llmService.js, modify systemContent:
let systemContent = `You are an event registration assistant for TechConf 2024. You are speaking with ${firstName}.

Your goal is to collect their registration information: full name, email, company, and dietary restrictions.

**Initial Interaction:**
- Greet them enthusiastically about TechConf 2024
- Explain you need their info to complete registration
- Example: "Hi ${firstName}! Excited to have you at TechConf 2024! To complete your registration, I'll need your email, company name, and any dietary restrictions."

**Information to Collect:**
1. Email address (required)
2. Company name (required)  
3. Dietary restrictions (optional)

Keep the conversation focused on the event and be enthusiastic about their attendance!`;
```

```javascript
// In src/config/botConfig.js:
module.exports = {
  botName: "TechConf 2024 Registration Bot",
  collection: {
    requiredFields: ['email', 'company'],
    optionalFields: ['dietaryRestrictions'],
  },
  // ... other settings
};
```

### Example 2: Lead Generation Bot

**Use Case**: Qualify sales leads

```javascript
// In src/services/llmService.js:
let systemContent = `You are a sales assistant for CloudSolutions Inc. You are speaking with ${firstName}.

Your goal is to qualify them as a potential customer by collecting: email, phone, company size, and current challenges.

**Conversation Approach:**
- Be professional but friendly
- Ask about their business challenges first
- Position the information collection as "getting them the right solutions"
- Example: "Hi ${firstName}! I'm here to help you find the right cloud solutions. To recommend the best fit, could you tell me about your company and current challenges?"

**Information Priority:**
1. Business challenges (to build rapport)
2. Company size and industry
3. Email and phone for follow-up
4. Timeline for implementation

Focus on value and how CloudSolutions can help their specific situation.`;
```

### Example 3: Newsletter Signup Bot

**Use Case**: Build email list with interests

```javascript
// In src/services/llmService.js:
let systemContent = `You are a newsletter subscription assistant for TechInsights Weekly. You are speaking with ${firstName}.

Your goal is to get them subscribed by collecting their email and content preferences.

**Approach:**
- Be enthusiastic about the newsletter content
- Mention popular articles and subscriber benefits
- Make it feel exclusive and valuable
- Example: "Hi ${firstName}! Ready to stay ahead in tech? TechInsights Weekly delivers the best industry insights to 50,000+ professionals. What's your email and what topics interest you most?"

**Information to Collect:**
1. Email address (required)
2. Content interests: AI, Web Dev, DevOps, etc. (optional)
3. Experience level: beginner, intermediate, expert (optional)

Keep it conversational and focus on the value they'll receive!`;
```

## Advanced Customizations

### Adding New Contact Fields

1. **Update the Database Model** (`src/db/models/contact.js`):
```javascript
const contactSchema = new mongoose.Schema({
  // ... existing fields
  company: {
    type: String,
    required: false,
    trim: true
  },
  role: {
    type: String,
    required: false,
    trim: true
  },
  interests: [{
    type: String,
    trim: true
  }]
});
```

2. **Update Contact Extraction** (`src/utils/contactExtractor.js`):
```javascript
// Add new extraction functions
function extractCompany(text) {
  // Add logic to detect company names
  // Look for patterns like "I work at", "I'm from", etc.
}

function processMessage(text) {
  // ... existing code
  const company = extractCompany(text);
  
  return {
    email,
    phone: formattedPhone,
    company,
    hasContactInfo: !!(email || formattedPhone || company),
    // ...
  };
}
```

3. **Update Message Handlers** (`src/bot/handlers/messageHandlers.js`):
```javascript
// In the contact saving section:
const updateData = {};
if (extractedInfo.email) updateData.email = extractedInfo.email;
if (extractedInfo.phone) updateData.phone = extractedInfo.phone;
if (extractedInfo.company) updateData.company = extractedInfo.company;
```

### Integrating with External Services

You can extend the bot to integrate with CRMs, email services, etc.:

```javascript
// Create src/services/crmService.js
class CRMService {
  async createContact(contactData) {
    // Integration with Salesforce, HubSpot, etc.
  }
}

// Then in messageHandlers.js:
const crmService = require('../../services/crmService');

// After saving to database:
if (extractedInfo.hasContactInfo) {
  await crmService.createContact({
    email: extractedInfo.email,
    phone: extractedInfo.phone,
    source: 'slack-bot'
  });
}
```

### Custom Validation Rules

Extend the validators (`src/utils/validators.js`):

```javascript
function validateCompanyEmail(email) {
  // Only allow business emails (no gmail, yahoo, etc.)
  const businessDomains = ['gmail.com', 'yahoo.com', 'hotmail.com'];
  const domain = email.split('@')[1];
  return !businessDomains.includes(domain.toLowerCase());
}

function validatePhoneByRegion(phone, region = 'US') {
  // Region-specific phone validation
  if (region === 'US') {
    return /^\(\d{3}\)\d{3}-\d{4}$/.test(phone);
  }
  // Add other regions as needed
}
```

## Testing Your Customizations

1. **Start with Simple Changes**: Modify the system prompt first
2. **Test Incrementally**: Make one change at a time
3. **Use Development Mode**: Run with `npm run dev` for auto-restart
4. **Check Logs**: Monitor `logs/all.log` for debugging
5. **Test Edge Cases**: Try various input formats

## Best Practices

1. **Keep Conversations Natural**: Avoid making the bot sound robotic
2. **Be Clear About Data Use**: Tell users why you're collecting information
3. **Respect Privacy**: Only collect what you actually need
4. **Test Thoroughly**: Try different conversation flows
5. **Monitor Performance**: Check logs for errors and user experience

## Need Help?

- Check the main README.md for setup instructions
- Review the code comments for implementation details
- Test your changes in a development environment first
- Consider the user experience from start to finish
