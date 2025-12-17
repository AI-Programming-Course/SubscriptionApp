/**
 * Currency symbols mapping
 */
const CURRENCY_SYMBOLS = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  AUD: 'A$',
  CAD: 'C$',
  CHF: 'CHF',
  CNY: '¥',
  SEK: 'kr',
  NZD: 'NZ$',
  INR: '₹',
  BRL: 'R$',
  RUB: '₽',
  KRW: '₩',
  MXN: 'MX$',
  SGD: 'S$',
  HKD: 'HK$',
  NOK: 'kr',
  TRY: '₺',
  ZAR: 'R',
  DKK: 'kr',
  PLN: 'zł',
  THB: '฿',
  MYR: 'RM',
  HUF: 'Ft',
  CZK: 'Kč',
  ILS: '₪',
  CLP: 'CLP$',
  PHP: '₱',
  AED: 'د.إ',
  SAR: '﷼',
  IDR: 'Rp',
  EGP: '£',
  PKR: '₨',
  VND: '₫',
  ARS: 'ARS$',
  UAH: '₴',
  NGN: '₦'
};

/**
 * Currency names mapping
 */
const CURRENCY_NAMES = {
  USD: 'US Dollar',
  EUR: 'Euro',
  GBP: 'British Pound',
  JPY: 'Japanese Yen',
  AUD: 'Australian Dollar',
  CAD: 'Canadian Dollar',
  CHF: 'Swiss Franc',
  CNY: 'Chinese Yuan',
  SEK: 'Swedish Krona',
  NZD: 'New Zealand Dollar',
  INR: 'Indian Rupee',
  BRL: 'Brazilian Real',
  RUB: 'Russian Ruble',
  KRW: 'South Korean Won',
  MXN: 'Mexican Peso',
  SGD: 'Singapore Dollar',
  HKD: 'Hong Kong Dollar',
  NOK: 'Norwegian Krone',
  TRY: 'Turkish Lira',
  ZAR: 'South African Rand'
};

/**
 * Get currency symbol
 */
export function getCurrencySymbol(currencyCode) {
  return CURRENCY_SYMBOLS[currencyCode] || currencyCode;
}

/**
 * Get currency name
 */
export function getCurrencyName(currencyCode) {
  return CURRENCY_NAMES[currencyCode] || currencyCode;
}

/**
 * Format currency amount
 */
export function formatCurrency(amount, currencyCode = 'USD', options = {}) {
  const {
    showSymbol = true,
    showCode = false,
    decimals = 2,
    locale = undefined
  } = options;

  const formatted = amount.toFixed(decimals);
  const parts = formatted.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  let result = parts.join('.');

  if (showSymbol) {
    const symbol = getCurrencySymbol(currencyCode);
    result = `${symbol}${result}`;
  }

  if (showCode) {
    result = `${result} ${currencyCode}`;
  }

  return result;
}

/**
 * Convert amount between currencies
 */
export function convertCurrency(amount, fromCurrency, toCurrency, exchangeRates) {
  if (fromCurrency === toCurrency) {
    return amount;
  }

  // Try direct conversion
  if (exchangeRates[fromCurrency] && exchangeRates[fromCurrency][toCurrency]) {
    return amount * exchangeRates[fromCurrency][toCurrency];
  }

  // Try inverse conversion
  if (exchangeRates[toCurrency] && exchangeRates[toCurrency][fromCurrency]) {
    return amount / exchangeRates[toCurrency][fromCurrency];
  }

  // Try conversion through USD
  if (fromCurrency !== 'USD' && toCurrency !== 'USD') {
    const toUSD = convertCurrency(amount, fromCurrency, 'USD', exchangeRates);
    if (toUSD !== amount) {
      return convertCurrency(toUSD, 'USD', toCurrency, exchangeRates);
    }
  }

  // If no exchange rate found, return original amount
  console.warn(`No exchange rate found for ${fromCurrency} to ${toCurrency}`);
  return amount;
}

/**
 * Parse currency string to number
 */
export function parseCurrencyString(currencyString) {
  const cleaned = currencyString.replace(/[^0-9.-]/g, '');
  return parseFloat(cleaned) || 0;
}

/**
 * Get all available currencies
 */
export function getAllCurrencies() {
  return Object.keys(CURRENCY_SYMBOLS).map(code => ({
    code,
    symbol: CURRENCY_SYMBOLS[code],
    name: CURRENCY_NAMES[code] || code
  }));
}

/**
 * Validate currency code
 */
export function isValidCurrency(code) {
  return code in CURRENCY_SYMBOLS;
}

/**
 * Format compact currency (e.g., $1.2K, $1.5M)
 */
export function formatCompactCurrency(amount, currencyCode = 'USD') {
  const symbol = getCurrencySymbol(currencyCode);

  if (amount >= 1000000) {
    return `${symbol}${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `${symbol}${(amount / 1000).toFixed(1)}K`;
  }

  return formatCurrency(amount, currencyCode);
}

/**
 * Get decimal places for currency
 */
export function getCurrencyDecimals(currencyCode) {
  // Currencies without decimals
  const zeroDecimalCurrencies = ['JPY', 'KRW', 'VND', 'CLP'];

  if (zeroDecimalCurrencies.includes(currencyCode)) {
    return 0;
  }

  return 2;
}
