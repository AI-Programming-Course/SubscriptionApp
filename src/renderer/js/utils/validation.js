/**
 * Generate a UUID v4
 */
export function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Validate email address
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate URL
 */
export function isValidURL(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate date string
 */
export function isValidDate(dateString) {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
}

/**
 * Validate number
 */
export function isValidNumber(value) {
  return !isNaN(parseFloat(value)) && isFinite(value);
}

/**
 * Validate positive number
 */
export function isPositiveNumber(value) {
  return isValidNumber(value) && parseFloat(value) > 0;
}

/**
 * Validate currency code (ISO 4217)
 */
export function isValidCurrencyCode(code) {
  const currencyCodes = [
    'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'SEK', 'NZD',
    'INR', 'BRL', 'RUB', 'KRW', 'MXN', 'SGD', 'HKD', 'NOK', 'TRY', 'ZAR',
    'DKK', 'PLN', 'THB', 'MYR', 'HUF', 'CZK', 'ILS', 'CLP', 'PHP', 'AED',
    'SAR', 'IDR', 'EGP', 'PKR', 'VND', 'ARS', 'UAH', 'NGN'
  ];
  return currencyCodes.includes(code);
}

/**
 * Sanitize HTML to prevent XSS
 */
export function sanitizeHTML(html) {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
}

/**
 * Validate and sanitize string input
 */
export function sanitizeString(str, maxLength = 255) {
  if (typeof str !== 'string') {
    return '';
  }

  return str
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, ''); // Remove potential HTML tags
}

/**
 * Validate required field
 */
export function isRequired(value) {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  return value !== null && value !== undefined;
}

/**
 * Validate minimum length
 */
export function minLength(value, min) {
  if (typeof value === 'string') {
    return value.length >= min;
  }
  return false;
}

/**
 * Validate maximum length
 */
export function maxLength(value, max) {
  if (typeof value === 'string') {
    return value.length <= max;
  }
  return false;
}

/**
 * Validate value is within range
 */
export function inRange(value, min, max) {
  const num = parseFloat(value);
  return !isNaN(num) && num >= min && num <= max;
}

/**
 * Validate hex color code
 */
export function isValidHexColor(color) {
  return /^#[0-9A-F]{6}$/i.test(color);
}

/**
 * Validate array of specific length
 */
export function isArrayOfLength(arr, length) {
  return Array.isArray(arr) && arr.length === length;
}

/**
 * Validate array has minimum length
 */
export function arrayMinLength(arr, min) {
  return Array.isArray(arr) && arr.length >= min;
}

/**
 * Comprehensive form validation helper
 */
export class FormValidator {
  constructor() {
    this.errors = {};
  }

  validate(field, value, rules) {
    const fieldErrors = [];

    for (const rule of rules) {
      const { type, message, ...params } = rule;

      let isValid = true;

      switch (type) {
        case 'required':
          isValid = isRequired(value);
          break;
        case 'email':
          isValid = isValidEmail(value);
          break;
        case 'url':
          isValid = isValidURL(value);
          break;
        case 'number':
          isValid = isValidNumber(value);
          break;
        case 'positive':
          isValid = isPositiveNumber(value);
          break;
        case 'minLength':
          isValid = minLength(value, params.min);
          break;
        case 'maxLength':
          isValid = maxLength(value, params.max);
          break;
        case 'range':
          isValid = inRange(value, params.min, params.max);
          break;
        case 'custom':
          isValid = params.validator(value);
          break;
        default:
          break;
      }

      if (!isValid) {
        fieldErrors.push(message);
      }
    }

    if (fieldErrors.length > 0) {
      this.errors[field] = fieldErrors;
    }

    return fieldErrors.length === 0;
  }

  isValid() {
    return Object.keys(this.errors).length === 0;
  }

  getErrors() {
    return this.errors;
  }

  getFieldErrors(field) {
    return this.errors[field] || [];
  }

  clear() {
    this.errors = {};
  }
}
