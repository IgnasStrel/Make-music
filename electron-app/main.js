const { app, BrowserWindow } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');

function getIndexPath() {
  // Packaged app: the "build" folder is copied next to the app under resources/.
  // Dev mode (npm start): read straight from the project's own build/ folder.
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'build', 'html', 'klausa.html');
  }
  return path.join(__dirname, '..', 'build', 'html', 'klausa.html');
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 960,
    minHeight: 640,
    autoHideMenuBar: true,
    icon: path.join(__dirname, 'icon.png'),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  win.loadFile(getIndexPath());
}

function checkForUpdates() {
  // Only makes sense for an installed (packaged) app - in dev mode there is
  // no update feed and electron-updater would just throw.
  if (!app.isPackaged) { return; }
  try {
    // Downloads a newer release from GitHub in the background, if one exists.
    // It installs automatically the next time the app is closed and reopened,
    // so the child/parent never has to manually download a new installer.
    autoUpdater.autoInstallOnAppQuit = true;
    autoUpdater.checkForUpdatesAndNotify();
  } catch (err) {
    console.error('Update check failed:', err);
  }
}

app.whenReady().then(() => {
  createWindow();
  checkForUpdates();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) { createWindow(); }
  });
});

autoUpdater.on('error', (err) => {
  console.error('Auto-update error:', err);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') { app.quit(); }
});
