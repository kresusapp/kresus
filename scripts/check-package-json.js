/* eslint no-process-exit: 0 */
import path from 'path';
import semver from 'semver';

import { makeLogger } from '../server/helpers';

import packageFile from '../package.json';

const logger = makeLogger('check-package-json');

process.exitCode = 0;

const dependencies = Object.assign({}, packageFile.dependencies, packageFile.devDependencies);
for (let [dependency, version] of Object.entries(dependencies)) {
    if (semver.valid(version) === null) {
        logger.error(`Dependency version specification must be exact for ${dependency}: ${version}.`);
        process.exitCode = 1;
    }
}

if (process.exitCode === 0) {
    logger.info('Dependencies version numbers are exact.');
}
