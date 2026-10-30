const { app, BrowserWindow } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');

function getIndexPath() {
  // Opens on index.html - the login screen where a teacher or a student
  // signs in. After logging in it goes to rasymas.html, the main
  // note-writing screen, whose sidebar "Žaidimai" button opens the games
  // list (zaidimai.html). That list currently offers one game, "Judėk
  // kartu"; the older games are still in build/html but are not listed.
  // setWindowOpenHandler below still covers the zaidimai.html pop-out used
  // from smoosic.html (the full notation editor).
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'build', 'html', 'index.html');
  }
  return path.join(__dirname, '..', 'build', 'html', 'index.html');
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
