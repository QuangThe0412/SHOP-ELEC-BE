/**
 * Validate email format
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * At least 6 characters
 */
const isValidPassword = (password) => {
  return password && password.length >= 6;
};

/**
 * Validate phone number (Vietnamese format)
 */
const isValidPhone = (phone) => {
  const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
  return phoneRegex.test(phone);
};

/**
 * Validate required fields
 */
const validateRequiredFields = (fields, requiredFields) => {
  const missing = [];
  for (const field of requiredFields) {
    if (!fields[field] || fields[field].toString().trim() === '') {
      missing.push(field);
    }
  }
  return missing.length > 0 ? missing : null;
};

module.exports = {
  isValidEmail,
  isValidPassword,
  isValidPhone,
  validateRequiredFields
};
