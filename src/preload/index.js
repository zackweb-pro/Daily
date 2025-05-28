import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  // Journal functionality
  journal: {
    getAll: () => ipcRenderer.invoke('journal:getAll'),
    getEntry: (id) => ipcRenderer.invoke('journal:getEntry', id),
    saveEntry: (entry) => ipcRenderer.invoke('journal:saveEntry', entry),
    deleteEntry: (id) => ipcRenderer.invoke('journal:deleteEntry', id)
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}
