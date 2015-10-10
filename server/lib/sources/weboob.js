// This module retrieves real values from the weboob backend, by using the given
// bankuuid / login / password (maybe website) combination.
let log = require('printit')({
    prefix: 'sources/weboob',
    date: true
});

import {spawn} from 'child_process';

import Config from '../../models/kresusconfig';
import {promisify} from '../../helpers';

export let SOURCE_NAME = 'weboob';

let Fetch = (process, bankuuid, login, password, website) => {

    return new Promise((accept, reject) => {

        log.info(`Fetch started: running process ${process}...`);
        let script = spawn(process, []);

        script.stdin.write(bankuuid + '\n');
        script.stdin.write(login + '\n');
        script.stdin.write(password + '\n');

        if (typeof website !== 'undefined')
            script.stdin.write(website + '\n');

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

export function FetchAccounts(bankuuid, login, password, website, callback) {
    return Fetch('./weboob/scripts/accounts.sh', bankuuid, login, password, website, callback);
}

export function FetchOperations(bankuuid, login, password, website, callback) {
    return Fetch('./weboob/scripts/operations.sh', bankuuid, login, password, website, callback);
}


let TestInstall = () => {
    return new Promise((accept, reject) => {
        let script = spawn('./weboob/scripts/test.sh');

        script.stdout.on('data', data => {
            if (data)
                log.info(`checking install - ${data.toString()}`);
        });

        script.stderr.on('data', data => {
            if (data)
                log.info(`checking install - ${data.toString()}`);
        });

        script.on('close', code => {
            // If code is 0, it worked!
            accept(code === 0);
        });
    });
}


let {SaveLog, Log} = (function() {
    let isCallingSaveLog = false;

    let logCount = 0;
    let logContent = '';

    let SaveLog = async function() {
        if (isCallingSaveLog)
            return;

        isCallingSaveLog = true;
        try {
            let pair = await Config.findOrCreateByName("weboob-log", "");
            pair.value = logContent;
            await pair.save();
        } catch(err) {
            log.error(`Error in SaveLog: ${err}`);
        } finally {
            isCallingSaveLog = false;
        }
    }

    let Log = async function(wat) {
        wat = wat.trim();
        log.info(wat);

        logContent += wat + '\n';
        logCount++;

        if (logCount < 10) {
            return;
        }

        await SaveLog();
        logCount = 0;
    }

    return {SaveLog, Log};
})();


export async function InstallOrUpdateWeboob(forceUpdate) {
    let pair = await Config.findOrCreateByName("weboob-installed", "false");

    let isInstalled = pair && pair.value === 'true';
    await Log(`Is it installed? ${isInstalled}`);

    if (isInstalled && !forceUpdate) {
        await Log('=> Yes it is. Testing...');

        let works = await TestInstall();
        if (works) {
            await Log('Already installed and it works, carry on.');
            return true;
        }

        await Log('Testing failed, relaunching install process...');
    }

    // Prevent data corruption
    if (pair.value !== 'false') {
        await Log('Ensuring weboob install status to false...');
        pair.value = 'false';
        await pair.save();
        log.info("weboob marked as non-installed");
    }

    await Log("=> No it isn't. Installing weboob...");
    let script = spawn('./weboob/scripts/install.sh', []);

    script.stdout.on('data', data => {
        if (data)
            Log(`install.sh stdout -- ${data.toString()}`);
    });

    script.stderr.on('data', data => {
        if (data)
            Log(`install.sh stderr -- ${data.toString()}`);
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
    await Log(`install.sh returned with code ${code}`);

    pair.value = 'true';
    await pair.save();

    await SaveLog();

    await Log(`weboob installation done`);
    return true;
};

export async function UpdateWeboobModules() {
    let script = spawn('./weboob/scripts/update-modules.sh', []);

    script.stdout.on('data', data => {
        if (data)
            Log(`update-modules.sh stdout -- ${data.toString()}`);
    });

    script.stdout.on('data', data => {
        if (data)
            Log(`update-modules.sh stderr -- ${data.toString()}`);
    });

    let onclose = function() {
        return new Promise((accept, reject) => {
            script.on('close', accept);
        })
    }

    let code = await onclose();
    await Log(`update-modules.sh closed with code: ${code}`);

    if (code !== 0) {
        throw `return code of update-modules.sh is ${code}, not 0.`;
    }

    await Log("update-modules.sh Update done!");
    await SaveLog();
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
