import { convertCurrency, getAllCurrencies } from '../utils/currency-utils.js';
import { API_ENDPOINTS } from '../utils/constants.js';

/**
 * Currency Service - Handles currency conversion and exchange rates
 */
export class CurrencyService {
  constructor() {
    this.exchangeRates = {};
    this.lastUpdate = null;
    this.baseCurrency = 'USD';
  }

  /**
   * Fetch latest exchange rates from API
   */
  async fetchRates(baseCurrency = 'USD') {
    try {
      const response = await fetch(`${API_ENDPOINTS.EXCHANGE_RATES}?from=${baseCurrency}`);

      if (!response.ok) {
        throw new Error('Failed to fetch exchange rates');
      }

      const data = await response.json();

      if (data.rates) {
        this.exchangeRates[baseCurrency] = data.rates;
        this.lastUpdate = new Date().toISOString();
        this.baseCurrency = baseCurrency;

        return data.rates;
      }

      throw new Error('Invalid response format');
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
      return null;
    }
  }

  /**
   * Get exchange rate between two currencies
   */
  getRate(fromCurrency, toCurrency) {
    if (fromCurrency === toCurrency) {
      return 1.0;
    }

    // Try direct conversion
    if (this.exchangeRates[fromCurrency] && this.exchangeRates[fromCurrency][toCurrency]) {
      return this.exchangeRates[fromCurrency][toCurrency];
    }

    // Try inverse conversion
    if (this.exchangeRates[toCurrency] && this.exchangeRates[toCurrency][fromCurrency]) {
      return 1 / this.exchangeRates[toCurrency][fromCurrency];
    }

    // Try conversion through base currency
    if (this.exchangeRates[this.baseCurrency]) {
      const fromBase = this.exchangeRates[this.baseCurrency][fromCurrency];
      const toBase = this.exchangeRates[this.baseCurrency][toCurrency];

      if (fromBase && toBase) {
        return toBase / fromBase;
      }
    }

    return null;
  }

  /**
   * Convert amount between currencies
   */
  convert(amount, fromCurrency, toCurrency) {
    const rate = this.getRate(fromCurrency, toCurrency);

    if (rate === null) {
      console.warn(`No exchange rate found for ${fromCurrency} to ${toCurrency}`);
      return amount;
    }

    return amount * rate;
  }

  /**
   * Set manual exchange rate
   */
  setRate(fromCurrency, toCurrency, rate) {
    if (!this.exchangeRates[fromCurrency]) {
      this.exchangeRates[fromCurrency] = {};
    }

    this.exchangeRates[fromCurrency][toCurrency] = parseFloat(rate);
  }

  /**
   * Get all available currencies
   */
  getCurrencies() {
    return getAllCurrencies();
  }

  /**
   * Check if rates need updating (older than 24 hours)
   */
  needsUpdate() {
    if (!this.lastUpdate) {
      return true;
    }

    const now = new Date();
    const lastUpdateDate = new Date(this.lastUpdate);
    const hoursSinceUpdate = (now - lastUpdateDate) / (1000 * 60 * 60);

    return hoursSinceUpdate >= 24;
  }

  /**
   * Auto-update rates if needed
   */
  async autoUpdate(baseCurrency = 'USD') {
    if (this.needsUpdate()) {
      return await this.fetchRates(baseCurrency);
    }

    return this.exchangeRates[baseCurrency] || null;
  }

  /**
   * Load rates from settings
   */
  loadFromSettings(settings) {
    if (settings.exchangeRates) {
      this.exchangeRates = settings.exchangeRates;
    }

    if (settings.lastRatesUpdate) {
      this.lastUpdate = settings.lastRatesUpdate;
    }

    if (settings.defaultCurrency) {
      this.baseCurrency = settings.defaultCurrency;
    }
  }

  /**
   * Export rates for settings
   */
  exportForSettings() {
    return {
      exchangeRates: this.exchangeRates,
      lastRatesUpdate: this.lastUpdate
    };
  }
}

// Create singleton instance
export const currencyService = new CurrencyService();
