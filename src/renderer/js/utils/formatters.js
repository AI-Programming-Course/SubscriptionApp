import { formatCurrency, getCurrencySymbol } from './currency-utils.js';
import { formatDate, getRelativeTime } from './date-utils.js';

/**
 * Format subscription billing cycle
 */
export function formatBillingCycle(billingCycle) {
  const { type, customDays } = billingCycle;

  switch (type) {
    case 'daily':
      return 'Daily';
    case 'weekly':
      return 'Weekly';
    case 'monthly':
      return 'Monthly';
    case 'quarterly':
      return 'Quarterly';
    case 'yearly':
      return 'Yearly';
    case 'custom':
      return `Every ${customDays} day${customDays !== 1 ? 's' : ''}`;
    default:
      return type;
  }
}

/**
 * Format percentage
 */
export function formatPercentage(value, decimals = 0) {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format large number with K, M, B suffixes
 */
export function formatNumber(num) {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + 'B';
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

/**
 * Format file size
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Truncate string with ellipsis
 */
export function truncate(str, maxLength = 50) {
  if (str.length <= maxLength) {
    return str;
  }

  return str.slice(0, maxLength - 3) + '...';
}

/**
 * Capitalize first letter
 */
export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Format name to title case
 */
export function titleCase(str) {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => capitalize(word))
    .join(' ');
}

/**
 * Format amount with currency symbol
 */
export function formatAmount(amount, currency = 'USD') {
  return formatCurrency(amount, currency, { decimals: 2 });
}

/**
 * Format subscription status
 */
export function formatStatus(isActive) {
  return isActive ? 'Active' : 'Inactive';
}

/**
 * Format next billing date with relative time
 */
export function formatNextBilling(date) {
  return `${formatDate(date, 'short')} (${getRelativeTime(date)})`;
}

/**
 * Format duration in milliseconds to readable string
 */
export function formatDuration(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}d ${hours % 24}h`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }

  return `${seconds}s`;
}

/**
 * Format phone number
 */
export function formatPhoneNumber(phoneNumber) {
  const cleaned = phoneNumber.replace(/\D/g, '');

  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }

  return phoneNumber;
}

/**
 * Format subscription card display
 */
export function formatSubscriptionCard(subscription) {
  return {
    id: subscription.id,
    name: subscription.name,
    cost: formatAmount(subscription.cost, subscription.currency),
    cycle: formatBillingCycle(subscription.billingCycle),
    nextBilling: formatNextBilling(subscription.nextBillingDate),
    category: subscription.category,
    status: formatStatus(subscription.isActive)
  };
}

/**
 * Format budget progress
 */
export function formatBudgetProgress(spent, budget) {
  const percentage = (spent / budget) * 100;
  const remaining = budget - spent;

  return {
    spent: formatCurrency(spent, 'USD'),
    budget: formatCurrency(budget, 'USD'),
    remaining: formatCurrency(remaining, 'USD'),
    percentage: formatPercentage(percentage)
  };
}

/**
 * Format array to comma-separated list
 */
export function formatList(arr, conjunction = 'and') {
  if (arr.length === 0) return '';
  if (arr.length === 1) return arr[0];
  if (arr.length === 2) return `${arr[0]} ${conjunction} ${arr[1]}`;

  const lastItem = arr[arr.length - 1];
  const otherItems = arr.slice(0, -1);

  return `${otherItems.join(', ')}, ${conjunction} ${lastItem}`;
}

/**
 * Format object to query string
 */
export function toQueryString(obj) {
  return Object.keys(obj)
    .filter(key => obj[key] !== null && obj[key] !== undefined)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`)
    .join('&');
}

/**
 * Parse query string to object
 */
export function parseQueryString(queryString) {
  const params = {};
  const pairs = queryString.replace(/^\?/, '').split('&');

  pairs.forEach(pair => {
    const [key, value] = pair.split('=');
    params[decodeURIComponent(key)] = decodeURIComponent(value || '');
  });

  return params;
}
