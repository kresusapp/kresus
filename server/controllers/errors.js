import path from 'path-extra';
import fs   from 'fs';

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
