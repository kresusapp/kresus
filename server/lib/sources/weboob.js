// This module retrieves real values from the weboob backend, by using the given
// bankuuid / login / password (maybe customFields) combination.
import { spawn } from 'child_process';
import * as path from 'path';

import { makeLogger, KError } from '../../helpers';

let log = makeLogger('sources/weboob');

export let SOURCE_NAME = 'weboob';

function callWeboob(command, access) {
    return new Promise((accept, reject) => {
        log.info(`Calling weboob: command ${command}...`);

        let serverRoot = path.join(__filename, '..', '..', '..');
        let script = spawn(`./weboob/main.py`, [], { cwd: serverRoot });

        script.stdin.write(`${command}\n`);

        if (command === 'accounts' || command === 'transactions') {
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
                log.warn(`Weboob error, stderr: ${stderr}`);
                let error = new KError(`Error when parsing weboob json:
- stdout: ${stdout}
- stderr: ${stderr}
- JSON error: ${parseJsonError},
- error_code: ${stdout.error_code}`, 500, stdout.error_code);
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
        await callWeboob('test');
        return true;
    } catch (err) {
        log.error(`When testing install: ${err}`);
        return false;
    }
}

async function testInstallAndFetch(command, access) {
    if (await testInstall())
        return await callWeboob(command, access);
    throw new KError("Weboob doesn't seem to be installed, skipping fetch.");
}

export async function fetchAccounts(access) {
    return await testInstallAndFetch('accounts', access);
}

export async function fetchTransactions(access) {
    return await testInstallAndFetch('transactions', access);
}

export async function updateWeboobModules() {
    try {
        await callWeboob('update');
        return true;
    } catch (err) {
        return false;
    }
}
