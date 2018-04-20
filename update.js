var fs                 = require('fs');
var path               = require('path');
var request            = require('request-promise');
var currentDevicesList = require('./index.json');


var JSON_URL    = 'https://chromium.googlesource.com/chromium/src/third_party/+/master/blink/renderer/devtools/front_end/emulation/module.json?format=TEXT'
var FILE_PATH   = path.join(__dirname, 'index.json');
var TITLES_PATH = path.join(__dirname, 'devices.md');

function mergeLists (oldList, newList) {
    var removedItems = [];

    oldList.forEach(oldItem => {
        if (newList.every(newItem => newItem.title.toLowerCase() !== oldItem.title.toLowerCase()))
            removedItems.push(oldItem);
    });

    return removedItems.concat(newList);
}

request({ url: JSON_URL })
    .then(function (body) {
        var buf     = new Buffer(body, 'base64');
        var content = JSON.parse(buf);

        var newDevicesList = content.extensions.map(function (item) {
            return item.device;
        });
        
	newDevicesList = mergeLists(currentDevicesList, newDevicesList);

        fs.writeFileSync(FILE_PATH, JSON.stringify(newDevicesList, null, 2));
        
        var titles = newDevicesList.map(x => '  * ' + x.title).join('\n\n');
        
        fs.writeFileSync(TITLES_PATH, '## Titles of Emulated Devices\n\n' + titles);
    });
