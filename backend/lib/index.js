"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var broadcaster_1 = require("./broadcaster");
function createWindow() {
    var window = new electron_1.BrowserWindow({
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
    window.on('closed', function () { });
    var broadcaster = new broadcaster_1.Broadcaster(window);
    return window.loadFile('res/index.html');
}
electron_1.app.whenReady().then(function () {
    electron_1.app.on('activate', function () {
        if (electron_1.BrowserWindow.getAllWindows().length === 0)
            return createWindow();
    });
    return createWindow();
});
electron_1.app.on('window-all-closed', function () {
    if (process.platform !== 'darwin')
        electron_1.app.quit();
});

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEscUNBQTRDO0FBRTVDLDZDQUEwQztBQUUxQyxTQUFTLFlBQVk7SUFDakIsSUFBTSxNQUFNLEdBQUcsSUFBSSx3QkFBYSxDQUFDO1FBQzdCLEtBQUssRUFBRSxHQUFHO1FBQ1YsTUFBTSxFQUFFLEdBQUc7UUFDWCxXQUFXLEVBQUUsS0FBSztRQUNsQixTQUFTLEVBQUUsS0FBSztRQUNoQixlQUFlLEVBQUUsSUFBSTtRQUNyQixjQUFjLEVBQUU7WUFDWixlQUFlLEVBQUUsSUFBSTtZQUNyQixnQkFBZ0IsRUFBRSxLQUFLO1NBQzFCO0tBQ0osQ0FBQyxDQUFDO0lBQ0gsTUFBTSxDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQUUsY0FBWSxDQUFDLENBQUMsQ0FBQztJQUNuQyxJQUFJLFdBQVcsR0FBRyxJQUFJLHlCQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDMUMsT0FBTyxNQUFNLENBQUMsUUFBUSxDQUFDLGdCQUFnQixDQUFDLENBQUM7QUFDN0MsQ0FBQztBQUVELGNBQUcsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxJQUFJLENBQUM7SUFDakIsY0FBRyxDQUFDLEVBQUUsQ0FBQyxVQUFVLEVBQUU7UUFDZixJQUFJLHdCQUFhLENBQUMsYUFBYSxFQUFFLENBQUMsTUFBTSxLQUFLLENBQUM7WUFDMUMsT0FBTyxZQUFZLEVBQUUsQ0FBQztJQUM5QixDQUFDLENBQUMsQ0FBQztJQUNILE9BQU8sWUFBWSxFQUFFLENBQUM7QUFDMUIsQ0FBQyxDQUFDLENBQUM7QUFFSCxjQUFHLENBQUMsRUFBRSxDQUFDLG1CQUFtQixFQUFFO0lBQ3hCLElBQUksT0FBTyxDQUFDLFFBQVEsS0FBSyxRQUFRO1FBQzdCLGNBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUNuQixDQUFDLENBQUMsQ0FBQyIsImZpbGUiOiJpbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7YXBwLCBCcm93c2VyV2luZG93fSBmcm9tICdlbGVjdHJvbic7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gXCJwYXRoXCI7XG5pbXBvcnQge0Jyb2FkY2FzdGVyfSBmcm9tIFwiLi9icm9hZGNhc3RlclwiO1xuXG5mdW5jdGlvbiBjcmVhdGVXaW5kb3coKXtcbiAgICBjb25zdCB3aW5kb3cgPSBuZXcgQnJvd3NlcldpbmRvdyh7XG4gICAgICAgIHdpZHRoOiA1MDAsXG4gICAgICAgIGhlaWdodDogNjAwLFxuICAgICAgICBtYXhpbWl6YWJsZTogZmFsc2UsXG4gICAgICAgIHJlc2l6YWJsZTogZmFsc2UsXG4gICAgICAgIGF1dG9IaWRlTWVudUJhcjogdHJ1ZSxcbiAgICAgICAgd2ViUHJlZmVyZW5jZXM6IHtcbiAgICAgICAgICAgIG5vZGVJbnRlZ3JhdGlvbjogdHJ1ZSxcbiAgICAgICAgICAgIGNvbnRleHRJc29sYXRpb246IGZhbHNlLFxuICAgICAgICB9XG4gICAgfSk7XG4gICAgd2luZG93Lm9uKCdjbG9zZWQnLCBmdW5jdGlvbiAoKXt9KTtcbiAgICBsZXQgYnJvYWRjYXN0ZXIgPSBuZXcgQnJvYWRjYXN0ZXIod2luZG93KTtcbiAgICByZXR1cm4gd2luZG93LmxvYWRGaWxlKCdyZXMvaW5kZXguaHRtbCcpO1xufVxuXG5hcHAud2hlblJlYWR5KCkudGhlbihmdW5jdGlvbiAoKXtcbiAgICBhcHAub24oJ2FjdGl2YXRlJywgZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoQnJvd3NlcldpbmRvdy5nZXRBbGxXaW5kb3dzKCkubGVuZ3RoID09PSAwKVxuICAgICAgICAgICAgcmV0dXJuIGNyZWF0ZVdpbmRvdygpO1xuICAgIH0pO1xuICAgIHJldHVybiBjcmVhdGVXaW5kb3coKTtcbn0pO1xuXG5hcHAub24oJ3dpbmRvdy1hbGwtY2xvc2VkJywgZnVuY3Rpb24gKCkge1xuICAgIGlmIChwcm9jZXNzLnBsYXRmb3JtICE9PSAnZGFyd2luJylcbiAgICAgICAgYXBwLnF1aXQoKTtcbn0pO1xuIl19
