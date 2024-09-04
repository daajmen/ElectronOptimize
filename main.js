const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { saveMeasurement } = require('./database');

function createWindow() {
    const win = new BrowserWindow({
        width: 1280,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    win.loadFile('index.html');
}

ipcMain.handle('save-data', (event, filePath, data) => {
    fs.writeFileSync(filePath, JSON.stringify(data));
});

ipcMain.handle('load-data', (event, filePath) => {
    if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } else {
        return null;
    }
});

// Hantera IPC för att spara mätningar
ipcMain.handle('save-measurement', (event, data) => {
    const { timestamp, measurement, setpoint, valve, P, I, D } = data;
    saveMeasurement(timestamp, measurement, setpoint, valve, P, I, D); // Använd funktionen från database.js
});

app.whenReady().then(createWindow);
