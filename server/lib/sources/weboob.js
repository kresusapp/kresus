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

        let body = '';
        script.stdout.on('data', data => {
            body += data.toString();
        });

        let err;
        script.stderr.on('data', data => {
            err = err || '';
            err += data.toString();
        });

        script.on('close', code => {

            log.info(`exited with code ${code}`);

            if (err && err.trim().length) {
                log.info(`stderr: ${err}`);
            }

            if (code !== 0) {
                log.info('Command left with non-zero code.');
                reject(new KError(`Weboob failure: ${err}`));
                return;
            }

            if (command === 'test' || command === 'update') {
                accept();
                return;
            }

            try {
                body = JSON.parse(body);
            } catch (e) {
                reject(new KError(`Error when parsing weboob json:
- stdout: ${body}
- stderr: ${err}
- JSON error: ${e}`));
                return;
            }

            if (typeof body.error_code !== 'undefined') {
                log.warn(`Weboob error, stderr: ${err}`);
                let error = new KError(`Weboob error: ${error.content}`,
                                       500, body.error_code);
                reject(error);
                return;
            }

            log.info('OK: weboob exited normally with non-empty JSON content.');
            accept(body.values);
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
