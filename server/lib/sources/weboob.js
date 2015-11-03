// This module retrieves real values from the weboob backend, by using the given
// bankuuid / login / password (maybe customFields) combination.
let log = require('printit')({
    prefix: 'sources/weboob',
    date: true
});

import {spawn} from 'child_process';

import {promisify} from '../../helpers';

export let SOURCE_NAME = 'weboob';

let Fetch = (process, bankuuid, login, password, customFields) => {

    return new Promise((accept, reject) => {

        log.info(`Fetch started: running process ${process}...`);
        let script = spawn(process, []);

        script.stdin.write(bankuuid + '\n');
        script.stdin.write(login + '\n');
        script.stdin.write(password + '\n');

        if (typeof customFields !== 'undefined')
            script.stdin.write(customFields + '\n');

        script.stdin.end();

        let body = '';
        script.stdout.on('data', (data) => {
            body += data.toString();
        });

        let err;
        script.stderr.on('data', (data) => {
            err = err || '';
            err += data.toString();
        });

        script.on('close', (code) => {

            log.info(`weboob exited with code ${code}`);

            if (err)
                log.info(`stderr: ${err}`);

            if (!body.length) {
                reject(`no bodyerror: ${err}`);
                return;
            }

            try {
                body = JSON.parse(body);
            } catch (err) {
                reject(`Error when parsing weboob json: ${body}`);
                return;
            }

            if (typeof body.error_code !== 'undefined') {
                let error = {
                    code: body.error_code
                };
                error.content = body.error_content || undefined;
                reject(error);
                return;
            }

            log.info("OK: weboob exited normally with non-empty JSON content, continuing.");
            accept(body);
        });
    });
}

async function TestInstallAndFetch(...args) {
    if (await TestInstall())
        return Fetch(...args);
    throw "Weboob doesn't seem to be installed, skipping fetch.";
}

export function FetchAccounts(bankuuid, login, password, customFields, callback) {
    return TestInstallAndFetch('./weboob/scripts/accounts.sh', bankuuid, login, password, customFields, callback);
}

export function FetchOperations(bankuuid, login, password, customFields, callback) {
    return TestInstallAndFetch('./weboob/scripts/operations.sh', bankuuid, login, password, customFields, callback);
}


export let TestInstall = () => {
    return new Promise((accept, reject) => {
        let script = spawn('./weboob/scripts/test.sh');

        let stdout = '', stderr = '';
        script.stdout.on('data', data => {
            if (data)
                stdout += data.toString() + '\n';
        });

        script.stderr.on('data', data => {
            if (data)
                stderr += data.toString() + '\n';
        });

        script.on('close', code => {
            if (code !== 0) {
                log.warn(`test install stdout: ${stdout}\ntest install stderr: ${stderr}`);
            }

            // If code is 0, it worked!
            accept(code === 0);
        });
    });
}

export async function InstallOrUpdateWeboob(forceUpdate) {

    let isInstalled = await TestInstall();
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
        return new Promise((accept, reject) => {
            script.on('close', accept);
        })
    }

    let code = await onclose();
    if (code !== 0) {
        throw `return code of install.sh is ${code}, not 0.`;
    }
    log.info(`install.sh returned with code ${code}`);

    log.info(`weboob installation done`);
    return true;
};

export async function UpdateWeboobModules() {
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
        return new Promise((accept, reject) => {
            script.on('close', accept);
        })
    }

    let code = await onclose();
    log.info(`update-modules.sh closed with code: ${code}`);

    if (code !== 0) {
        throw `return code of update-modules.sh is ${code}, not 0.`;
    }

    log.info("update-modules.sh Update done!");
};

var ErrorString = `

!!! !!! !!! !!! !!! !!! !!! !!! !!! !!! !!! !!! !!! !!! !!! !!! !!! !!! !!! !!!
[en] error when installing weboob: please contact a kresus maintainer on github
or irc and keep the error message handy.
[fr] installation de weboob: merci de contacter un mainteneur de kresus sur
github ou irc en gardant le message à portée de main.
!!! !!! !!! !!! !!! !!! !!! !!! !!! !!! !!! !!! !!! !!! !!! !!! !!! !!! !!! !!!

`;

// Each installation of kresus should trigger an installation or update of
// weboob.
export async function Init() {

    let attempts = 0;
    for (let attempts = 0; attempts < 3; attempts++) {
        let forceInstall = attempts !== 0;
        try {
            let success = await InstallOrUpdateWeboob(forceInstall);
            if (success) {
                log.info('installation/update all fine. Weboob can now be used!');
                return;
            }
        } catch(err) {
            log.error(`error when installing/updating, attempt #${attempts}: ${err}`);
            if (attempts < 3) {
                log.info('retrying...');
            } else {
                throw ErrorString;
            }
        }
    }

};
