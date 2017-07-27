/* eslint no-process-exit: 0 */
let path = require('path');
let fs = require('fs');

let packageFile = path.join(
    path.dirname(fs.realpathSync(__filename)),
    '..',
    'package.json'
);

fs.readFile(packageFile, (err, data) => {
    if (err) {
        throw err;
    }

    data = JSON.parse(data);
    data = Object.assign({}, data.dependencies, data.devDependencies);

    Object.keys(data).forEach(dep => {
        if (
            data[dep].includes('^') ||
            data[dep].includes('~') ||
            data[dep].includes('*')
        ) {
            throw `Invalid dependency specification for ${dep}: ${data[dep]}.`;
        }
    });
});
