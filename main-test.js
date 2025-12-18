const { app, BrowserWindow } = require('electron');

console.log('Starting Electron...');

app.whenReady().then(() => {
  console.log('App is ready!');

  const win = new BrowserWindow({
    width: 800,
    height: 600
  });

  win.loadFile('src/renderer/index.html');

  console.log('Window created');
});

app.on('window-all-closed', () => {
  app.quit();
});
