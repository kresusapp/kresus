/* eslint no-process-exit: 0 */
const path = require('path');
const fs = require('fs');

const helpers = require(path.join(
    path.dirname(fs.realpathSync(__filename)),
    '..',
    'server',
    'helpers'
))

const logger = helpers.makeLogger('check-package-json');

const packageFile = path.join(
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

    let returnCode = 0;
    Object.keys(data).forEach(dep => {
        if (
            data[dep].includes('^') ||
            data[dep].includes('~') ||
            data[dep].includes('*')
        ) {
            logger.error(`Dependency version specification must be exact for ${dep}: ${data[dep]}.`);
            returnCode = 1;
        }
    });
    if (returnCode == 0) {
        logger.info('Package.json is OK!');
    }
    process.exit(returnCode);
});
