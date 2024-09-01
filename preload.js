const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    saveData: (filePath, data) => ipcRenderer.invoke('save-data', filePath, data),
    loadData: (filePath) => ipcRenderer.invoke('load-data', filePath)
});
