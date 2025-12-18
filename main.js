const { app, BrowserWindow, ipcMain, dialog, Notification } = require('electron');
const path = require('path');
const fs = require('fs').promises;

console.log('Main.js loaded, app object:', typeof app);

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
  ipcMain.handle('export-data', async (event, data) => {
    try {
      const { filePath, canceled } = await dialog.showSaveDialog(mainWindow, {
        title: 'Export Subscription Data',
        defaultPath: `subscription-backup-${Date.now()}.json`,
        filters: [
          { name: 'JSON Files', extensions: ['json'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      });

      if (canceled) {
        return { success: false, canceled: true };
      }

      await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
      return { success: true };
    } catch (error) {
      console.error('Export error:', error);
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
