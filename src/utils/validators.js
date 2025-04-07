/**
 * Validate an email address
 * @param {string} email - The email address to validate
 * @returns {boolean} - Whether the email is valid
 */
function validateEmail(email) {
  if (!email) return false;
  
  // Standard email validation regex
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email.trim());
}

/**
 * Validate a phone number
 * @param {string} phone - The phone number to validate
 * @returns {boolean} - Whether the phone number is valid
 */
function validatePhone(phone) {
  if (!phone) return false;
  
  // Clean the phone number - remove all non-digits
  const digits = phone.replace(/\D/g, '');
  
  // Simple check: must have at least 10 digits (standard US number)
  // Allow for international numbers (up to 15 digits)
  // This is a very lenient validation to accommodate various formats
  return digits.length >= 7 && digits.length <= 15;
}

module.exports = {
  validateEmail,
  validatePhone
};