import { Budget } from '../models/budget.js';
import { storageService } from './storage.js';
import { subscriptionService } from './subscription-service.js';
import { isWithinRange } from '../utils/date-utils.js';

/**
 * Budget Service - Manages budgets and tracking
 */
export class BudgetService {
  constructor() {
    this.budgets = [];
    this.load();
  }

  /**
   * Load budgets from storage
   */
  load() {
    const data = storageService.getBudgets();
    this.budgets = data.map(budget => Budget.fromJSON(budget));
    return this.budgets;
  }

  /**
   * Save budgets to storage
   */
  save() {
    const data = this.budgets.map(budget => budget.toJSON());
    return storageService.setBudgets(data);
  }

  /**
   * Get all budgets
   */
  getAll() {
    return this.budgets;
  }

  /**
   * Get active budgets
   */
  getActive() {
    return this.budgets.filter(budget => budget.isActive);
  }

  /**
   * Get budget by ID
   */
  getById(id) {
    return this.budgets.find(budget => budget.id === id);
  }

  /**
   * Create new budget
   */
  create(data) {
    const budget = new Budget(data);

    // Validate
    const errors = budget.validate();
    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }

    this.budgets.push(budget);
    this.save();

    return budget;
  }

  /**
   * Update budget
   */
  update(id, data) {
    const index = this.budgets.findIndex(budget => budget.id === id);

    if (index === -1) {
      throw new Error('Budget not found');
    }

    const existing = this.budgets[index];
    const updated = new Budget({
      ...existing.toJSON(),
      ...data,
      id: existing.id,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString()
    });

    // Validate
    const errors = updated.validate();
    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }

    this.budgets[index] = updated;
    this.save();

    return updated;
  }

  /**
   * Delete budget
   */
  delete(id) {
    const index = this.budgets.findIndex(budget => budget.id === id);

    if (index === -1) {
      throw new Error('Budget not found');
    }

    this.budgets.splice(index, 1);
    this.save();

    return true;
  }

  /**
   * Get current month budget
   */
  getCurrentMonthBudget() {
    const now = new Date();

    return this.getActive().find(budget => {
      return budget.type === 'monthly' &&
             budget.category === null &&
             budget.isInPeriod(now);
    });
  }

  /**
   * Get current year budget
   */
  getCurrentYearBudget() {
    const now = new Date();

    return this.getActive().find(budget => {
      return budget.type === 'yearly' &&
             budget.category === null &&
             budget.isInPeriod(now);
    });
  }

  /**
   * Get category budget
   */
  getCategoryBudget(category) {
    const now = new Date();

    return this.getActive().find(budget => {
      return budget.category === category && budget.isInPeriod(now);
    });
  }

  /**
   * Calculate spending for budget
   */
  getSpendingForBudget(budget) {
    const subscriptions = subscriptionService.getAll();
    let spent = 0;

    subscriptions.forEach(sub => {
      // Skip if budget has category filter and subscription doesn't match
      if (budget.category && sub.category !== budget.category) {
        return;
      }

      // Count payments made during budget period
      sub.history.forEach(payment => {
        if (isWithinRange(payment.date, budget.period.start, budget.period.end)) {
          spent += payment.amount;
        }
      });

      // Count upcoming renewals if within period
      if (sub.isActive && isWithinRange(sub.nextBillingDate, budget.period.start, budget.period.end)) {
        spent += sub.cost;
      }
    });

    return spent;
  }

  /**
   * Get budget status
   */
  getBudgetStatus(budgetId) {
    const budget = this.getById(budgetId);

    if (!budget) {
      throw new Error('Budget not found');
    }

    const spent = this.getSpendingForBudget(budget);
    const percentageUsed = budget.calculatePercentageUsed(spent);
    const remaining = budget.amount - spent;
    const alertLevel = budget.getAlertLevel(spent);
    const shouldAlert = budget.shouldAlert(spent);

    return {
      budget,
      spent,
      remaining,
      percentageUsed,
      alertLevel,
      shouldAlert,
      overBudget: spent > budget.amount
    };
  }

  /**
   * Get all active budget statuses
   */
  getAllBudgetStatuses() {
    return this.getActive().map(budget => this.getBudgetStatus(budget.id));
  }

  /**
   * Get budgets that need alerts
   */
  getBudgetsNeedingAlerts() {
    return this.getAllBudgetStatuses().filter(status => status.shouldAlert);
  }

  /**
   * Get overall budget summary
   */
  getBudgetSummary() {
    const monthlyBudget = this.getCurrentMonthBudget();
    const yearlyBudget = this.getCurrentYearBudget();

    const summary = {
      monthly: null,
      yearly: null,
      categories: []
    };

    if (monthlyBudget) {
      summary.monthly = this.getBudgetStatus(monthlyBudget.id);
    }

    if (yearlyBudget) {
      summary.yearly = this.getBudgetStatus(yearlyBudget.id);
    }

    // Get all category budgets
    const categoryBudgets = this.getActive().filter(b => b.category !== null);
    summary.categories = categoryBudgets.map(b => this.getBudgetStatus(b.id));

    return summary;
  }
}

// Create singleton instance
export const budgetService = new BudgetService();
