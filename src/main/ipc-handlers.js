class IPCHandlers {
  static setupHandlers(ipcMain, notificationManager) {
    // Handle notification scheduling from renderer
    ipcMain.handle('schedule-notification', async (event, subscription, daysUntil) => {
      try {
        notificationManager.scheduleNotification(subscription, daysUntil);
        return { success: true };
      } catch (error) {
        console.error('[IPC] Error scheduling notification:', error);
        return { success: false, error: error.message };
      }
    });

    // Handle getting app version
    ipcMain.handle('get-app-version', async () => {
      const { app } = require('electron');
      return app.getVersion();
    });

    // Handle data export
    ipcMain.handle('export-data', async (event, data) => {
      const { dialog } = require('electron');
      const fs = require('fs').promises;

      try {
        const { filePath, canceled } = await dialog.showSaveDialog({
          title: 'Export Subscription Data',
          defaultPath: `subscription-tracker-backup-${new Date().toISOString().split('T')[0]}.json`,
          filters: [
            { name: 'JSON Files', extensions: ['json'] },
            { name: 'All Files', extensions: ['*'] }
          ]
        });

        if (canceled || !filePath) {
          return { success: false, canceled: true };
        }

        await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
        return { success: true, filePath };
      } catch (error) {
        console.error('[IPC] Error exporting data:', error);
        return { success: false, error: error.message };
      }
    });

    // Handle data import
    ipcMain.handle('import-data', async () => {
      const { dialog } = require('electron');
      const fs = require('fs').promises;

      try {
        const { filePaths, canceled } = await dialog.showOpenDialog({
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
        console.error('[IPC] Error importing data:', error);
        return { success: false, error: error.message };
      }
    });

    // Handle opening external links
    ipcMain.handle('open-external', async (event, url) => {
      const { shell } = require('electron');
      try {
        await shell.openExternal(url);
        return { success: true };
      } catch (error) {
        console.error('[IPC] Error opening external link:', error);
        return { success: false, error: error.message };
      }
    });
  }
}

module.exports = IPCHandlers;
