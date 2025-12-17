import { generateUUID } from '../utils/validation.js';

export class Budget {
  constructor(data = {}) {
    this.id = data.id || generateUUID();
    this.type = data.type || 'monthly'; // 'monthly', 'yearly', 'category'
    this.amount = parseFloat(data.amount) || 0;
    this.currency = data.currency || 'USD';
    this.category = data.category || null; // null for overall budget
    this.period = data.period || {
      start: new Date().toISOString(),
      end: this.calculatePeriodEnd(data.type || 'monthly')
    };
    this.alertThreshold = data.alertThreshold || 80; // percentage
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  calculatePeriodEnd(type) {
    const start = new Date();
    const end = new Date(start);

    switch (type) {
      case 'monthly':
        end.setMonth(end.getMonth() + 1);
        break;
      case 'yearly':
        end.setFullYear(end.getFullYear() + 1);
        break;
      default:
        end.setMonth(end.getMonth() + 1);
    }

    return end.toISOString();
  }

  validate() {
    const errors = [];

    if (this.amount <= 0) {
      errors.push('Budget amount must be greater than 0');
    }

    if (!['monthly', 'yearly', 'category'].includes(this.type)) {
      errors.push('Invalid budget type');
    }

    if (this.alertThreshold < 0 || this.alertThreshold > 100) {
      errors.push('Alert threshold must be between 0 and 100');
    }

    return errors;
  }

  calculatePercentageUsed(spent) {
    if (this.amount === 0) return 0;
    return (spent / this.amount) * 100;
  }

  shouldAlert(spent) {
    const percentageUsed = this.calculatePercentageUsed(spent);
    return percentageUsed >= this.alertThreshold;
  }

  getAlertLevel(spent) {
    const percentageUsed = this.calculatePercentageUsed(spent);

    if (percentageUsed >= 100) return 'danger';
    if (percentageUsed >= this.alertThreshold) return 'warning';
    if (percentageUsed >= this.alertThreshold * 0.75) return 'info';
    return 'success';
  }

  isInPeriod(date) {
    const checkDate = new Date(date);
    const start = new Date(this.period.start);
    const end = new Date(this.period.end);

    return checkDate >= start && checkDate <= end;
  }

  toJSON() {
    return {
      id: this.id,
      type: this.type,
      amount: this.amount,
      currency: this.currency,
      category: this.category,
      period: this.period,
      alertThreshold: this.alertThreshold,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  static fromJSON(data) {
    return new Budget(data);
  }
}
