// This module retrieves real values from the weboob backend, by using the given
// bankuuid / login / password (maybe customFields) combination.
import { spawn } from 'child_process';

import { makeLogger } from '../../helpers';

let log = makeLogger('sources/weboob');

export let SOURCE_NAME = 'weboob';

const ErrorString = `

!!! !!! !!! !!! !!! !!! !!! !!! !!! !!! !!! !!! !!! !!! !!! !!! !!! !!! !!! !!!
[en] error when installing weboob: please contact a kresus maintainer on github
or irc and keep the error message handy.
[fr] installation de weboob: merci de contacter un mainteneur de kresus sur
github ou irc en gardant le message à portée de main.
!!! !!! !!! !!! !!! !!! !!! !!! !!! !!! !!! !!! !!! !!! !!! !!! !!! !!! !!! !!!

`;

let fetch = (process, access) => {
    let { bank: bankuuid, login, password, customFields } = access;

    return new Promise((accept, reject) => {

        log.info(`Fetch started: running process ${process}...`);
        let script = spawn(process, []);

        script.stdin.write(`${bankuuid}\n`);
        script.stdin.write(`${login}\n`);
        script.stdin.write(`${password}\n`);

        if (typeof customFields !== 'undefined')
            script.stdin.write(`${customFields}\n`);

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

            log.info(`weboob exited with code ${code}`);

            if (err)
                log.info(`stderr: ${err}`);

            if (!body.length) {
                reject(`no bodyerror: ${err}`);
                return;
            }

            try {
                body = JSON.parse(body);
            } catch (e) {
                reject(`Error when parsing weboob json:
- stdout: ${body}
- stderr: ${e}`);
                return;
            }

            if (typeof body.error_code !== 'undefined') {
                let error = {
                    code: body.error_code
                };
                error.message = body.error_content;
                log.warn(`Weboob error, stderr: ${err}`);
                reject(error);
                return;
            }

            log.info('OK: weboob exited normally with non-empty JSON content.');
            accept(body);
        });
    });
};

export let testInstall = () =>
    new Promise(accept => {
        let script = spawn('./weboob/scripts/test.sh');

        let stdout = '', stderr = '';
        script.stdout.on('data', data => {
            if (data)
                stdout += `${data.toString()}\n`;
        });

        script.stderr.on('data', data => {
            if (data)
                stderr += `${data.toString()}\n`;
        });

        script.on('close', code => {
            if (code !== 0) {
                log.warn(`
- test install stdout: ${stdout}
- test install stderr: ${stderr}`);
            }

            // If code is 0, it worked!
            accept(code === 0);
        });
    });

async function testInstallAndFetch(process, access) {
    if (await testInstall())
        return fetch(process, access);
    throw "Weboob doesn't seem to be installed, skipping fetch.";
}

export function fetchAccounts(access) {
    return testInstallAndFetch('./weboob/scripts/accounts.sh', access);
}

export function fetchOperations(access) {
    return testInstallAndFetch('./weboob/scripts/operations.sh', access);
}

export async function installOrUpdateWeboob(forceUpdate) {

    let isInstalled = await testInstall();
    log.info(`Is it installed? ${isInstalled}`);
    if (isInstalled && !forceUpdate) {
        log.info('Already installed and it works, carry on.');
        return true;
    }

    log.info("=> No it isn't. Installing weboob...");
    let script = spawn('./weboob/scripts/install.sh', []);

    script.stdout.on('data', data => {
        if (data)
            log.info(`install.sh stdout -- ${data.toString()}`);
    });

    script.stderr.on('data', data => {
        if (data)
            log.info(`install.sh stderr -- ${data.toString()}`);
    });

    let onclose = function() {
        return new Promise(accept => {
            script.on('close', accept);
        });
    };

    let code = await onclose();
    if (code !== 0) {
        throw `return code of install.sh is ${code}, not 0.`;
    }
    log.info(`install.sh returned with code ${code}`);

    log.info(`weboob installation done`);
    return true;
}

export async function updateWeboobModules() {
    let script = spawn('./weboob/scripts/update-modules.sh', []);

    script.stdout.on('data', data => {
        if (data)
            log.info(`update-modules.sh stdout -- ${data.toString()}`);
    });

    script.stderr.on('data', data => {
        if (data)
            log.info(`update-modules.sh stderr -- ${data.toString()}`);
    });

    let onclose = function() {
        return new Promise(accept => {
            script.on('close', accept);
        });
    };

    let code = await onclose();
    log.info(`update-modules.sh closed with code: ${code}`);

    if (code !== 0) {
        throw `return code of update-modules.sh is ${code}, not 0.`;
    }

    log.info('update-modules.sh Update done!');
}

// Each installation of kresus should trigger an installation or update of
// weboob.
export async function init() {

    for (let i = 0; i < 3; i++) {
        let forceInstall = i !== 0;
        try {
            let success = await installOrUpdateWeboob(forceInstall);
            if (success) {
                log.info('installation/update succeeded. Weboob can be used!');
                return;
            }
        } catch (err) {
            log.error(`error on install/update, attempt #${i}: ${err}`);
            if (i < 3) {
                log.info('retrying...');
            } else {
                throw ErrorString;
            }
        }
    }

}
