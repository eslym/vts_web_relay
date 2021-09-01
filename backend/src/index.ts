import {app, BrowserWindow} from 'electron';
import * as path from "path";
import {Broadcaster} from "./broadcaster";

function createWindow(){
    const window = new BrowserWindow({
        width: 500,
        height: 600,
        maximizable: false,
        resizable: false,
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }
    });
    window.on('closed', function (){});
    let broadcaster = new Broadcaster(window);
    return window.loadFile('res/index.html');
}

app.whenReady().then(function (){
    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0)
            return createWindow();
    });
    return createWindow();
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin')
        app.quit();
});
