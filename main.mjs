import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';



 
const __dirname = path.dirname(fileURLToPath(import.meta.url));



async function openDb() {
    return open({
        filename: 'database.db',
        driver: sqlite3.Database
    });
}


async function setupDatabase() {
    const db = await openDb();
    await db.exec(`
        CREATE TABLE IF NOT EXISTS snippets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            text TEXT
        )
    `);
    return db;
}


function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
       autoHideMenuBar: true,
       icon : "build/icon.ico",
        webPreferences: {
            preload: path.join(__dirname, 'renderer.js'),
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    mainWindow.loadFile(path.join(__dirname, 'index.html'));
}


app.whenReady().then(async () => {
    try {
        const db = await setupDatabase();
        createWindow();

      
        ipcMain.handle('get-snippets', async () => {
            try {
                const snippets = await db.all('SELECT * FROM snippets');
                return snippets;
            } catch (error) {
                console.error('Failed to fetch snippets:', error);
                throw error;
            }
        });

        ipcMain.handle('add-snippet', async (event, snippet) => {
            try {
                await db.run('INSERT INTO snippets (text) VALUES (?)', snippet.text);
            } catch (error) {
                console.error('Failed to add snippet:', error);
                throw error;
            }
        });

        ipcMain.handle('delete-snippet', async (event, { id }) => {
            try {
                await db.run('DELETE FROM snippets WHERE id = ?', [id]);
            } catch (error) {
                console.error('Failed to delete snippet:', error);
                throw error;
            }
        });
    } catch (error) {
        console.error('Failed to initialize app:', error);
        app.quit();
    }
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
