const { app, BrowserWindow, screen } = require('electron');
const path = require('path');

function createWindow () {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize; 
  const win = new BrowserWindow({
    width: width,
    height: height,
    webPreferences: {
      devTools: false,
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // and load the index.html of the app.
  // win.loadFile('index.html')
  win.loadURL('http://localhost:5173');

  // Open the DevTools.
  win.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});