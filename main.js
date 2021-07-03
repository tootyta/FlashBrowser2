
const electron = require('electron');
const path = require('path');

const { app, BrowserWindow, Menu} = electron; //Menu generated for the purposes of visiting new URLs.
const prompt = require('electron-prompt'); //prompting system to get user URL


let pluginName = null; //put the right flash plugin in depending on the operating system.
switch (process.platform) {
	case 'win32':
		switch (process.arch) {
			case 'ia32':
			case 'x32':
				pluginName = 'flashver/pepflashplayer32.dll'
				console.log("ran!");
				break
			case 'x64':
				pluginName = 'flashver/pepflashplayer64.dll'
				console.log("ran!");
				break
		}
		break
	case 'linux':
		switch (process.arch) {
			case 'ia32':
			case 'x32':
				pluginName = 'flashver/libpepflashplayer.so' // added and tested :D
				break
			case 'x64':
				pluginName = 'flashver/libpepflashplayer.so'
				break
		}

		app.commandLine.appendSwitch('no-sandbox');
		break
	case 'darwin':
		pluginName = 'flashver/PepperFlashPlayer.plugin'
		break
}
app.commandLine.appendSwitch('ppapi-flash-path', path.join(__dirname, pluginName));
//CACHE IS ENABLED but restarted on launch!
//TODO: Support importing custom .swf files to play

let mainWindow;

function promptIt(isSplash, win) { //function to handle prompting
	prompt({
		title: "Flash Browser",
		label: "URL: ",
		inputAttrs: {
			type: 'url'
		},
		type: 'input'
	})
		.then((r) => {
			if (r == null) {
				console.log("user cancelled!");
			} else {
				console.log('result', r);
				if (isSplash) {
					win.loadURL(r);
				}
				else {
					win.loadURL(r);
					win.maximize();
					setTimeout(() => {
						win.show(); //pauses program for 1 second to allow web-page to load before rendering.
					}, 1000);
                }

			}
		}).catch(console.error)
}


app.on('ready', function () {
	var menu = Menu.buildFromTemplate([
		{
			label: 'Menu',
			submenu: [
				{
					label: 'Change URL',
					click() {
						promptIt(true, win);
                    }
				},
				{
					label: 'Exit',
					click() {
						app.quit();
                    }
				}
			]
		}
	])
	Menu.setApplicationMenu(menu);
	
	let win = new BrowserWindow({
		show: false,
		webPreferences: {
			plugins: true
		}
	})
	promptIt(false, win);
	win.webContents.session.clearCache(function () {
		//clearCache
	});
	
})

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') app.quit(); //fricking darwin!! >:D
})