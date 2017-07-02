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
// All the four following commands require $bank $login $password $customFields:
// - accounts
// - transactions
// - debug-accounts
// - debug-transactions
function callWeboob(command, access) {
    return new Promise((accept, reject) => {
        log.info(`Calling weboob: command ${command}...`);

        let serverRoot = path.join(__filename, '..', '..', '..');

        // Set up the environment.
        let env = {};
        if (process.env.KRESUS_WEBOOB_DIR)
            env.WEBOOB_DIR = process.env.KRESUS_WEBOOB_DIR;
        if (process.env.KRESUS_DIR)
            env.KRESUS_DIR = process.env.KRESUS_DIR;

        // Variables for PyExecJS, necessary for the Paypal module.
        env.PATH = process.env.PATH;
        env.EXECJS_RUNTIME = process.env.EXECJS_RUNTIME || 'Node';

        let script = spawn('./weboob/main.py', [], {
            cwd: serverRoot,
            env
        });

        script.stdin.write(`${command}\n`);

        if (command.indexOf('accounts') !== -1 || command.indexOf('transactions') !== -1) {
            let { bank: bankuuid, login, password, customFields } = access;
            script.stdin.write(`${bankuuid}\n`);
            script.stdin.write(`${login}\n`);
            script.stdin.write(`${password}\n`);
            if (typeof customFields !== 'undefined')
                script.stdin.write(`${customFields}\n`);
        }

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

async function testInstallAndFetch(command, access) {
    Config = Config || require('../../models/config');

    let extendedCommand = command;
    if (await Config.findOrCreateDefaultBooleanValue('weboob-enable-debug'))
        extendedCommand = `debug-${command}`;

    if (await testInstall())
        return await callWeboob(extendedCommand, access);

    throw new KError("Weboob doesn't seem to be installed, skipping fetch.");
}

export async function fetchAccounts(access) {
    return await testInstallAndFetch('accounts', access);
}

export async function fetchTransactions(access) {
    return await testInstallAndFetch('transactions', access);
}

// Can throw.
export async function updateWeboobModules() {
    await callWeboob('update');
}
