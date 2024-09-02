const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    saveData: (filePath, data) => ipcRenderer.invoke('save-data', filePath, data),
    loadData: (filePath) => ipcRenderer.invoke('load-data', filePath),

    // Exponera saveMeasurement till renderer-processen
    saveMeasurement: (timestamp, measurement, setpoint, valve, P, I, D) => {
        return ipcRenderer.invoke('save-measurement', { timestamp, measurement, setpoint, valve, P, I, D });
    }
});