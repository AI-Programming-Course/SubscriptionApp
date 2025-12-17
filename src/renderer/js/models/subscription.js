import { generateUUID } from '../utils/validation.js';

export class Subscription {
  constructor(data = {}) {
    this.id = data.id || generateUUID();
    this.name = data.name || '';
    this.cost = parseFloat(data.cost) || 0;
    this.currency = data.currency || 'USD';
    this.billingCycle = data.billingCycle || {
      type: 'monthly',
      customDays: null
    };
    this.nextBillingDate = data.nextBillingDate || new Date().toISOString();
    this.category = data.category || 'Other';
    this.notes = data.notes || '';
    this.paymentMethod = data.paymentMethod || '';
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.reminderDays = data.reminderDays || [3];
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
    this.history = data.history || [];
  }

  validate() {
    const errors = [];

    if (!this.name || this.name.trim() === '') {
      errors.push('Name is required');
    }

    if (this.cost <= 0) {
      errors.push('Cost must be greater than 0');
    }

    if (!this.currency) {
      errors.push('Currency is required');
    }

    if (!this.nextBillingDate) {
      errors.push('Next billing date is required');
    }

    if (!['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'custom'].includes(this.billingCycle.type)) {
      errors.push('Invalid billing cycle type');
    }

    if (this.billingCycle.type === 'custom' && (!this.billingCycle.customDays || this.billingCycle.customDays <= 0)) {
      errors.push('Custom billing cycle requires valid number of days');
    }

    return errors;
  }

  calculateNextBillingDate() {
    const currentDate = new Date(this.nextBillingDate);
    const { type, customDays } = this.billingCycle;

    switch (type) {
      case 'daily':
        currentDate.setDate(currentDate.getDate() + 1);
        break;

      case 'weekly':
        currentDate.setDate(currentDate.getDate() + 7);
        break;

      case 'monthly':
        currentDate.setMonth(currentDate.getMonth() + 1);
        break;

      case 'quarterly':
        currentDate.setMonth(currentDate.getMonth() + 3);
        break;

      case 'yearly':
        currentDate.setFullYear(currentDate.getFullYear() + 1);
        break;

      case 'custom':
        if (customDays) {
          currentDate.setDate(currentDate.getDate() + customDays);
        }
        break;

      default:
        break;
    }

    return currentDate.toISOString();
  }

  getDaysUntilRenewal() {
    const now = new Date();
    const billingDate = new Date(this.nextBillingDate);
    const diff = billingDate - now;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  recordPayment() {
    this.history.push({
      date: this.nextBillingDate,
      amount: this.cost,
      currency: this.currency
    });
    this.nextBillingDate = this.calculateNextBillingDate();
    this.updatedAt = new Date().toISOString();
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      cost: this.cost,
      currency: this.currency,
      billingCycle: this.billingCycle,
      nextBillingDate: this.nextBillingDate,
      category: this.category,
      notes: this.notes,
      paymentMethod: this.paymentMethod,
      isActive: this.isActive,
      reminderDays: this.reminderDays,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      history: this.history
    };
  }

  static fromJSON(data) {
    return new Subscription(data);
  }
}
