import { subscriptionService } from './subscription-service.js';
import { startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinRange } from '../utils/date-utils.js';

/**
 * Analytics Service - Calculates statistics and trends
 */
export class AnalyticsService {
  /**
   * Get spending trends over time
   */
  getSpendingTrends(period = 'month', count = 12) {
    const trends = [];
    const now = new Date();

    for (let i = count - 1; i >= 0; i--) {
      const date = new Date(now);

      if (period === 'month') {
        date.setMonth(date.getMonth() - i);
      } else if (period === 'year') {
        date.setFullYear(date.getFullYear() - i);
      }

      const label = period === 'month'
        ? date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        : date.getFullYear().toString();

      const amount = this.getSpendingForPeriod(date, period);

      trends.push({ label, amount, date: date.toISOString() });
    }

    return trends;
  }

  /**
   * Get spending for a specific period
   */
  getSpendingForPeriod(date, period = 'month') {
    const start = period === 'month' ? startOfMonth(date) : startOfYear(date);
    const end = period === 'month' ? endOfMonth(date) : endOfYear(date);

    const subscriptions = subscriptionService.getAll();
    let total = 0;

    subscriptions.forEach(sub => {
      // Calculate how much was spent in this period based on billing history
      sub.history.forEach(payment => {
        if (isWithinRange(payment.date, start, end)) {
          total += payment.amount;
        }
      });

      // If subscription is active and billing date is in period, add cost
      if (sub.isActive && isWithinRange(sub.nextBillingDate, start, end)) {
        total += sub.cost;
      }
    });

    return total;
  }

  /**
   * Get category breakdown
   */
  getCategoryBreakdown() {
    const spending = subscriptionService.getSpendingByCategory();
    const total = Object.values(spending).reduce((sum, amount) => sum + amount, 0);

    const breakdown = Object.keys(spending).map(category => ({
      category,
      amount: spending[category],
      percentage: total > 0 ? (spending[category] / total) * 100 : 0
    }));

    // Sort by amount descending
    return breakdown.sort((a, b) => b.amount - a.amount);
  }

  /**
   * Compare spending between periods
   */
  comparePeriods(period1Start, period1End, period2Start, period2End) {
    const period1Spending = this.getSpendingForRange(period1Start, period1End);
    const period2Spending = this.getSpendingForRange(period2Start, period2End);

    const difference = period2Spending - period1Spending;
    const percentageChange = period1Spending > 0
      ? (difference / period1Spending) * 100
      : 0;

    return {
      period1: period1Spending,
      period2: period2Spending,
      difference,
      percentageChange,
      increased: difference > 0
    };
  }

  /**
   * Get spending for a date range
   */
  getSpendingForRange(startDate, endDate) {
    const subscriptions = subscriptionService.getAll();
    let total = 0;

    subscriptions.forEach(sub => {
      sub.history.forEach(payment => {
        if (isWithinRange(payment.date, startDate, endDate)) {
          total += payment.amount;
        }
      });
    });

    return total;
  }

  /**
   * Get projected spending
   */
  getProjectedSpending(months = 12) {
    const monthlySpending = subscriptionService.getTotalMonthlyCost();
    return monthlySpending * months;
  }

  /**
   * Get spending statistics
   */
  getStatistics() {
    const subscriptions = subscriptionService.getActive();

    if (subscriptions.length === 0) {
      return {
        min: 0,
        max: 0,
        average: 0,
        median: 0,
        total: 0
      };
    }

    const monthlyCosts = subscriptions.map(sub =>
      subscriptionService.getSubscriptionMonthlyCost(sub)
    );

    monthlyCosts.sort((a, b) => a - b);

    const total = monthlyCosts.reduce((sum, cost) => sum + cost, 0);
    const min = monthlyCosts[0];
    const max = monthlyCosts[monthlyCosts.length - 1];
    const average = total / monthlyCosts.length;

    const mid = Math.floor(monthlyCosts.length / 2);
    const median = monthlyCosts.length % 2 === 0
      ? (monthlyCosts[mid - 1] + monthlyCosts[mid]) / 2
      : monthlyCosts[mid];

    return { min, max, average, median, total };
  }

  /**
   * Get top spending categories
   */
  getTopCategories(limit = 5) {
    const breakdown = this.getCategoryBreakdown();
    return breakdown.slice(0, limit);
  }

  /**
   * Get cost distribution by billing cycle
   */
  getCostByBillingCycle() {
    const distribution = {};
    const subscriptions = subscriptionService.getActive();

    subscriptions.forEach(sub => {
      const cycle = sub.billingCycle.type;

      if (!distribution[cycle]) {
        distribution[cycle] = {
          count: 0,
          totalCost: 0,
          monthlyCost: 0
        };
      }

      distribution[cycle].count++;
      distribution[cycle].totalCost += sub.cost;
      distribution[cycle].monthlyCost += subscriptionService.getSubscriptionMonthlyCost(sub);
    });

    return distribution;
  }

  /**
   * Get year-over-year comparison
   */
  getYearOverYearComparison() {
    const thisYear = new Date().getFullYear();
    const lastYear = thisYear - 1;

    const thisYearStart = new Date(thisYear, 0, 1);
    const thisYearEnd = new Date(thisYear, 11, 31);
    const lastYearStart = new Date(lastYear, 0, 1);
    const lastYearEnd = new Date(lastYear, 11, 31);

    return this.comparePeriods(
      lastYearStart,
      lastYearEnd,
      thisYearStart,
      thisYearEnd
    );
  }

  /**
   * Get monthly trends for charts
   */
  getMonthlyTrendsForChart(months = 12) {
    const trends = this.getSpendingTrends('month', months);

    return {
      labels: trends.map(t => t.label),
      data: trends.map(t => t.amount)
    };
  }

  /**
   * Get category data for pie chart
   */
  getCategoryDataForChart() {
    const breakdown = this.getCategoryBreakdown();

    return {
      labels: breakdown.map(b => b.category),
      data: breakdown.map(b => b.amount),
      percentages: breakdown.map(b => b.percentage)
    };
  }
}

// Create singleton instance
export const analyticsService = new AnalyticsService();
