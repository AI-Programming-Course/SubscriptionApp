/**
 * Application Constants
 */

// Billing Cycle Types
export const BILLING_CYCLES = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
  { value: 'custom', label: 'Custom' }
];

// Default Categories
export const DEFAULT_CATEGORIES = [
  { name: 'Streaming', icon: '📺', color: '#EF4444' },
  { name: 'Software', icon: '💻', color: '#3B82F6' },
  { name: 'Utilities', icon: '⚡', color: '#F59E0B' },
  { name: 'Entertainment', icon: '🎮', color: '#8B5CF6' },
  { name: 'Fitness', icon: '💪', color: '#10B981' },
  { name: 'Music', icon: '🎵', color: '#EC4899' },
  { name: 'News', icon: '📰', color: '#6B7280' },
  { name: 'Cloud Storage', icon: '☁️', color: '#14B8A6' },
  { name: 'Food & Delivery', icon: '🍕', color: '#F97316' },
  { name: 'Other', icon: '📁', color: '#4F46E5' }
];

// Popular Currencies
export const POPULAR_CURRENCIES = [
  'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY',
  'SEK', 'NZD', 'INR', 'BRL', 'RUB', 'KRW', 'MXN'
];

// Chart Colors
export const CHART_COLORS = [
  '#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#3B82F6',
  '#8B5CF6', '#EC4899', '#14B8A6', '#F97316', '#6366F1',
  '#06B6D4', '#84CC16', '#F43F5E', '#A855F7', '#22D3EE'
];

// View Routes
export const ROUTES = {
  DASHBOARD: 'dashboard',
  SUBSCRIPTIONS: 'subscriptions',
  ANALYTICS: 'analytics',
  BUDGET: 'budget',
  SETTINGS: 'settings'
};

// Storage Keys
export const STORAGE_KEYS = {
  SUBSCRIPTIONS: 'subscriptions',
  BUDGETS: 'budgets',
  CATEGORIES: 'categories',
  SETTINGS: 'settings',
  LAST_BACKUP: 'lastBackup'
};

// Toast Types
export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

// Budget Alert Thresholds
export const BUDGET_THRESHOLDS = {
  SUCCESS: 0,
  INFO: 50,
  WARNING: 75,
  DANGER: 90
};

// Date Formats
export const DATE_FORMATS = {
  SHORT: 'short',
  MEDIUM: 'medium',
  LONG: 'long',
  FULL: 'full'
};

// Analytics Periods
export const ANALYTICS_PERIODS = [
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'quarter', label: 'This Quarter' },
  { value: 'year', label: 'This Year' },
  { value: 'all', label: 'All Time' }
];

// Chart Types
export const CHART_TYPES = {
  LINE: 'line',
  BAR: 'bar',
  PIE: 'pie',
  DOUGHNUT: 'doughnut'
};

// Reminder Options (days before renewal)
export const REMINDER_OPTIONS = [
  { value: 1, label: '1 day before' },
  { value: 3, label: '3 days before' },
  { value: 7, label: '1 week before' },
  { value: 14, label: '2 weeks before' },
  { value: 30, label: '1 month before' }
];

// Export Formats
export const EXPORT_FORMATS = {
  JSON: 'json',
  CSV: 'csv'
};

// Theme Options
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  AUTO: 'auto'
};

// Validation Messages
export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_NUMBER: 'Please enter a valid number',
  INVALID_DATE: 'Please enter a valid date',
  POSITIVE_NUMBER: 'Please enter a positive number',
  MIN_LENGTH: 'Minimum length is {min} characters',
  MAX_LENGTH: 'Maximum length is {max} characters'
};

// API Endpoints (for future use)
export const API_ENDPOINTS = {
  EXCHANGE_RATES: 'https://api.frankfurter.app/latest'
};

// App Metadata
export const APP_INFO = {
  NAME: 'Subscription Tracker',
  VERSION: '1.0.0',
  DESCRIPTION: 'Track and manage your subscriptions',
  AUTHOR: 'Your Name',
  GITHUB: 'https://github.com/yourusername/subscription-tracker'
};

// Keyboard Shortcuts
export const KEYBOARD_SHORTCUTS = {
  NEW_SUBSCRIPTION: 'CmdOrCtrl+N',
  SEARCH: 'CmdOrCtrl+F',
  SETTINGS: 'CmdOrCtrl+,',
  CLOSE_MODAL: 'Escape'
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100]
};

// File Size Limits
export const FILE_LIMITS = {
  MAX_IMPORT_SIZE: 10 * 1024 * 1024, // 10 MB
  MAX_EXPORT_SIZE: 50 * 1024 * 1024  // 50 MB
};

// Default Settings
export const DEFAULT_SETTINGS = {
  currency: 'USD',
  theme: 'auto',
  notifications: true,
  reminderDays: [3],
  autoBackup: false
};
