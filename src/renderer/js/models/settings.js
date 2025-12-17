export class Settings {
  constructor(data = {}) {
    this.defaultCurrency = data.defaultCurrency || 'USD';
    this.currencies = data.currencies || ['USD', 'EUR', 'GBP', 'CAD', 'AUD'];
    this.exchangeRates = data.exchangeRates || {};
    this.lastRatesUpdate = data.lastRatesUpdate || null;

    this.notifications = data.notifications || {
      enabled: true,
      defaultReminderDays: [3],
      sound: true,
      showInTray: true
    };

    this.theme = data.theme || 'auto'; // 'light', 'dark', 'auto'
    this.startOnLogin = data.startOnLogin !== undefined ? data.startOnLogin : false;
    this.minimizeToTray = data.minimizeToTray !== undefined ? data.minimizeToTray : false;

    this.dataEncryption = data.dataEncryption !== undefined ? data.dataEncryption : false;
    this.encryptionKey = data.encryptionKey || null;

    this.backupSettings = data.backupSettings || {
      autoBackup: false,
      backupPath: null,
      frequency: 'weekly'
    };
  }

  validate() {
    const errors = [];

    if (!this.defaultCurrency) {
      errors.push('Default currency is required');
    }

    if (!Array.isArray(this.currencies) || this.currencies.length === 0) {
      errors.push('At least one currency must be enabled');
    }

    if (!['light', 'dark', 'auto'].includes(this.theme)) {
      errors.push('Invalid theme value');
    }

    return errors;
  }

  addCurrency(currency) {
    if (!this.currencies.includes(currency)) {
      this.currencies.push(currency);
      return true;
    }
    return false;
  }

  removeCurrency(currency) {
    if (currency === this.defaultCurrency) {
      return false; // Cannot remove default currency
    }

    const index = this.currencies.indexOf(currency);
    if (index > -1) {
      this.currencies.splice(index, 1);
      return true;
    }
    return false;
  }

  setExchangeRate(fromCurrency, toCurrency, rate) {
    if (!this.exchangeRates[fromCurrency]) {
      this.exchangeRates[fromCurrency] = {};
    }
    this.exchangeRates[fromCurrency][toCurrency] = parseFloat(rate);
  }

  getExchangeRate(fromCurrency, toCurrency) {
    if (fromCurrency === toCurrency) {
      return 1.0;
    }

    if (this.exchangeRates[fromCurrency] && this.exchangeRates[fromCurrency][toCurrency]) {
      return this.exchangeRates[fromCurrency][toCurrency];
    }

    // Try inverse rate
    if (this.exchangeRates[toCurrency] && this.exchangeRates[toCurrency][fromCurrency]) {
      return 1 / this.exchangeRates[toCurrency][fromCurrency];
    }

    return null;
  }

  toJSON() {
    return {
      defaultCurrency: this.defaultCurrency,
      currencies: this.currencies,
      exchangeRates: this.exchangeRates,
      lastRatesUpdate: this.lastRatesUpdate,
      notifications: this.notifications,
      theme: this.theme,
      startOnLogin: this.startOnLogin,
      minimizeToTray: this.minimizeToTray,
      dataEncryption: this.dataEncryption,
      encryptionKey: this.encryptionKey,
      backupSettings: this.backupSettings
    };
  }

  static fromJSON(data) {
    return new Settings(data);
  }

  static getDefault() {
    return new Settings();
  }
}
