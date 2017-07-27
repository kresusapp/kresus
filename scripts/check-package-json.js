/* eslint no-process-exit: 0 */
import path from 'path';

import { makeLogger } from '../server/helpers';

import packageFile from '../package.json';

const logger = makeLogger('check-package-json');

let returnCode = 0;
const data = Object.assign({}, packageFile.dependencies, packageFile.devDependencies);
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
if (returnCode === 0) {
    logger.info('Package.json is OK!');
}
process.exit(returnCode);
