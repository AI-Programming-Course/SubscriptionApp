const { app, BrowserWindow, ipcMain, Notification } = require('electron');
const path = require('path');

// Import main process modules
const WindowManager = require('./src/main/window-manager');
const NotificationManager = require('./src/main/notification-manager');
const MenuBuilder = require('./src/main/menu');
const IPCHandlers = require('./src/main/ipc-handlers');

class SubscriptionTrackerApp {
  constructor() {
    this.windowManager = null;
    this.notificationManager = null;
    this.isDevMode = process.argv.includes('--dev');
  }

  async initialize() {
    // Set app user model id for Windows notifications
    if (process.platform === 'win32') {
      app.setAppUserModelId('com.subscriptiontracker.app');
    }

    // Wait for app to be ready
    await app.whenReady();

    // Initialize managers
    this.windowManager = new WindowManager(this.isDevMode);
    this.notificationManager = new NotificationManager();

    // Set up IPC handlers
    IPCHandlers.setupHandlers(ipcMain, this.notificationManager);

    // Create main window
    await this.windowManager.createMainWindow();

    // Build application menu
    const menuBuilder = new MenuBuilder(this.windowManager);
    menuBuilder.buildMenu();

    // Start notification service
    this.notificationManager.start();

    // macOS specific: re-create window when dock icon is clicked
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        this.windowManager.createMainWindow();
      }
    });

    // Handle all windows closed
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    // Handle app quit
    app.on('before-quit', () => {
      if (this.notificationManager) {
        this.notificationManager.stop();
      }
    });
  }
}

// Create app instance and initialize
const subscriptionApp = new SubscriptionTrackerApp();
subscriptionApp.initialize().catch(console.error);

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at:', promise, 'reason:', reason);
});
