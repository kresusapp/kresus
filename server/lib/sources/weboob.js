// This module retrieves real values from the weboob backend, by using the given
// bankuuid / login / password (maybe website) combination.
let log = require('printit')({
    prefix: 'sources/weboob',
    date: true
});

import {spawn} from 'child_process';

import Config from '../../models/kresusconfig';

export let SOURCE_NAME = 'weboob';

let Fetch = (process, bankuuid, login, password, website, callback) => {

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

        if (!body.length)
            return callback(`no bodyerror: ${err}`);

        try {
            body = JSON.parse(body);
        } catch (err) {
            return callback(`Error when parsing weboob json: ${body}`);
        }

        if (typeof body.error_code !== 'undefined') {
            let error = {
                code: body.error_code
            };
            error.content = body.error_content || undefined;
            return callback(error);
        }

        log.info("OK: weboob exited normally with non-empty JSON content, continuing.");
        callback(null, body);
    });
}

export function FetchAccounts(bankuuid, login, password, website, callback) {
    Fetch('./weboob/scripts/accounts.sh', bankuuid, login, password, website, callback);
}

export function FetchOperations(bankuuid, login, password, website, callback) {
    Fetch('./weboob/scripts/operations.sh', bankuuid, login, password, website, callback);
}


let TestInstall = cb => {
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
        cb(code === 0);
    });
}


let {SaveLog, Log} = (function() {
    let isCallingSaveLog = false;

    let logCount = 0;
    let logContent = '';

    let SaveLog = (cb) => {

        if (isCallingSaveLog)
            return cb();

        isCallingSaveLog = true;

        Config.findOrCreateByName("weboob-log", "", (err, pair) => {
            if (err) {
                isCallingSaveLog = false;
                return cb(err);
            }
            pair.value = logContent;
            pair.save(cb);
            isCallingSaveLog = false;
        });
    }

    let Log = (wat) => {

        wat = wat.trim();
        log.info(wat);

        logContent += wat + '\n';
        logCount++;

        if (logCount == 10) {
            SaveLog(err => {
                if (err) {
                    log.info(`error when saving temporary log: ${err}`);
                    return;
                }
                logCount = 0;
            });
        }
    }

    return {SaveLog, Log};
})();


export function InstallOrUpdateWeboob(forceUpdate, cb) {

    Config.findOrCreateByName("weboob-installed", "false", (err, pair) => {

        if (err)
            return cb(err);

        function markAsNotInstalled() {
            Log('Ensuring weboob install status to false...');
            pair.value = 'false';
            pair.save(err => {
                if (err) {
                    log.error(`When updating weboob install status: ${err}`);
                    return;
                }
                log.info("weboob marked as non-installed");
            });
        }

        let isInstalled = pair.value === 'true';
        Log('Is it installed?', isInstalled);

        if (isInstalled && !forceUpdate) {
            Log('=> Yes it is. Testing...');

            TestInstall(works => {
                if (!works) {
                    Log('Testing failed, relaunching install process...');
                    return cb('already installed but testing failed');
                }

                Log('Already installed and it works, carry on.');
                // Don't save log in this case.
                return cb(null);
            });

            return;
        }

        // Prevent data corruption
        if (pair.value !== 'false')
            markAsNotInstalled();

        Log("=> No it isn't. Installing weboob...");
        let script = spawn('./weboob/scripts/install.sh', []);

        script.stdout.on('data', data => {
            if (data)
                Log(`install.sh stdout -- ${data.toString()}`);
        });

        script.stderr.on('data', data => {
            if (data)
                Log(`install.sh stderr -- ${data.toString()}`);
        });

        script.on('close', code => {

            Log(`install.sh closed with code: ${code}`);
            if (code !== 0)
                return cb(`return code of install.sh is ${code}, not 0.`);

            pair.value = 'true';
            pair.save(err => {
                if (err)
                    return cb(err);
                SaveLog(cb);
            });
        });
    });
};

export function UpdateWeboobModules(cb) {
    let script = spawn('./weboob/scripts/update-modules.sh', []);

    script.stdout.on('data', data => {
        if (data)
            Log(`update-modules.sh stdout -- ${data.toString()}`);
    });

    script.stdout.on('data', data => {
        if (data)
            Log(`update-modules.sh stderr -- ${data.toString()}`);
    });

    script.on('close', code => {
        Log(`update-modules.sh closed with code: ${code}`);

        if (code !== 0)
            return cb(`return code of update-modules.sh is ${code}, not 0.`);

        Log("update-modules.sh Update done!");
        SaveLog(cb);
    });
};

//Each installation of kresus should trigger an installation or update of
// weboob.
(function() {
    let attempts = 1;

    function tryInstall(force) {
        InstallOrUpdateWeboob(force, err => {

            if (err) {
                log.error(`error when installing/updating, attempt #${attempts}: ${err}`);
                attempts += 1;

                if (attempts <= 3) {
                    log.info("retrying...");
                    tryInstall(true);
                } else {
                    log.info("[en] error when installing weboob: please contact a kresus maintainer on github or irc and keep the error message handy.");
                    log.info("[fr] erreur lors de l'installation de weboob: merci de contacter un mainteneur de kresus sur github ou irc en gardant le message à portée de main.");
                }

                return;
            }

            log.info('installation/update all fine. Weboob can now be used!');
        });
    }

    tryInstall(false);
})();
