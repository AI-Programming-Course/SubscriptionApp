const { app, BrowserWindow, ipcMain, dialog, Notification } = require('electron');
const path = require('path');
const fs = require('fs').promises;

console.log('Main.js loaded, app object:', typeof app);

// Helper function to convert data to CSV format (Google Sheets compatible)
function convertToCSV(data) {
  console.log('🔄 Converting to CSV...');

  const subscriptions = data.subscriptions || [];
  console.log('📋 Processing', subscriptions.length, 'subscriptions');

  if (subscriptions.length === 0) {
    return 'Name,Cost,Currency,Billing Cycle,Next Billing Date,Category,Status,Notes\n';
  }

  // CSV Headers
  const headers = [
    'Name',
    'Cost',
    'Currency',
    'Billing Cycle',
    'Next Billing Date',
    'Category',
    'Status',
    'Notes',
    'Created Date'
  ];

  // Helper to escape CSV fields
  const escapeCSV = (field) => {
    if (field === null || field === undefined) return '';
    const str = String(field);
    // Escape quotes and wrap in quotes if contains comma, quote, or newline
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  // Helper to format billing cycle
  const formatBillingCycle = (cycle) => {
    if (!cycle || !cycle.type) return 'Monthly';
    return cycle.type.charAt(0).toUpperCase() + cycle.type.slice(1);
  };

  // Helper to format date for Google Sheets
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      // Format as YYYY-MM-DD which Google Sheets recognizes
      return date.toISOString().split('T')[0];
    } catch (e) {
      return dateStr;
    }
  };

  // Build CSV rows
  const rows = subscriptions.map(sub => {
    return [
      escapeCSV(sub.name),
      escapeCSV(sub.cost),
      escapeCSV(sub.currency || 'USD'),
      escapeCSV(formatBillingCycle(sub.billingCycle)),
      escapeCSV(formatDate(sub.nextBillingDate)),
      escapeCSV(sub.category || 'Other'),
      escapeCSV(sub.isActive ? 'Active' : 'Inactive'),
      escapeCSV(sub.notes || ''),
      escapeCSV(formatDate(sub.createdAt))
    ].join(',');
  });

  const csv = [headers.join(','), ...rows].join('\n');
  console.log('✅ CSV created,', rows.length, 'rows');

  return csv;
}

// Set app user model id for Windows notifications
if (process.platform === 'win32') {
  app.setAppUserModelId('com.subscriptiontracker.app');
}

let mainWindow = null;
const isDevMode = process.argv.includes('--dev');

// Setup IPC handlers
function setupIpcHandlers() {
  // Get app version
  ipcMain.handle('get-app-version', () => {
    return app.getVersion();
  });

  // Export data
  ipcMain.handle('export-data', async (event, data, format = 'csv') => {
    console.log('📤 Export data handler called, format:', format);
    console.log('📊 Data keys:', Object.keys(data));

    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const defaultPath = format === 'csv'
        ? `subscription-export-${timestamp}.csv`
        : `subscription-backup-${timestamp}.json`;

      const filters = format === 'csv'
        ? [
            { name: 'CSV Files', extensions: ['csv'] },
            { name: 'All Files', extensions: ['*'] }
          ]
        : [
            { name: 'JSON Files', extensions: ['json'] },
            { name: 'All Files', extensions: ['*'] }
          ];

      console.log('💾 Opening save dialog...');
      const { filePath, canceled } = await dialog.showSaveDialog(mainWindow, {
        title: 'Export Subscription Data',
        defaultPath,
        filters
      });

      if (canceled) {
        console.log('❌ Export canceled by user');
        return { success: false, canceled: true };
      }

      console.log('✅ Save path selected:', filePath);

      let fileContent;
      if (format === 'csv') {
        fileContent = convertToCSV(data);
        console.log('📝 Converted to CSV, length:', fileContent.length);
      } else {
        fileContent = JSON.stringify(data, null, 2);
        console.log('📝 Converted to JSON, length:', fileContent.length);
      }

      await fs.writeFile(filePath, fileContent, 'utf8');
      console.log('✅ File written successfully');
      return { success: true, filePath };
    } catch (error) {
      console.error('❌ Export error:', error);
      return { success: false, error: error.message };
    }
  });

  // Import data
  ipcMain.handle('import-data', async () => {
    try {
      const { filePaths, canceled } = await dialog.showOpenDialog(mainWindow, {
        title: 'Import Subscription Data',
        filters: [
          { name: 'JSON Files', extensions: ['json'] },
          { name: 'All Files', extensions: ['*'] }
        ],
        properties: ['openFile']
      });

      if (canceled || filePaths.length === 0) {
        return { success: false, canceled: true };
      }

      const fileContent = await fs.readFile(filePaths[0], 'utf8');
      const data = JSON.parse(fileContent);

      return { success: true, data };
    } catch (error) {
      console.error('Import error:', error);
      return { success: false, error: error.message };
    }
  });

  // Schedule notification
  ipcMain.handle('schedule-notification', async (event, subscription, daysUntil) => {
    if (Notification.isSupported()) {
      new Notification({
        title: 'Subscription Renewal',
        body: `${subscription.name} renews in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`,
        icon: path.join(__dirname, 'assets/icon.png')
      }).show();
    }
    return { success: true };
  });
}

// Initialize app when ready
app.whenReady().then(() => {
  console.log('App is ready!');

  // Setup IPC handlers
  setupIpcHandlers();

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'Subscription Tracker',
    backgroundColor: '#ffffff',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
      preload: path.join(__dirname, 'preload.js')
    },
    show: false
  });

  // Load the index.html
  mainWindow.loadFile('src/renderer/index.html');

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();

    // Open DevTools in dev mode
    if (isDevMode) {
      mainWindow.webContents.openDevTools();
    }
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  console.log('Window created successfully');
});

// macOS specific: re-create window when dock icon is clicked
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0 && !mainWindow) {
    // Re-create window logic here
  }
});

// Handle all windows closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at:', promise, 'reason:', reason);
});
