'use strict';
const electron = require('electron');
const events = require('events');
const app = electron.app;
const Tray = electron.Tray;
const BrowserWindow = electron.BrowserWindow;

electron.crashReporter.start();

let trayIcon = null;
let trayWindow = null;
let arrowWindow = null;

let trayapp = new events.EventEmitter();
trayapp.app = app;

// Arrow window.
trayapp.setArrowWindow = function() {
  // trayapp.emit('createArrowWindow');

  arrowWindow = new BrowserWindow({
    width             : 40,
    height            : 40,
    show              : false,
    frame             : false,
    fullscreen        : false,
    transparent       : true,
    resizable         : false
  });

  arrowWindow.loadURL('file://' + __dirname + '/arrow.html');

  arrowWindow.on('focus', function() {
    if (trayWindow) trayWindow.show();
  });

  arrowWindow.on('closed', function() {
    arrowWindow = null;
  });
};

// Tray window
trayapp.setTrayWindow = function() {
  // trayapp.emit('createTrayWindow');

  trayWindow = new BrowserWindow({
    width       : 350,
    height      : 325,
    show        : false,
    frame       : false,
    resizable   : false
  });

  trayWindow.loadURL('file://' + __dirname + '/index.html');

  trayWindow.on('blur', function() {
    arrowWindow.hide();
    trayWindow.hide();
  });

  trayWindow.on('closed', function() {
    trayWindow = null;
  });
};

// Tray icon.
trayapp.setTray = function() {
  // trayapp.emit('createTrayIcon');

  trayIcon = new Tray(__dirname + '/icons/trayIcon.png');
  trayIcon.setToolTip('App name');
  trayIcon.on('click', function(event, bounds) {
    trayapp.toggleTrayWindow(bounds);
  });
};

// Show/hide trayWindow.
trayapp.toggleTrayWindow = function(bounds) {
  // trayapp.emit('trayWindowShow');

  const trayWindowBounds = trayWindow.getBounds();
  const x = (bounds.x + (bounds.width / 2)) - (trayWindowBounds.width / 2);

  trayWindow.setPosition(
    Math.ceil(x),
    bounds.y + 33
  );

  arrowWindow.setPosition(
    Math.ceil(bounds.x) - 5,
    bounds.y
  );

  if (trayWindow && trayWindow.isVisible()) {
    trayWindow.hide();
    arrowWindow.hide();
    trayapp.emit('trayWindowHide');

    return;
  }

  arrowWindow.show();
  trayWindow.show();
};

app.on('window-all-closed', function() {
  if (process.platform != 'darwin') {
    app.quit();
  }
});

app.on('ready', function() {
  // trayapp.emit('ready');

  trayapp.setArrowWindow();
  trayapp.setTrayWindow();
  trayapp.setTray();
});
