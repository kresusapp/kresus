/* eslint no-process-exit: 0 */

import semver from 'semver';

import { makeLogger } from '../../server/helpers';

import packageFile from '../../package.json';

const logger = makeLogger('check-package-json');

const dependencies = Object.assign({},
                                   packageFile.dependencies,
                                   packageFile.devDependencies);

var invalidDependency = false;
for (let [dependency, version] of Object.entries(dependencies)) {
    if (semver.valid(version) === null) {
        logger.error(`Dependency version specification must be exact for ${dependency}: ${version}.`);
        invalidDependency = true;
    }
}

if (invalidDependency) {
    process.exit(1);
}

logger.info('Dependencies version numbers are exact.');
process.exit(0);
