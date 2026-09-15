const { app, BrowserWindow } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');

function getIndexPath() {
  // Packaged app: the "build" folder is copied next to the app under resources/.
  // Dev mode (npm start): read straight from the project's own build/ folder.
  // Opens straight into the full notation editor - the games (incl. the
  // "Klausyk - atspėk" listening game) live one click away, in the
  // "🎮 Žaidimai" button in the editor's right-hand sidebar, which pops
  // them out into their own window (see setWindowOpenHandler below).
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'build', 'html', 'smoosic.html');
  }
  return path.join(__dirname, '..', 'build', 'html', 'smoosic.html');
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

  // The "🎮 Žaidimai" button (and any game page's own links) call
  // window.open(...) to pop the games hub / a game out into its own window.
  // Electron denies popups by default unless a handler explicitly allows
  // them, so without this the button would silently do nothing.
  win.webContents.setWindowOpenHandler(() => ({
    action: 'allow',
    overrideBrowserWindowOptions: {
      width: 900,
      height: 760,
      autoHideMenuBar: true,
      icon: path.join(__dirname, 'icon.png'),
      webPreferences: {
        contextIsolation: true,
        nodeIntegration: false
      }
    }
  }));
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
