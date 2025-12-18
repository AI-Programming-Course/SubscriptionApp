import { STORAGE_KEYS } from '../utils/constants.js';

/**
 * Storage Service - Handles all localStorage operations with optional encryption
 */
export class StorageService {
  constructor() {
    this.storage = window.localStorage;
    this.encryptionEnabled = false;
    this.encryptionKey = null;
  }

  /**
   * Enable encryption for sensitive data
   */
  enableEncryption(key) {
    this.encryptionEnabled = true;
    this.encryptionKey = key;
  }

  /**
   * Disable encryption
   */
  disableEncryption() {
    this.encryptionEnabled = false;
    this.encryptionKey = null;
  }

  /**
   * Save data to localStorage
   */
  set(key, value) {
    try {
      const serialized = JSON.stringify(value);
      const data = this.encryptionEnabled ? this.encrypt(serialized) : serialized;
      this.storage.setItem(key, data);
      return true;
    } catch (error) {
      console.error('Storage set error:', error);
      return false;
    }
  }

  /**
   * Get data from localStorage
   */
  get(key, defaultValue = null) {
    try {
      const data = this.storage.getItem(key);
      if (data === null) return defaultValue;

      const serialized = this.encryptionEnabled ? this.decrypt(data) : data;
      return JSON.parse(serialized);
    } catch (error) {
      console.error('Storage get error:', error);
      return defaultValue;
    }
  }

  /**
   * Remove item from localStorage
   */
  remove(key) {
    try {
      this.storage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Storage remove error:', error);
      return false;
    }
  }

  /**
   * Clear all data from localStorage
   */
  clear() {
    try {
      this.storage.clear();
      return true;
    } catch (error) {
      console.error('Storage clear error:', error);
      return false;
    }
  }

  /**
   * Check if key exists
   */
  has(key) {
    return this.storage.getItem(key) !== null;
  }

  /**
   * Get all keys
   */
  keys() {
    return Object.keys(this.storage);
  }

  /**
   * Get storage size in bytes
   */
  getSize() {
    let size = 0;
    for (let key in this.storage) {
      if (this.storage.hasOwnProperty(key)) {
        size += this.storage[key].length + key.length;
      }
    }
    return size;
  }

  /**
   * Export all data
   */
  exportAll() {
    const data = {};
    for (let key in this.storage) {
      if (this.storage.hasOwnProperty(key)) {
        data[key] = this.get(key);
      }
    }
    return data;
  }

  /**
   * Import data
   */
  importAll(data) {
    try {
      for (let key in data) {
        if (data.hasOwnProperty(key)) {
          this.set(key, data[key]);
        }
      }
      return true;
    } catch (error) {
      console.error('Import error:', error);
      return false;
    }
  }

  /**
   * Simple encryption (Base64 encoding for now)
   * In production, use Web Crypto API for real encryption
   */
  encrypt(data) {
    try {
      return btoa(data);
    } catch (error) {
      console.error('Encryption error:', error);
      return data;
    }
  }

  /**
   * Simple decryption (Base64 decoding)
   */
  decrypt(data) {
    try {
      return atob(data);
    } catch (error) {
      console.error('Decryption error:', error);
      return data;
    }
  }

  /**
   * Get all subscriptions
   */
  getSubscriptions() {
    return this.get(STORAGE_KEYS.SUBSCRIPTIONS, []);
  }

  /**
   * Save subscriptions
   */
  setSubscriptions(subscriptions) {
    return this.set(STORAGE_KEYS.SUBSCRIPTIONS, subscriptions);
  }

  /**
   * Get all budgets
   */
  getBudgets() {
    return this.get(STORAGE_KEYS.BUDGETS, []);
  }

  /**
   * Save budgets
   */
  setBudgets(budgets) {
    return this.set(STORAGE_KEYS.BUDGETS, budgets);
  }

  /**
   * Get all categories
   */
  getCategories() {
    return this.get(STORAGE_KEYS.CATEGORIES, []);
  }

  /**
   * Save categories
   */
  setCategories(categories) {
    return this.set(STORAGE_KEYS.CATEGORIES, categories);
  }

  /**
   * Get settings
   */
  getSettings() {
    return this.get(STORAGE_KEYS.SETTINGS, null);
  }

  /**
   * Save settings
   */
  setSettings(settings) {
    return this.set(STORAGE_KEYS.SETTINGS, settings);
  }
}

// Create singleton instance
export const storageService = new StorageService();
