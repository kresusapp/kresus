// This module retrieves real values from the weboob backend, by using the given
// bankuuid / login / password (maybe customFields) combination.
import { spawn } from 'child_process';
import * as path from 'path';

import { makeLogger, KError } from '../../helpers';

let log = makeLogger('sources/weboob');

export const SOURCE_NAME = 'weboob';

// Possible commands include:
// - test: test whether weboob is accessible from the current kresus user.
// - version: get weboob's version number.
// - update: updates weboob modules.
// All the following commands require $bank $login $password $customFields:
// - accounts
// - operations
// To enable Weboob debug, one should pass an extra `--debug` argument.
function callWeboob(command, access, debug = false) {
    return new Promise((accept, reject) => {
        log.info(`Calling weboob: command ${command}...`);

        // Set up the environment.
        // We need to copy the whole `process.env` to ensure we don't break any
        // user setup, such as virtualenvs.
        let env = Object.assign({}, process.env);
        if (process.env.KRESUS_WEBOOB_DIR) {
            env.WEBOOB_DIR = process.env.KRESUS_WEBOOB_DIR;
            delete env.KRESUS_WEBOOB_DIR;
        }
        if (process.env.KRESUS_DIR) {
            // Just here to make `KRESUS_DIR` environment variable passing
            // explicit.
            env.KRESUS_DIR = process.env.KRESUS_DIR;
        }
        if (process.env.KRESUS_WEBOOB_SOURCES_LIST) {
            env.WEBOOB_SOURCES_LIST = process.env.KRESUS_WEBOOB_SOURCES_LIST;
            delete env.KRESUS_WEBOOB_SOURCES_LIST;
        }
        // Variables for PyExecJS, necessary for the Paypal module.
        env.EXECJS_RUNTIME = env.EXECJS_RUNTIME || 'Node';

        const pythonExec = process.env.KRESUS_PYTHON_EXEC || 'python2';
        let script = spawn(
            pythonExec,
            [path.join(path.dirname(__filename), '..', '..', 'weboob/main.py')],
            { env }
        );

        let weboobArgs = [command];
        if (debug) {
            weboobArgs.push('--debug');
        }
        if (command === 'accounts' || command === 'operations') {
            weboobArgs.push(
                access.bank, access.login, access.password
            );
            if (typeof access.customFields !== 'undefined') {
                // We have to escape quotes in the customFields JSON to prevent
                // them from being interpreted as shell quotes.
                weboobArgs.push(access.customFields.replace(/"/g, '\\"'));
            }
        }
        let stdin = weboobArgs.join(' ');
        script.stdin.write(`${stdin}\n`);
        script.stdin.end();

        let stdout = '';
        script.stdout.on('data', data => {
            stdout += data.toString();
        });

        let stderr = '';
        script.stderr.on('data', data => {
            stderr += data.toString();
        });

        script.on('close', code => {

            log.info(`exited with code ${code}.`);

            if (stderr.trim().length) {
                // Log anything that went to stderr
                log.info(`stderr: ${stderr}`);
            }

            // Parse JSON response
            try {
                stdout = JSON.parse(stdout);
            } catch (e) {
                // Invalid JSON response
                if (code !== 0) {
                    // If code is non-zero, treat as stderr
                    reject(new KError(`Process exited with non-zero error code ${code}. Unknown error. Stderr was ${stderr}.`));
                    return;
                }
                // Else, treat is as invalid JSON
                reject(new KError(`Invalid JSON response: ${e.stack}.`));
                return;
            }

            // If valid JSON output, check for an error within JSON
            if (typeof stdout.error_code !== 'undefined') {
                log.info('JSON error payload.');
                reject(new KError(
                    stdout.error_message, 500, stdout.error_code, stdout.error_short
                ));
                return;
            }

            log.info('OK: weboob exited normally with non-empty JSON content.');
            accept(stdout.values);
        });
    });
}

export async function testInstall() {
    try {
        log.info('Checking that weboob is installed and can actually be called…');
        await callWeboob('test');
        return true;
    } catch (err) {
        log.error(`When testing install: ${err}`);
        return false;
    }
}

export async function getVersion() {
    try {
        return await callWeboob('version');
    } catch (err) {
        log.error(`When getting Weboob version: ${err}`);
        return '?';
    }
}

// FIXME The import of Config is deferred because Config imports this file for
// testInstall.
let Config = null;

async function _fetchHelper(command, access) {
    Config = Config || require('../../models/config');

    try {
        let isDebugEnabled = await Config.findOrCreateDefaultBooleanValue('weboob-enable-debug');
        return await callWeboob(command, access, isDebugEnabled);
    } catch (err) {
        if (!await testInstall()) {
            throw new KError("Weboob doesn't seem to be installed, skipping fetch.");
        }
        log.info(`Got error while fetching ${command}: ${err.error_code}.`);
        throw err;
    }
}

export async function fetchAccounts(access) {
    return await _fetchHelper('accounts', access);
}

export async function fetchOperations(access) {
    return await _fetchHelper('operations', access);
}

// Can throw.
export async function updateWeboobModules() {
    await callWeboob('update');
}
