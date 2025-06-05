import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import fs from 'fs'
import { promisify } from 'util'
import path from 'path'

const writeFileAsync = promisify(fs.writeFile)
const readFileAsync = promisify(fs.readFile)
const mkdirAsync = promisify(fs.mkdir)
const accessAsync = promisify(fs.access)
const readdirAsync = promisify(fs.readdir)
const unlinkAsync = promisify(fs.unlink)

// Journal data directory
const getJournalDir = () => {
  return path.join(app.getPath('userData'), 'journals')
}

// Ensure journal directory exists
async function ensureJournalDir() {
  const dir = getJournalDir()
  try {
    await accessAsync(dir)
  } catch (error) {
    await mkdirAsync(dir, { recursive: true })
  }
  return dir
}

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    title: 'DAILY',
    width: 1024,
    height: 768,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron.DAILY')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // Ensure journal directory exists
  await ensureJournalDir()

  // Journal IPC handlers
  setupJournalHandlers()

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// Set up IPC handlers for journal operations
function setupJournalHandlers() {
  // Get all journal entries
  ipcMain.handle('journal:getAll', async () => {
    const dir = await ensureJournalDir()
    const files = await readdirAsync(dir)

    const entries = await Promise.all(
      files
        .filter((file) => file.endsWith('.md'))
        .map(async (file) => {
          const filePath = path.join(dir, file)
          const content = await readFileAsync(filePath, 'utf-8')
          return {
            id: path.basename(file, '.md'),
            fileName: file,
            content,
            path: filePath
          }
        })
    )

    return entries
  })

  // Get a single entry by ID
  ipcMain.handle('journal:getEntry', async (_, id) => {
    const dir = await ensureJournalDir()
    const filePath = path.join(dir, `${id}.md`)
    try {
      const content = await readFileAsync(filePath, 'utf-8')
      return { id, content, path: filePath }
    } catch (error) {
      throw new Error(`Entry not found: ${id}`)
    }
  })

  // Save a journal entry
  ipcMain.handle('journal:saveEntry', async (_, { id, content }) => {
    try {
      if (!content) {
        throw new Error('Content is required')
      }

      const dir = await ensureJournalDir()
      const fileName = id || `entry-${Date.now()}`
      const filePath = path.join(dir, `${fileName}.md`)

      console.log(`Saving entry to ${filePath}`)

      // Make sure content is a string
      const contentString = String(content)

      // Use promisified writeFile
      await writeFileAsync(filePath, contentString, 'utf-8')

      console.log(`Entry saved successfully to ${filePath}`)

      return { id: fileName, path: filePath }
    } catch (error) {
      console.error('Error saving entry:', error)
      throw error // Re-throw to allow client to catch it
    }
  })

  // Delete a journal entry
  ipcMain.handle('journal:deleteEntry', async (_, id) => {
    const dir = await ensureJournalDir()
    const filePath = path.join(dir, `${id}.md`)

    await unlinkAsync(filePath)
    return { success: true }
  })
}

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
