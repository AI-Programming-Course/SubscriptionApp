const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Notification API
  scheduleNotification: (subscription, daysUntil) =>
    ipcRenderer.invoke('schedule-notification', subscription, daysUntil),

  // App info
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),

  // Data import/export
  exportData: (data) => ipcRenderer.invoke('export-data', data),
  importData: () => ipcRenderer.invoke('import-data'),

  // External links
  openExternal: (url) => ipcRenderer.invoke('open-external', url),

  // Menu event listeners
  onMenuNewSubscription: (callback) => {
    ipcRenderer.on('menu-new-subscription', callback);
  },
  onMenuImport: (callback) => {
    ipcRenderer.on('menu-import', callback);
  },
  onMenuExport: (callback) => {
    ipcRenderer.on('menu-export', callback);
  },
  onMenuNavigate: (callback) => {
    ipcRenderer.on('menu-navigate', (event, view) => callback(view));
  },

  // Remove listeners
  removeListener: (channel, callback) => {
    ipcRenderer.removeListener(channel, callback);
  }
});

// Platform information
contextBridge.exposeInMainWorld('platform', {
  isMac: process.platform === 'darwin',
  isWindows: process.platform === 'win32',
  isLinux: process.platform === 'linux'
});

console.log('[Preload] Context bridge established successfully');
