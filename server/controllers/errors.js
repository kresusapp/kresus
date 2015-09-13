let path = require('path-extra');
let fs   = require('fs');

// build/server/controllers/../../../weboob/errors/
let fullPathCurrentFile = fs.realpathSync(__filename);
let currentDir = path.dirname(fullPathCurrentFile);
let filePath = path.join(currentDir, '..', '..', '..', 'weboob', 'errors.json');

let errors = JSON.parse(fs.readFileSync(filePath));

export default function(name) {
    if (typeof errors[name] !== 'undefined')
        return errors[name];
    throw 'Unknown error code!';
}
