const { Menu, app, shell } = require('electron');

class MenuBuilder {
  constructor(windowManager) {
    this.windowManager = windowManager;
  }

  buildMenu() {
    const template = [
      // App menu (macOS)
      ...(process.platform === 'darwin' ? [{
        label: app.name,
        submenu: [
          { role: 'about' },
          { type: 'separator' },
          { role: 'services' },
          { type: 'separator' },
          { role: 'hide' },
          { role: 'hideOthers' },
          { role: 'unhide' },
          { type: 'separator' },
          { role: 'quit' }
        ]
      }] : []),

      // File menu
      {
        label: 'File',
        submenu: [
          {
            label: 'New Subscription',
            accelerator: 'CmdOrCtrl+N',
            click: () => {
              this.windowManager.getMainWindow()?.webContents.send('menu-new-subscription');
            }
          },
          { type: 'separator' },
          {
            label: 'Import Data',
            click: () => {
              this.windowManager.getMainWindow()?.webContents.send('menu-import');
            }
          },
          {
            label: 'Export Data',
            click: () => {
              this.windowManager.getMainWindow()?.webContents.send('menu-export');
            }
          },
          { type: 'separator' },
          process.platform === 'darwin' ? { role: 'close' } : { role: 'quit' }
        ]
      },

      // Edit menu
      {
        label: 'Edit',
        submenu: [
          { role: 'undo' },
          { role: 'redo' },
          { type: 'separator' },
          { role: 'cut' },
          { role: 'copy' },
          { role: 'paste' },
          { role: 'delete' },
          { type: 'separator' },
          { role: 'selectAll' }
        ]
      },

      // View menu
      {
        label: 'View',
        submenu: [
          {
            label: 'Dashboard',
            accelerator: 'CmdOrCtrl+1',
            click: () => {
              this.windowManager.getMainWindow()?.webContents.send('menu-navigate', 'dashboard');
            }
          },
          {
            label: 'Subscriptions',
            accelerator: 'CmdOrCtrl+2',
            click: () => {
              this.windowManager.getMainWindow()?.webContents.send('menu-navigate', 'subscriptions');
            }
          },
          {
            label: 'Analytics',
            accelerator: 'CmdOrCtrl+3',
            click: () => {
              this.windowManager.getMainWindow()?.webContents.send('menu-navigate', 'analytics');
            }
          },
          {
            label: 'Budget',
            accelerator: 'CmdOrCtrl+4',
            click: () => {
              this.windowManager.getMainWindow()?.webContents.send('menu-navigate', 'budget');
            }
          },
          { type: 'separator' },
          { role: 'reload' },
          { role: 'forceReload' },
          { role: 'toggleDevTools' },
          { type: 'separator' },
          { role: 'resetZoom' },
          { role: 'zoomIn' },
          { role: 'zoomOut' },
          { type: 'separator' },
          { role: 'togglefullscreen' }
        ]
      },

      // Window menu
      {
        label: 'Window',
        submenu: [
          { role: 'minimize' },
          { role: 'zoom' },
          ...(process.platform === 'darwin' ? [
            { type: 'separator' },
            { role: 'front' },
            { type: 'separator' },
            { role: 'window' }
          ] : [
            { role: 'close' }
          ])
        ]
      },

      // Help menu
      {
        role: 'help',
        submenu: [
          {
            label: 'Learn More',
            click: async () => {
              await shell.openExternal('https://github.com');
            }
          },
          {
            label: 'Documentation',
            click: async () => {
              await shell.openExternal('https://github.com');
            }
          }
        ]
      }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  }
}

module.exports = MenuBuilder;
