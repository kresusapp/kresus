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
        let env = Object.assign({}, process.env);
        if (env.KRESUS_WEBOOB_DIR) {
            env.WEBOOB_DIR = process.env.KRESUS_WEBOOB_DIR;
            delete env.KRESUS_WEBOOB_DIR;
        }

        // Variables for PyExecJS, necessary for the Paypal module.
        env.EXECJS_RUNTIME = process.env.EXECJS_RUNTIME || 'Node';

        if (!env.KRESUS_PYTHON_EXEC) {
            // Default Python executable to use is Python 2
            env.KRESUS_PYTHON_EXEC = 'python2';
        }

        let script = spawn(
            env.KRESUS_PYTHON_EXEC,
            [path.join(path.dirname(__filename), '..', '..', 'weboob/main.py')],
            { env }
        );

        let weboobArgs = [command];
        if (debug) {
            weboobArgs.push('--debug');
        }
        if (command === 'accounts' || command === 'operations') {
            weboobArgs = weboobArgs.concat([
                access.bank, access.login, access.password
            ]);
            if (typeof customFields !== 'undefined') {
                weboobArgs.push(access.customFields);
            }
        }
        let stdin = weboobArgs.join(' ');
        script.stdin.write(`${stdin}\n`);
        script.stdin.end();

        let stdout = '';
        script.stdout.on('data', data => {
            stdout += data.toString();
        });

        let stderr;
        script.stderr.on('data', data => {
            stderr = stderr || '';
            stderr += data.toString();
        });

        script.on('close', code => {

            log.info(`exited with code ${code}`);

            if (stderr && stderr.trim().length) {
                log.info(`stderr: ${stderr}`);
            }

            if (code !== 0) {
                log.info('Command left with non-zero code.');
                reject(new KError(`Weboob failure: ${stderr}`));
                return;
            }

            if (command === 'test' || command === 'update') {
                accept();
                return;
            }

            let parseJsonError = null;
            try {
                stdout = JSON.parse(stdout);
            } catch (e) {
                parseJsonError = e.stack;
            }

            if (parseJsonError || typeof stdout.error_code !== 'undefined') {
                let message = `Error when calling into Weboob:
- stdout: ${typeof stdout === 'string' ? stdout : JSON.stringify(stdout)}
- stderr: ${stderr}
- JSON error: ${parseJsonError},
- error_code: ${stdout.error_code}`;

                let shortMessage;
                if (typeof stdout.error_short === 'string')
                    shortMessage = `Error when calling into Weboob: ${stdout.error_short}`;

                let error = new KError(message, 500, stdout.error_code, shortMessage);
                reject(error);
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
