/**
 * Subscription Tracker - Main Application
 * Full-featured subscription management app with analytics, budgets, and multi-currency support
 */

import { subscriptionService } from './services/subscription-service.js';
import { budgetService } from './services/budget-service.js';
import { analyticsService } from './services/analytics-service.js';
import { currencyService } from './services/currency-service.js';
import { storageService } from './services/storage.js';
import { Settings } from './models/settings.js';
import { Category } from './models/category.js';
import { Toast } from './components/toast.js';
import { Modal } from './components/modal.js';
import { formatCurrency } from './utils/currency-utils.js';
import { formatDate, getRelativeTime } from './utils/date-utils.js';
import { formatBillingCycle } from './utils/formatters.js';
import { ROUTES, CHART_COLORS } from './utils/constants.js';

class App {
  constructor() {
    this.currentView = 'dashboard';
    this.settings = null;
    this.categories = [];
    this.initialized = false;
  }

  async init() {
    console.log('🚀 Initializing Subscription Tracker...');

    try {
      // Load settings
      console.log('📝 Loading settings...');
      this.loadSettings();
      console.log('✅ Settings loaded:', this.settings);

      // Load categories
      console.log('📂 Loading categories...');
      this.loadCategories();
      console.log('✅ Categories loaded:', this.categories);

      // Setup navigation
      console.log('🧭 Setting up navigation...');
      this.setupNavigation();

      // Load initial view
      console.log('📺 Loading dashboard view...');
      this.loadView('dashboard');

      // Listen for menu events from Electron
      if (window.electronAPI) {
        console.log('🔌 Setting up Electron listeners...');
        this.setupElectronListeners();
      } else {
        console.warn('⚠️ No electronAPI found - running in browser mode');
      }

      // Update app version
      if (window.electronAPI?.getAppVersion) {
        console.log('📱 Fetching app version...');
        const version = await window.electronAPI.getAppVersion();
        console.log('✅ App version:', version);
        const versionEl = document.querySelector('.app-version');
        if (versionEl) versionEl.textContent = `v${version}`;
      }

      // Fetch exchange rates
      console.log('💱 Updating exchange rates...');
      await this.updateExchangeRates();
      console.log('✅ Exchange rates updated');

      this.initialized = true;
      console.log('✅ App initialized successfully');
      console.log('🌐 Window.app is:', window.app);

      Toast.success('Welcome to Subscription Tracker!');
    } catch (error) {
      console.error('❌ Failed to initialize app:', error);
      Toast.error('Failed to initialize application');
    }
  }

  loadSettings() {
    let settings = storageService.getSettings();

    if (!settings) {
      settings = Settings.getDefault();
      storageService.setSettings(settings.toJSON());
    } else {
      settings = Settings.fromJSON(settings);
    }

    this.settings = settings;
    currencyService.loadFromSettings(settings);
  }

  loadCategories() {
    let categories = storageService.getCategories();

    if (!categories || categories.length === 0) {
      categories = Category.getDefaultCategories();
      storageService.setCategories(categories.map(c => c.toJSON()));
    } else {
      categories = categories.map(c => Category.fromJSON(c));
    }

    this.categories = categories;
  }

  async updateExchangeRates() {
    if (currencyService.needsUpdate()) {
      await currencyService.fetchRates(this.settings.defaultCurrency);

      // Save to settings
      const ratesData = currencyService.exportForSettings();
      this.settings.exchangeRates = ratesData.exchangeRates;
      this.settings.lastRatesUpdate = ratesData.lastRatesUpdate;
      storageService.setSettings(this.settings.toJSON());
    }
  }

  setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const route = link.getAttribute('data-route');
        this.navigate(route);
      });
    });

    // Setup global event delegation for dynamically created buttons
    console.log('🎯 Setting up event delegation...');
    document.addEventListener('click', (e) => {
      const target = e.target;

      // Handle buttons with data-action attributes
      if (target.hasAttribute('data-app-action')) {
        console.log('🔵 Button clicked with data-app-action:', target.getAttribute('data-app-action'));
        const action = target.getAttribute('data-app-action');
        const param = target.getAttribute('data-param');

        if (this[action]) {
          console.log('✅ Calling action:', action, 'with param:', param);
          if (param) {
            this[action](param);
          } else {
            this[action]();
          }
        } else {
          console.error('❌ Action not found:', action);
        }
      }
    });
  }

  setupElectronListeners() {
    window.electronAPI.onMenuNavigate((view) => this.navigate(view));
    window.electronAPI.onMenuNewSubscription(() => this.showAddSubscriptionModal());
    window.electronAPI.onMenuImport(() => this.importData());
    window.electronAPI.onMenuExport(() => this.exportData());
  }

  navigate(route) {
    console.log('🧭 Navigating to route:', route);

    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('data-route') === route);
    });

    this.loadView(route);
  }

  loadView(view) {
    console.log('📺 loadView called with view:', view);

    const container = document.getElementById('view-container');
    if (!container) {
      console.error('❌ View container not found');
      return;
    }

    this.currentView = view;
    console.log('✅ Current view set to:', this.currentView);

    switch (view) {
      case 'dashboard':
        console.log('📊 Rendering dashboard...');
        this.renderDashboard(container);
        break;
      case 'subscriptions':
        console.log('📝 Rendering subscriptions...');
        this.renderSubscriptions(container);
        break;
      case 'analytics':
        console.log('📈 Rendering analytics...');
        this.renderAnalytics(container);
        break;
      case 'budget':
        console.log('💰 Rendering budget...');
        this.renderBudget(container);
        break;
      case 'settings':
        console.log('⚙️ Rendering settings...');
        this.renderSettings(container);
        break;
      default:
        console.log('📊 Rendering default (dashboard)...');
        this.renderDashboard(container);
    }
  }

  // DASHBOARD VIEW
  renderDashboard(container) {
    const stats = subscriptionService.getStats();
    const upcoming = subscriptionService.getUpcomingRenewals(7);

    container.innerHTML = `
      <div class="page-header">
        <h1 class="page-title">Dashboard</h1>
        <div class="page-actions">
          <button class="btn btn-primary" data-app-action="showAddSubscriptionModal">
            + Add Subscription
          </button>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">Monthly Cost</div>
          <div class="stat-value">${formatCurrency(stats.totalMonthlyCost, this.settings.defaultCurrency)}</div>
          <div class="stat-change">${stats.active} active subscriptions</div>
        </div>

        <div class="stat-card success">
          <div class="stat-label">Yearly Projection</div>
          <div class="stat-value">${formatCurrency(stats.totalYearlyCost, this.settings.defaultCurrency)}</div>
          <div class="stat-change">Based on current subscriptions</div>
        </div>

        <div class="stat-card warning">
          <div class="stat-label">Upcoming Renewals</div>
          <div class="stat-value">${upcoming.length}</div>
          <div class="stat-change">Next 7 days</div>
        </div>

        <div class="stat-card">
          <div class="stat-label">Total Subscriptions</div>
          <div class="stat-value">${stats.total}</div>
          <div class="stat-change">${stats.inactive} inactive</div>
        </div>
      </div>

      <div class="grid grid-cols-2">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Upcoming Renewals</h3>
          </div>
          <div class="card-body">
            ${upcoming.length > 0 ? this.renderUpcomingList(upcoming) : '<p class="text-secondary">No upcoming renewals in the next 7 days</p>'}
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Spending by Category</h3>
          </div>
          <div class="card-body">
            ${this.renderCategoryBreakdown(stats.byCategory)}
          </div>
        </div>
      </div>
    `;
  }

  renderUpcomingList(subscriptions) {
    return `
      <div style="max-height: 300px; overflow-y: auto;">
        ${subscriptions.map(sub => `
          <div style="padding: 12px; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-weight: 600; color: var(--text-primary);">${sub.name}</div>
              <div style="font-size: 14px; color: var(--text-secondary);">${getRelativeTime(sub.nextBillingDate)}</div>
            </div>
            <div style="text-align: right;">
              <div style="font-weight: 600; color: var(--color-primary);">${formatCurrency(sub.cost, sub.currency)}</div>
              <div style="font-size: 12px; color: var(--text-tertiary);">${formatBillingCycle(sub.billingCycle)}</div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  renderCategoryBreakdown(byCategory) {
    const entries = Object.entries(byCategory);

    if (entries.length === 0) {
      return '<p class="text-secondary">No subscriptions yet</p>';
    }

    const total = Object.values(byCategory).reduce((sum, amount) => sum + amount, 0);

    return entries.sort((a, b) => b[1] - a[1]).slice(0, 5).map(([category, amount]) => {
      const percentage = ((amount / total) * 100).toFixed(1);

      return `
        <div style="margin-bottom: 16px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span style="color: var(--text-primary);">${category}</span>
            <span style="font-weight: 600; color: var(--color-primary);">${formatCurrency(amount, this.settings.defaultCurrency)}</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${percentage}%"></div>
          </div>
          <div style="font-size: 12px; color: var(--text-tertiary); margin-top: 4px;">${percentage}% of total</div>
        </div>
      `;
    }).join('');
  }

  // SUBSCRIPTIONS VIEW
  renderSubscriptions(container) {
    const subscriptions = subscriptionService.getAll();

    container.innerHTML = `
      <div class="page-header">
        <h1 class="page-title">Subscriptions</h1>
        <div class="page-actions">
          <button class="btn btn-primary" data-app-action="showAddSubscriptionModal">
            + Add Subscription
          </button>
        </div>
      </div>

      ${subscriptions.length > 0 ? `
        <div class="grid grid-cols-3">
          ${subscriptions.map(sub => this.renderSubscriptionCard(sub)).join('')}
        </div>
      ` : `
        <div class="empty-state">
          <div class="empty-state-icon">📝</div>
          <h3 class="empty-state-title">No Subscriptions Yet</h3>
          <p class="empty-state-message">Start tracking your subscriptions by adding your first one.</p>
          <button class="btn btn-primary" data-app-action="showAddSubscriptionModal">Add Your First Subscription</button>
        </div>
      `}
    `;
  }

  renderSubscriptionCard(sub) {
    return `
      <div class="subscription-card">
        <div class="subscription-card-header">
          <div class="subscription-name">${sub.name}</div>
          <div class="subscription-cost">${formatCurrency(sub.cost, sub.currency)}</div>
        </div>
        <div class="subscription-card-body">
          <div class="subscription-info">
            <span class="subscription-cycle">${formatBillingCycle(sub.billingCycle)}</span>
            <span class="subscription-next-billing">Next: ${formatDate(sub.nextBillingDate, 'short')}</span>
          </div>
        </div>
        <div class="subscription-card-footer">
          <span class="subscription-category">${sub.category}</span>
          <div class="subscription-actions">
            <button class="icon-btn" data-app-action="editSubscription" data-param="${sub.id}" title="Edit">✏️</button>
            <button class="icon-btn" data-app-action="deleteSubscription" data-param="${sub.id}" title="Delete">🗑️</button>
          </div>
        </div>
      </div>
    `;
  }

  // ANALYTICS VIEW
  renderAnalytics(container) {
    container.innerHTML = `
      <div class="page-header">
        <h1 class="page-title">Analytics</h1>
      </div>

      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Monthly Spending Trends</h3>
        </div>
        <div class="card-body">
          <div class="chart-wrapper large">
            <canvas id="trendsChart"></canvas>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-2">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Category Distribution</h3>
          </div>
          <div class="card-body">
            <div class="chart-wrapper">
              <canvas id="categoryChart"></canvas>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Statistics</h3>
          </div>
          <div class="card-body">
            ${this.renderStatistics()}
          </div>
        </div>
      </div>
    `;

    // Render charts after DOM update
    setTimeout(() => {
      this.renderTrendsChart();
      this.renderCategoryChart();
    }, 100);
  }

  renderStatistics() {
    const stats = analyticsService.getStatistics();

    return `
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <div style="display: flex; justify-content: space-between;">
          <span style="color: var(--text-secondary);">Average Monthly Cost:</span>
          <span style="font-weight: 600;">${formatCurrency(stats.average, this.settings.defaultCurrency)}</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span style="color: var(--text-secondary);">Highest Subscription:</span>
          <span style="font-weight: 600;">${formatCurrency(stats.max, this.settings.defaultCurrency)}</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span style="color: var(--text-secondary);">Lowest Subscription:</span>
          <span style="font-weight: 600;">${formatCurrency(stats.min, this.settings.defaultCurrency)}</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span style="color: var(--text-secondary);">Total Monthly:</span>
          <span style="font-weight: 600; color: var(--color-primary);">${formatCurrency(stats.total, this.settings.defaultCurrency)}</span>
        </div>
      </div>
    `;
  }

  renderTrendsChart() {
    const canvas = document.getElementById('trendsChart');
    if (!canvas) return;

    const data = analyticsService.getMonthlyTrendsForChart(12);

    new Chart(canvas, {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: [{
          label: 'Monthly Spending',
          data: data.data,
          borderColor: CHART_COLORS[0],
          backgroundColor: CHART_COLORS[0] + '20',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        }
      }
    });
  }

  renderCategoryChart() {
    const canvas = document.getElementById('categoryChart');
    if (!canvas) return;

    const data = analyticsService.getCategoryDataForChart();

    new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: data.labels,
        datasets: [{
          data: data.data,
          backgroundColor: CHART_COLORS
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  }

  // BUDGET VIEW
  renderBudget(container) {
    const summary = budgetService.getBudgetSummary();

    container.innerHTML = `
      <div class="page-header">
        <h1 class="page-title">Budget</h1>
        <div class="page-actions">
          <button class="btn btn-primary" data-app-action="showAddBudgetModal">
            + Create Budget
          </button>
        </div>
      </div>

      ${summary.monthly || summary.yearly ? `
        <div class="grid grid-cols-2">
          ${summary.monthly ? this.renderBudgetStatus(summary.monthly) : ''}
          ${summary.yearly ? this.renderBudgetStatus(summary.yearly) : ''}
        </div>
      ` : `
        <div class="empty-state">
          <div class="empty-state-icon">💰</div>
          <h3 class="empty-state-title">No Budgets Set</h3>
          <p class="empty-state-message">Create a budget to track your spending limits.</p>
          <button class="btn btn-primary" data-app-action="showAddBudgetModal">Create Your First Budget</button>
        </div>
      `}
    `;
  }

  renderBudgetStatus(status) {
    const { budget, spent, remaining, percentageUsed, alertLevel } = status;
    const progressClass = alertLevel === 'danger' ? 'danger' : alertLevel === 'warning' ? 'warning' : 'success';

    return `
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">${budget.type.charAt(0).toUpperCase() + budget.type.slice(1)} Budget</h3>
        </div>
        <div class="card-body">
          <div style="margin-bottom: 16px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span>Spent</span>
              <span style="font-weight: 600;">${formatCurrency(spent, budget.currency)}</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill ${progressClass}" style="width: ${Math.min(percentageUsed, 100)}%"></div>
            </div>
            <div style="display: flex; justify-content: space-between; margin-top: 4px; font-size: 12px; color: var(--text-tertiary);">
              <span>${percentageUsed.toFixed(1)}% used</span>
              <span>Budget: ${formatCurrency(budget.amount, budget.currency)}</span>
            </div>
          </div>
          <div style="padding: 12px; background: var(--bg-tertiary); border-radius: 8px;">
            <div style="font-size: 14px; color: var(--text-secondary); margin-bottom: 4px;">Remaining</div>
            <div style="font-size: 24px; font-weight: bold; color: ${remaining >= 0 ? 'var(--color-success)' : 'var(--color-danger)'};">
              ${formatCurrency(Math.abs(remaining), budget.currency)}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // SETTINGS VIEW
  renderSettings(container) {
    container.innerHTML = `
      <div class="page-header">
        <h1 class="page-title">Settings</h1>
      </div>

      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Currency Settings</h3>
        </div>
        <div class="card-body">
          <div class="form-group">
            <label class="form-label">Default Currency</label>
            <select class="form-select" id="defaultCurrency">
              ${this.renderCurrencyOptions()}
            </select>
          </div>
          <button class="btn btn-primary" data-app-action="updateCurrencySettings">Save Currency Settings</button>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Data Management</h3>
        </div>
        <div class="card-body">
          <div style="display: flex; gap: 12px;">
            <button class="btn btn-secondary" data-app-action="exportData">Export Data</button>
            <button class="btn btn-secondary" data-app-action="importData">Import Data</button>
          </div>
        </div>
      </div>
    `;

    // Set current default currency
    const currencySelect = document.getElementById('defaultCurrency');
    if (currencySelect) {
      currencySelect.value = this.settings.defaultCurrency;
    }
  }

  renderCurrencyOptions() {
    const currencies = currencyService.getCurrencies();
    return currencies.map(c => `
      <option value="${c.code}">${c.code} - ${c.name}</option>
    `).join('');
  }

  // MODAL FUNCTIONS
  showAddSubscriptionModal() {
    console.log('🔵 showAddSubscriptionModal called');
    console.log('🔵 this:', this);
    console.log('🔵 Modal class:', Modal);

    try {
      const form = this.createSubscriptionForm();
      console.log('✅ Form created');

      const modal = new Modal('Add Subscription', form, {
        footer: `
          <button class="btn btn-secondary" data-action="cancel">Cancel</button>
          <button class="btn btn-primary" data-action="save">Save</button>
        `
      });
      console.log('✅ Modal instance created');

      modal.open();
      console.log('✅ Modal opened');

      modal.element.querySelector('[data-action="save"]').addEventListener('click', () => {
        console.log('💾 Save button clicked');
        this.saveSubscription(modal);
      });

      modal.element.querySelector('[data-action="cancel"]').addEventListener('click', () => {
        console.log('❌ Cancel button clicked');
        modal.close();
      });
    } catch (error) {
      console.error('❌ Error in showAddSubscriptionModal:', error);
    }
  }

  createSubscriptionForm(subscription = null) {
    console.log('📝 Creating subscription form, edit mode:', !!subscription);
    console.log('📝 Subscription data:', subscription);

    // Format date for input field (YYYY-MM-DD)
    let nextBillingDateValue = '';
    if (subscription?.nextBillingDate) {
      const date = new Date(subscription.nextBillingDate);
      nextBillingDateValue = date.toISOString().split('T')[0];
      console.log('📅 Formatted billing date:', nextBillingDateValue);
    }

    const billingCycleType = subscription?.billingCycle?.type || 'monthly';
    const selectedCurrency = subscription?.currency || this.settings.defaultCurrency;
    const selectedCategory = subscription?.category || this.categories[0]?.name;

    console.log('🔧 Form defaults - Cycle:', billingCycleType, 'Currency:', selectedCurrency, 'Category:', selectedCategory);

    return `
      <form id="subscriptionForm">
        <div class="form-group">
          <label class="form-label">Name *</label>
          <input type="text" class="form-input" name="name" value="${subscription?.name || ''}" required>
        </div>

        <div class="grid grid-cols-2">
          <div class="form-group">
            <label class="form-label">Cost *</label>
            <input type="number" class="form-input" name="cost" step="0.01" value="${subscription?.cost || ''}" required>
          </div>

          <div class="form-group">
            <label class="form-label">Currency</label>
            <select class="form-select" name="currency">
              ${this.renderCurrencyOptionsWithSelection(selectedCurrency)}
            </select>
          </div>
        </div>

        <div class="grid grid-cols-2">
          <div class="form-group">
            <label class="form-label">Billing Cycle *</label>
            <select class="form-select" name="billingCycleType">
              <option value="daily" ${billingCycleType === 'daily' ? 'selected' : ''}>Daily</option>
              <option value="weekly" ${billingCycleType === 'weekly' ? 'selected' : ''}>Weekly</option>
              <option value="monthly" ${billingCycleType === 'monthly' ? 'selected' : ''}>Monthly</option>
              <option value="quarterly" ${billingCycleType === 'quarterly' ? 'selected' : ''}>Quarterly</option>
              <option value="yearly" ${billingCycleType === 'yearly' ? 'selected' : ''}>Yearly</option>
              <option value="custom" ${billingCycleType === 'custom' ? 'selected' : ''}>Custom</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Next Billing Date *</label>
            <input type="date" class="form-input" name="nextBillingDate" value="${nextBillingDateValue}" required>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Category</label>
          <select class="form-select" name="category">
            ${this.categories.map(c => `<option value="${c.name}" ${c.name === selectedCategory ? 'selected' : ''}>${c.icon} ${c.name}</option>`).join('')}
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Notes</label>
          <textarea class="form-textarea" name="notes">${subscription?.notes || ''}</textarea>
        </div>
      </form>
    `;
  }

  renderCurrencyOptionsWithSelection(selectedCurrency) {
    const currencies = currencyService.getCurrencies();
    return currencies.map(c => `
      <option value="${c.code}" ${c.code === selectedCurrency ? 'selected' : ''}>${c.code} - ${c.name}</option>
    `).join('');
  }

  saveSubscription(modal, existingId = null) {
    console.log('💾 saveSubscription called, existingId:', existingId);
    const form = modal.element.querySelector('#subscriptionForm');
    const formData = new FormData(form);

    try {
      const data = {
        name: formData.get('name'),
        cost: parseFloat(formData.get('cost')),
        currency: formData.get('currency'),
        billingCycle: {
          type: formData.get('billingCycleType')
        },
        nextBillingDate: new Date(formData.get('nextBillingDate')).toISOString(),
        category: formData.get('category'),
        notes: formData.get('notes')
      };

      console.log('📦 Subscription data prepared:', data);

      if (existingId) {
        console.log('✏️ Updating existing subscription:', existingId);
        subscriptionService.update(existingId, data);
        Toast.success('Subscription updated successfully!');
      } else {
        console.log('➕ Creating new subscription');
        subscriptionService.create(data);
        Toast.success('Subscription added successfully!');
      }

      modal.close();
      console.log('🔄 Reloading view:', this.currentView);
      this.loadView(this.currentView);
    } catch (error) {
      console.error('❌ Error saving subscription:', error);
      Toast.error(error.message);
    }
  }

  editSubscription(id) {
    console.log('✏️ editSubscription called with id:', id);
    const sub = subscriptionService.getById(id);

    if (!sub) {
      console.error('❌ Subscription not found:', id);
      Toast.error('Subscription not found');
      return;
    }

    console.log('📋 Editing subscription:', sub);

    const form = this.createSubscriptionForm(sub);
    const modal = new Modal('Edit Subscription', form, {
      footer: `
        <button class="btn btn-secondary" data-action="cancel">Cancel</button>
        <button class="btn btn-primary" data-action="save">Update</button>
      `
    });

    modal.open();
    console.log('✅ Edit modal opened');

    modal.element.querySelector('[data-action="save"]').addEventListener('click', () => {
      console.log('💾 Update button clicked');
      this.saveSubscription(modal, id);
    });

    modal.element.querySelector('[data-action="cancel"]').addEventListener('click', () => {
      console.log('❌ Cancel clicked in edit modal');
      modal.close();
    });
  }

  deleteSubscription(id) {
    console.log('🗑️ deleteSubscription called with id:', id);

    Modal.confirm('Delete Subscription', 'Are you sure you want to delete this subscription?', () => {
      console.log('✅ User confirmed deletion');
      try {
        subscriptionService.delete(id);
        console.log('✅ Subscription deleted:', id);
        Toast.success('Subscription deleted');
        this.loadView(this.currentView);
      } catch (error) {
        console.error('❌ Error deleting subscription:', error);
        Toast.error('Failed to delete subscription: ' + error.message);
      }
    });
  }

  showAddBudgetModal() {
    console.log('💰 showAddBudgetModal called');

    try {
      const form = this.createBudgetForm();
      console.log('✅ Budget form created');

      const modal = new Modal('Create Budget', form, {
        footer: `
          <button class="btn btn-secondary" data-action="cancel">Cancel</button>
          <button class="btn btn-primary" data-action="save">Create Budget</button>
        `
      });

      modal.open();
      console.log('✅ Budget modal opened');

      // Setup period toggle
      const budgetTypeSelect = modal.element.querySelector('[name="budgetType"]');
      const categoryGroup = modal.element.querySelector('#categoryGroup');

      budgetTypeSelect.addEventListener('change', (e) => {
        console.log('📊 Budget type changed to:', e.target.value);
        if (e.target.value === 'category') {
          categoryGroup.style.display = 'block';
        } else {
          categoryGroup.style.display = 'none';
        }
      });

      modal.element.querySelector('[data-action="save"]').addEventListener('click', () => {
        console.log('💾 Create budget button clicked');
        this.saveBudget(modal);
      });

      modal.element.querySelector('[data-action="cancel"]').addEventListener('click', () => {
        console.log('❌ Cancel clicked in budget modal');
        modal.close();
      });
    } catch (error) {
      console.error('❌ Error in showAddBudgetModal:', error);
      Toast.error('Failed to open budget modal: ' + error.message);
    }
  }

  createBudgetForm() {
    console.log('📝 Creating budget form');

    return `
      <form id="budgetForm">
        <div class="form-group">
          <label class="form-label">Budget Type *</label>
          <select class="form-select" name="budgetType" required>
            <option value="monthly">Monthly Budget</option>
            <option value="yearly">Yearly Budget</option>
            <option value="category">Category Budget</option>
          </select>
          <small style="color: var(--text-secondary); font-size: 12px;">
            Choose whether this budget applies monthly, yearly, or to a specific category
          </small>
        </div>

        <div id="categoryGroup" class="form-group" style="display: none;">
          <label class="form-label">Category *</label>
          <select class="form-select" name="category">
            ${this.categories.map(c => `<option value="${c.name}">${c.icon} ${c.name}</option>`).join('')}
          </select>
        </div>

        <div class="grid grid-cols-2">
          <div class="form-group">
            <label class="form-label">Budget Amount *</label>
            <input type="number" class="form-input" name="amount" step="0.01" min="0" required>
            <small style="color: var(--text-secondary); font-size: 12px;">
              Maximum spending limit
            </small>
          </div>

          <div class="form-group">
            <label class="form-label">Currency</label>
            <select class="form-select" name="currency">
              ${this.renderCurrencyOptionsWithSelection(this.settings.defaultCurrency)}
            </select>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Alert Threshold (%)</label>
          <input type="number" class="form-input" name="alertThreshold" value="80" min="0" max="100" step="5">
          <small style="color: var(--text-secondary); font-size: 12px;">
            Get notified when spending reaches this percentage (default: 80%)
          </small>
        </div>

        <div class="form-group">
          <label class="form-label" style="display: flex; align-items: center; gap: 8px;">
            <input type="checkbox" name="isActive" checked style="width: auto;">
            <span>Active</span>
          </label>
          <small style="color: var(--text-secondary); font-size: 12px;">
            Inactive budgets won't show alerts
          </small>
        </div>
      </form>
    `;
  }

  saveBudget(modal) {
    console.log('💾 saveBudget called');
    const form = modal.element.querySelector('#budgetForm');
    const formData = new FormData(form);

    try {
      const budgetType = formData.get('budgetType');
      const category = formData.get('category');

      const data = {
        type: budgetType,
        amount: parseFloat(formData.get('amount')),
        currency: formData.get('currency'),
        alertThreshold: parseInt(formData.get('alertThreshold')) || 80,
        isActive: formData.get('isActive') === 'on'
      };

      // Add category if it's a category budget
      if (budgetType === 'category') {
        data.category = category;
        console.log('📂 Category budget for:', category);
      }

      // Set period for monthly/yearly budgets
      if (budgetType === 'monthly' || budgetType === 'yearly') {
        const now = new Date();
        data.period = {
          year: now.getFullYear(),
          month: budgetType === 'monthly' ? now.getMonth() + 1 : null
        };
        console.log('📅 Budget period:', data.period);
      }

      console.log('📦 Budget data prepared:', data);

      budgetService.create(data);
      console.log('✅ Budget created successfully');

      Toast.success('Budget created successfully!');
      modal.close();
      console.log('🔄 Reloading view:', this.currentView);
      this.loadView(this.currentView);
    } catch (error) {
      console.error('❌ Error saving budget:', error);
      Toast.error('Failed to create budget: ' + error.message);
    }
  }

  updateCurrencySettings() {
    console.log('💱 updateCurrencySettings called');
    const select = document.getElementById('defaultCurrency');

    if (select) {
      const newCurrency = select.value;
      console.log('💱 Updating currency from', this.settings.defaultCurrency, 'to', newCurrency);

      this.settings.defaultCurrency = newCurrency;
      storageService.setSettings(this.settings.toJSON());
      console.log('✅ Currency settings saved');

      Toast.success('Currency settings updated!');
    } else {
      console.error('❌ Currency select not found');
    }
  }

  async exportData() {
    console.log('📤 exportData called');

    if (!window.electronAPI) {
      console.error('❌ electronAPI not available');
      Toast.error('Export is only available in desktop app');
      return;
    }

    console.log('📊 Exporting all data...');
    const data = storageService.exportAll();
    console.log('📦 Data to export:', {
      subscriptions: data.subscriptions?.length || 0,
      budgets: data.budgets?.length || 0,
      categories: data.categories?.length || 0
    });

    console.log('💾 Calling electronAPI.exportData with CSV format...');
    const result = await window.electronAPI.exportData(data, 'csv');
    console.log('✅ Export result:', result);

    if (result.success) {
      console.log('✅ Export successful to:', result.filePath);
      Toast.success('Data exported to CSV successfully!');
    } else if (!result.canceled) {
      console.error('❌ Export failed:', result.error);
      Toast.error('Failed to export data: ' + (result.error || 'Unknown error'));
    } else {
      console.log('ℹ️ Export canceled by user');
    }
  }

  async importData() {
    console.log('📥 importData called');

    if (!window.electronAPI) {
      console.error('❌ electronAPI not available');
      Toast.error('Import is only available in desktop app');
      return;
    }

    console.log('💾 Calling electronAPI.importData...');
    const result = await window.electronAPI.importData();
    console.log('✅ Import result:', result);

    if (result.success) {
      console.log('📊 Importing data into storage...');
      storageService.importAll(result.data);
      console.log('✅ Data imported successfully');

      Toast.success('Data imported successfully!');
      console.log('🔄 Reloading page...');
      window.location.reload();
    } else if (!result.canceled) {
      console.error('❌ Import failed:', result.error);
      Toast.error('Failed to import data: ' + (result.error || 'Unknown error'));
    } else {
      console.log('ℹ️ Import canceled by user');
    }
  }
}

// Initialize app
console.log('🎬 Creating App instance...');
const app = new App();
console.log('✅ App instance created:', app);

if (document.readyState === 'loading') {
  console.log('⏳ Document still loading, waiting for DOMContentLoaded...');
  document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ DOMContentLoaded fired, initializing app...');
    app.init();
  });
} else {
  console.log('✅ Document ready, initializing app immediately...');
  app.init();
}

// Make app globally accessible for onclick handlers
window.app = app;
console.log('✅ window.app set to:', window.app);
console.log('✅ window.app.showAddSubscriptionModal:', window.app.showAddSubscriptionModal);
