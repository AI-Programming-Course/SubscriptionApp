/**
 * Format date to localized string
 */
export function formatDate(date, format = 'medium') {
  const d = new Date(date);

  if (isNaN(d)) {
    return 'Invalid Date';
  }

  const options = {
    short: { month: 'numeric', day: 'numeric', year: '2-digit' },
    medium: { month: 'short', day: 'numeric', year: 'numeric' },
    long: { month: 'long', day: 'numeric', year: 'numeric' },
    full: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }
  };

  return d.toLocaleDateString(undefined, options[format] || options.medium);
}

/**
 * Format date for input fields (YYYY-MM-DD)
 */
export function formatDateForInput(date) {
  const d = new Date(date);

  if (isNaN(d)) {
    return '';
  }

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/**
 * Get relative time string (e.g., "in 3 days", "2 days ago")
 */
export function getRelativeTime(date) {
  const d = new Date(date);
  const now = new Date();
  const diff = d - now;
  const absDiff = Math.abs(diff);

  const seconds = Math.floor(absDiff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  const isPast = diff < 0;
  const prefix = isPast ? '' : 'in ';
  const suffix = isPast ? ' ago' : '';

  if (years > 0) {
    return `${prefix}${years} year${years > 1 ? 's' : ''}${suffix}`;
  }
  if (months > 0) {
    return `${prefix}${months} month${months > 1 ? 's' : ''}${suffix}`;
  }
  if (weeks > 0) {
    return `${prefix}${weeks} week${weeks > 1 ? 's' : ''}${suffix}`;
  }
  if (days > 0) {
    return `${prefix}${days} day${days > 1 ? 's' : ''}${suffix}`;
  }
  if (hours > 0) {
    return `${prefix}${hours} hour${hours > 1 ? 's' : ''}${suffix}`;
  }
  if (minutes > 0) {
    return `${prefix}${minutes} minute${minutes > 1 ? 's' : ''}${suffix}`;
  }

  return 'just now';
}

/**
 * Calculate days between two dates
 */
export function daysBetween(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diff = d2 - d1;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * Add days to a date
 */
export function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Add months to a date
 */
export function addMonths(date, months) {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

/**
 * Add years to a date
 */
export function addYears(date, years) {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() + years);
  return result;
}

/**
 * Get start of day
 */
export function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Get end of day
 */
export function endOfDay(date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

/**
 * Get start of month
 */
export function startOfMonth(date) {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Get end of month
 */
export function endOfMonth(date) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + 1);
  d.setDate(0);
  d.setHours(23, 59, 59, 999);
  return d;
}

/**
 * Get start of year
 */
export function startOfYear(date) {
  const d = new Date(date);
  d.setMonth(0);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Get end of year
 */
export function endOfYear(date) {
  const d = new Date(date);
  d.setMonth(11);
  d.setDate(31);
  d.setHours(23, 59, 59, 999);
  return d;
}

/**
 * Check if date is today
 */
export function isToday(date) {
  const d = new Date(date);
  const today = new Date();

  return d.getDate() === today.getDate() &&
         d.getMonth() === today.getMonth() &&
         d.getFullYear() === today.getFullYear();
}

/**
 * Check if date is in the past
 */
export function isPast(date) {
  return new Date(date) < new Date();
}

/**
 * Check if date is in the future
 */
export function isFuture(date) {
  return new Date(date) > new Date();
}

/**
 * Check if date is within range
 */
export function isWithinRange(date, startDate, endDate) {
  const d = new Date(date);
  const start = new Date(startDate);
  const end = new Date(endDate);

  return d >= start && d <= end;
}

/**
 * Get month name
 */
export function getMonthName(monthIndex) {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return months[monthIndex];
}

/**
 * Get day name
 */
export function getDayName(dayIndex) {
  const days = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday',
    'Thursday', 'Friday', 'Saturday'
  ];

  return days[dayIndex];
}

/**
 * Parse billing cycle and return next date
 */
export function calculateNextBillingDate(currentDate, billingCycle) {
  const date = new Date(currentDate);
  const { type, customDays } = billingCycle;

  switch (type) {
    case 'daily':
      return addDays(date, 1);
    case 'weekly':
      return addDays(date, 7);
    case 'monthly':
      return addMonths(date, 1);
    case 'quarterly':
      return addMonths(date, 3);
    case 'yearly':
      return addYears(date, 1);
    case 'custom':
      return addDays(date, customDays || 30);
    default:
      return addMonths(date, 1);
  }
}
