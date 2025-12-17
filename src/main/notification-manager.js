const { Notification } = require('electron');

class NotificationManager {
  constructor() {
    this.checkInterval = null;
    this.notificationQueue = [];
    this.sentNotifications = new Map();
  }

  start() {
    // Check for upcoming renewals every hour
    this.checkInterval = setInterval(() => {
      this.checkUpcomingRenewals();
    }, 60 * 60 * 1000);

    // Also check immediately on start
    setTimeout(() => this.checkUpcomingRenewals(), 5000);
  }

  stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  checkUpcomingRenewals() {
    // This will be called by the renderer process via IPC
    // For now, we'll just log that we're checking
    console.log('[NotificationManager] Checking for upcoming renewals...');
  }

  sendNotification(subscription, daysUntil) {
    // Create unique notification ID
    const notificationId = `${subscription.id}-${daysUntil}`;

    // Check if we already sent this notification today
    const today = new Date().toDateString();
    const lastSent = this.sentNotifications.get(notificationId);

    if (lastSent === today) {
      return; // Already sent today
    }

    // Check if notifications are supported
    if (!Notification.isSupported()) {
      console.warn('Notifications are not supported on this system');
      return;
    }

    const notification = new Notification({
      title: 'Subscription Renewal Reminder',
      body: `${subscription.name} renews in ${daysUntil} day${daysUntil !== 1 ? 's' : ''} - ${subscription.cost} ${subscription.currency}`,
      silent: false,
      urgency: daysUntil <= 1 ? 'critical' : 'normal'
    });

    notification.on('click', () => {
      console.log('[NotificationManager] Notification clicked:', subscription.id);
      // Emit event to focus window and navigate to subscription
      // This will be handled via IPC
    });

    notification.show();

    // Mark as sent
    this.sentNotifications.set(notificationId, today);

    // Clean up old notification records (older than 7 days)
    this.cleanupOldNotifications();
  }

  cleanupOldNotifications() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const cutoffDate = sevenDaysAgo.toDateString();

    for (const [id, date] of this.sentNotifications.entries()) {
      if (new Date(date) < new Date(cutoffDate)) {
        this.sentNotifications.delete(id);
      }
    }
  }

  scheduleNotification(subscription, daysUntil) {
    this.sendNotification(subscription, daysUntil);
  }
}

module.exports = NotificationManager;
