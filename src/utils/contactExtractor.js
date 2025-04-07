/**
 * Utility to extract contact information from conversation messages
 */

const logger = require('./logger');

/**
 * Format phone number to standard (XXX)XXX-XXXX format for database storage
 * @param {string} phoneNumber - The raw phone number
 * @returns {string} - Formatted phone number
 */
function formatPhoneForDatabase(phoneNumber) {
  if (!phoneNumber) return null;
  
  // Extract just the digits
  const digits = phoneNumber.replace(/\D/g, '');
  
  // For 10-digit US numbers, format as (XXX)XXX-XXXX
  if (digits.length === 10) {
    return `(${digits.substring(0, 3)})${digits.substring(3, 6)}-${digits.substring(6, 10)}`;
  }
  
  // For other formats, just return as is
  return phoneNumber;
}

/**
 * Tries to extract an email address from a message
 * @param {string} text - The message text to analyze
 * @returns {string|null} - The extracted email or null if none found
 */
function extractEmail(text) {
  if (!text) return null;
  
  // Special case for "mailto:" links that Slack might generate
  if (text.includes('mailto:')) {
    const mailtoRegex = /mailto:([^\s]+@[^\s]+\.[^\s]+)/gi;
    const matches = text.match(mailtoRegex);
    if (matches && matches.length > 0) {
      // Extract just the email part without the mailto:
      return matches[0].replace('mailto:', '').trim();
    }
  }
  
  // General email pattern
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
  const matches = text.match(emailRegex);
  
  if (matches && matches.length > 0) {
    // Basic validation to ensure it has domain parts
    const email = matches[0].trim();
    if (email.split('@').length === 2 && email.split('.').length >= 2) {
      return email;
    }
  }
  
  // Look for separated email parts (e.g., "username at domain dot com")
  if (text.toLowerCase().includes('at') && text.toLowerCase().includes('dot')) {
    const atParts = text.toLowerCase().split('at');
    if (atParts.length > 1) {
      const dotParts = atParts[1].split('dot');
      if (dotParts.length > 1) {
        const username = atParts[0].trim();
        const domain = dotParts[0].trim();
        const tld = dotParts[1].trim();
        if (username && domain && tld) {
          return `${username}@${domain}.${tld}`;
        }
      }
    }
  }
  
  // Last resort: if the string contains both @ and . symbols
  if (text.includes('@') && text.includes('.')) {
    const atSplit = text.split('@');
    if (atSplit.length === 2 && atSplit[1].includes('.')) {
      const username = atSplit[0].trim();
      const domainPart = atSplit[1].trim();
      if (username && domainPart) {
        return `${username}@${domainPart}`;
      }
    }
  }
  
  return null;
}

/**
 * Tries to extract a phone number from a message
 * @param {string} text - The message text to analyze
 * @returns {string|null} - The extracted phone number or null if none found
 */
function extractPhone(text) {
  if (!text) return null;
  
  // Special case: Check if the message is just a simple phone number with hyphens
  if (/^\d{3}-\d{3}-\d{4}$/.test(text.trim())) {
    return text.trim();
  }
  
  // Special case: Numbers with parentheses
  if (/^\(\d{3}\)\s*\d{3}-\d{4}$/.test(text.trim()) || 
      /^\(\d{3}\)\d{3}-\d{4}$/.test(text.trim()) ||
      /^\(\d{3}\)\s*\d{3}\s*\d{4}$/.test(text.trim())) {
    // Convert to standard format
    const digits = text.replace(/\D/g, '');
    if (digits.length >= 10) {
      return `${digits.substring(0, 3)}-${digits.substring(3, 6)}-${digits.substring(6, 10)}`;
    }
  }
  
  // Check for just digits (e.g., "5551234567")
  if (/^\d{10}$/.test(text.trim())) {
    const digits = text.trim();
    return `${digits.substring(0, 3)}-${digits.substring(3, 6)}-${digits.substring(6, 10)}`;
  }
  
  // Phone regex patterns - handles various formats
  const phonePatterns = [
    // Standard formats: 555-123-4567, (555) 123-4567, 555.123.4567
    /(\+\d{1,3}[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g,
    // International format: +1 555 123 4567
    /\+\d{1,3}\s\d{1,3}\s\d{3,4}\s\d{4}/g,
    // Simple digits only: 5551234567
    /\b\d{7,15}\b/g,
    // Format with dots: 555.123.4567
    /\d{3}\.\d{3}\.\d{4}/g,
    // Format with spaces: 555 123 4567
    /\d{3}\s\d{3}\s\d{4}/g
  ];
  
  for (const pattern of phonePatterns) {
    const matches = text.match(pattern);
    if (matches && matches.length > 0) {
      // Extra validation - must have at least 7 digits
      const digits = matches[0].replace(/\D/g, '');
      if (digits.length >= 7) {
        // Format consistently if it's a 10-digit US number
        if (digits.length === 10) {
          return `${digits.substring(0, 3)}-${digits.substring(3, 6)}-${digits.substring(6, 10)}`;
        }
        return matches[0].trim();
      }
    }
  }
  
  // Check for phone number written in words (e.g., "five five five one two three four five six seven")
  const numberWords = {
    'zero': '0', 'one': '1', 'two': '2', 'three': '3', 'four': '4',
    'five': '5', 'six': '6', 'seven': '7', 'eight': '8', 'nine': '9'
  };
  
  const words = text.toLowerCase().split(/\s+/);
  if (words.length >= 7) {
    const digits = words
      .map(word => numberWords[word] || '')
      .join('')
      .replace(/[^0-9]/g, '');
    
    if (digits.length >= 10) {
      return `${digits.substring(0, 3)}-${digits.substring(3, 6)}-${digits.substring(6, 10)}`;
    }
  }
  
  return null;
}

/**
 * Process a message to extract contact information
 * @param {string} text - The message text
 * @returns {Object} - Object with extracted email and phone properties
 */
function processMessage(text) {
  try {
    const email = extractEmail(text);
    const phone = extractPhone(text);
    
    // If phone number was found, format it for database storage
    const formattedPhone = phone ? formatPhoneForDatabase(phone) : null;
    
    return {
      email,
      phone: formattedPhone,
      hasContactInfo: !!(email || formattedPhone),
      needsClarification: !email && !formattedPhone
    };
  } catch (error) {
    logger.error('Error extracting contact information', { error });
    return {
      email: null,
      phone: null,
      hasContactInfo: false,
      needsClarification: true
    };
  }
}

module.exports = {
  processMessage,
  extractEmail,
  extractPhone,
  formatPhoneForDatabase
};