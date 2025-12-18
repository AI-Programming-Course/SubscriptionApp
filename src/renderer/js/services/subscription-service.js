import { Subscription } from '../models/subscription.js';
import { storageService } from './storage.js';

/**
 * Subscription Service - Manages all subscription operations
 */
export class SubscriptionService {
  constructor() {
    this.subscriptions = [];
    this.load();
  }

  /**
   * Load subscriptions from storage
   */
  load() {
    const data = storageService.getSubscriptions();
    this.subscriptions = data.map(sub => Subscription.fromJSON(sub));
    return this.subscriptions;
  }

  /**
   * Save subscriptions to storage
   */
  save() {
    const data = this.subscriptions.map(sub => sub.toJSON());
    return storageService.setSubscriptions(data);
  }

  /**
   * Get all subscriptions
   */
  getAll() {
    return this.subscriptions;
  }

  /**
   * Get active subscriptions only
   */
  getActive() {
    return this.subscriptions.filter(sub => sub.isActive);
  }

  /**
   * Get inactive subscriptions
   */
  getInactive() {
    return this.subscriptions.filter(sub => !sub.isActive);
  }

  /**
   * Get subscription by ID
   */
  getById(id) {
    return this.subscriptions.find(sub => sub.id === id);
  }

  /**
   * Get subscriptions by category
   */
  getByCategory(category) {
    return this.subscriptions.filter(sub => sub.category === category);
  }

  /**
   * Create new subscription
   */
  create(data) {
    const subscription = new Subscription(data);

    // Validate
    const errors = subscription.validate();
    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }

    this.subscriptions.push(subscription);
    this.save();

    return subscription;
  }

  /**
   * Update existing subscription
   */
  update(id, data) {
    const index = this.subscriptions.findIndex(sub => sub.id === id);

    if (index === -1) {
      throw new Error('Subscription not found');
    }

    // Merge existing data with updates
    const existing = this.subscriptions[index];
    const updated = new Subscription({
      ...existing.toJSON(),
      ...data,
      id: existing.id, // Preserve ID
      createdAt: existing.createdAt, // Preserve creation date
      updatedAt: new Date().toISOString() // Update modification date
    });

    // Validate
    const errors = updated.validate();
    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }

    this.subscriptions[index] = updated;
    this.save();

    return updated;
  }

  /**
   * Delete subscription
   */
  delete(id) {
    const index = this.subscriptions.findIndex(sub => sub.id === id);

    if (index === -1) {
      throw new Error('Subscription not found');
    }

    this.subscriptions.splice(index, 1);
    this.save();

    return true;
  }

  /**
   * Toggle subscription active status
   */
  toggleActive(id) {
    const subscription = this.getById(id);

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    return this.update(id, { isActive: !subscription.isActive });
  }

  /**
   * Record payment for subscription
   */
  recordPayment(id) {
    const subscription = this.getById(id);

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    subscription.recordPayment();
    this.save();

    return subscription;
  }

  /**
   * Get upcoming renewals (within specified days)
   */
  getUpcomingRenewals(days = 7) {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return this.getActive().filter(sub => {
      const renewalDate = new Date(sub.nextBillingDate);
      return renewalDate >= now && renewalDate <= futureDate;
    }).sort((a, b) => {
      return new Date(a.nextBillingDate) - new Date(b.nextBillingDate);
    });
  }

  /**
   * Get overdue subscriptions
   */
  getOverdue() {
    const now = new Date();

    return this.getActive().filter(sub => {
      return new Date(sub.nextBillingDate) < now;
    });
  }

  /**
   * Calculate total monthly cost
   */
  getTotalMonthlyCost(currency = 'USD') {
    return this.getActive().reduce((total, sub) => {
      let monthlyCost = sub.cost;

      // Convert to monthly equivalent
      switch (sub.billingCycle.type) {
        case 'daily':
          monthlyCost = sub.cost * 30;
          break;
        case 'weekly':
          monthlyCost = sub.cost * 4;
          break;
        case 'monthly':
          monthlyCost = sub.cost;
          break;
        case 'quarterly':
          monthlyCost = sub.cost / 3;
          break;
        case 'yearly':
          monthlyCost = sub.cost / 12;
          break;
        case 'custom':
          monthlyCost = (sub.cost / (sub.billingCycle.customDays || 30)) * 30;
          break;
      }

      return total + monthlyCost;
    }, 0);
  }

  /**
   * Calculate total yearly cost
   */
  getTotalYearlyCost(currency = 'USD') {
    return this.getTotalMonthlyCost(currency) * 12;
  }

  /**
   * Get spending by category
   */
  getSpendingByCategory() {
    const categoryTotals = {};

    this.getActive().forEach(sub => {
      const monthlyCost = this.getSubscriptionMonthlyCost(sub);

      if (!categoryTotals[sub.category]) {
        categoryTotals[sub.category] = 0;
      }

      categoryTotals[sub.category] += monthlyCost;
    });

    return categoryTotals;
  }

  /**
   * Get subscription monthly cost
   */
  getSubscriptionMonthlyCost(subscription) {
    let monthlyCost = subscription.cost;

    switch (subscription.billingCycle.type) {
      case 'daily':
        monthlyCost = subscription.cost * 30;
        break;
      case 'weekly':
        monthlyCost = subscription.cost * 4;
        break;
      case 'monthly':
        monthlyCost = subscription.cost;
        break;
      case 'quarterly':
        monthlyCost = subscription.cost / 3;
        break;
      case 'yearly':
        monthlyCost = subscription.cost / 12;
        break;
      case 'custom':
        monthlyCost = (subscription.cost / (subscription.billingCycle.customDays || 30)) * 30;
        break;
    }

    return monthlyCost;
  }

  /**
   * Search subscriptions
   */
  search(query) {
    const lowerQuery = query.toLowerCase();

    return this.subscriptions.filter(sub => {
      return (
        sub.name.toLowerCase().includes(lowerQuery) ||
        sub.category.toLowerCase().includes(lowerQuery) ||
        sub.notes.toLowerCase().includes(lowerQuery)
      );
    });
  }

  /**
   * Get statistics
   */
  getStats() {
    const active = this.getActive();
    const total = this.subscriptions.length;
    const upcoming = this.getUpcomingRenewals(7);
    const overdue = this.getOverdue();

    return {
      total,
      active: active.length,
      inactive: total - active.length,
      upcomingRenewals: upcoming.length,
      overdue: overdue.length,
      totalMonthlyCost: this.getTotalMonthlyCost(),
      totalYearlyCost: this.getTotalYearlyCost(),
      byCategory: this.getSpendingByCategory()
    };
  }
}

// Create singleton instance
export const subscriptionService = new SubscriptionService();
