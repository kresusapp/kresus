// This module retrieves real values from the weboob backend, by using the given
// bankuuid / login / password (maybe customFields) combination.
import { spawn } from 'child_process';
import * as path from 'path';

import { makeLogger, KError, checkWeboobMinimalVersion } from '../../helpers';
import {
    WEBOOB_NOT_INSTALLED,
    GENERIC_EXCEPTION,
    EXPIRED_PASSWORD,
    INVALID_PASSWORD,
    INTERNAL_ERROR
} from '../../shared/errors.json';

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

        // Set up the environment:
        // We need to copy the whole `process.env` to ensure we don't break any
        // user setup, such as virtualenvs.

        let env = Object.assign({}, process.env);
        if (process.kresus.weboobDir) {
            env.WEBOOB_DIR = process.kresus.weboobDir;
        }
        if (process.kresus.dataDir) {
            env.KRESUS_DIR = process.kresus.dataDir;
        }
        if (process.kresus.weboobSourcesList) {
            env.WEBOOB_SOURCES_LIST = process.kresus.weboobSourcesList;
        }

        // Variable for PyExecJS, necessary for the Paypal module.
        env.EXECJS_RUNTIME = 'Node';

        const pythonExec = process.kresus.pythonExec;
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
            weboobArgs.push(access.bank, access.login, access.password);
            if (typeof access.customFields !== 'undefined') {
                // We have to escape quotes in the customFields JSON to prevent
                // them from being interpreted as shell quotes.
                weboobArgs.push(`'${access.customFields}'`);
            }
        }

        let stdin = weboobArgs.join(' ');
        script.stdin.write(`${stdin}\n`);
        script.stdin.end();

        let stdout = new Buffer('');
        script.stdout.on('data', data => {
            stdout = Buffer.concat([stdout, data]);
        });

        let stderr = new Buffer('');
        script.stderr.on('data', data => {
            stderr = Buffer.concat([stderr, data]);
        });

        script.on('close', code => {
            log.info(`exited with code ${code}.`);

            stderr = stderr.toString('utf8');
            stdout = stdout.toString('utf8');

            if (stderr.trim().length) {
                // Log anything that went to stderr.
                log.warn(`stderr: ${stderr}`);
            }

            // Parse JSON response
            // Any error (be it a crash of the Python script or a legit error
            // from Weboob) will result in a non-zero error code. Hence, we
            // should first try to parse stdout as JSON, to retrieve an
            // eventual legit error, and THEN check the return code.
            try {
                stdout = JSON.parse(stdout);
            } catch (e) {
                // We got an invalid JSON response, there is a real and
                // important error.
                if (code !== 0) {
                    // If code is non-zero, treat as stderr, that is a crash of
                    // the Python script.
                    return reject(
                        new KError(
                            `Process exited with non-zero error code ${code}. Unknown error. Stderr was ${stderr}`,
                            500
                        )
                    );
                }
                // Else, treat it as invalid JSON
                // This should never happen, it would be a programming error.
                return reject(new KError(`Invalid JSON response: ${e.message}.`, 500));
            }

            // If valid JSON output, check for an error within JSON
            if (typeof stdout.error_code !== 'undefined') {
                log.info('JSON error payload.');

                let httpErrorCode;
                if (
                    stdout.error_code === WEBOOB_NOT_INSTALLED ||
                    stdout.error_code === GENERIC_EXCEPTION ||
                    stdout.error_code === INTERNAL_ERROR
                ) {
                    // 500 for errors related to the server internals / server config
                    httpErrorCode = 500;
                } else if (
                    stdout.error_code === EXPIRED_PASSWORD ||
                    stdout.error_code === INVALID_PASSWORD
                ) {
                    // 401 (Unauthorized) if there is an issue with the credentials
                    httpErrorCode = 401;
                } else {
                    // In general, return a 400 (Bad Request)
                    httpErrorCode = 400;
                }

                return reject(
                    new KError(
                        stdout.error_message,
                        httpErrorCode,
                        stdout.error_code,
                        stdout.error_short
                    )
                );
            }

            log.info('OK: weboob exited normally with non-empty JSON content.');
            accept(stdout.values);
        });
    });
}

let cachedWeboobVersion = 0;

export async function testInstall() {
    try {
        log.info('Checking that weboob is installed and can actually be called…');
        await callWeboob('test');
        return true;
    } catch (err) {
        log.error(`When testing install: ${err}`);
        cachedWeboobVersion = 0;
        return false;
    }
}

export async function getVersion(forceFetch = false) {
    if (
        cachedWeboobVersion === 0 ||
        !checkWeboobMinimalVersion(cachedWeboobVersion) ||
        forceFetch
    ) {
        try {
            cachedWeboobVersion = await callWeboob('version');
            if (cachedWeboobVersion === '?') {
                cachedWeboobVersion = 0;
            }
        } catch (err) {
            log.error(`When getting Weboob version: ${err}`);
            cachedWeboobVersion = 0;
        }
    }
    return cachedWeboobVersion;
}

async function _fetchHelper(command, access, isDebugEnabled) {
    try {
        return await callWeboob(command, access, isDebugEnabled);
    } catch (err) {
        if (!await testInstall()) {
            throw new KError(
                "Weboob doesn't seem to be installed, skipping fetch.",
                500,
                WEBOOB_NOT_INSTALLED
            );
        }

        log.error(`Got error while fetching ${command}: ${err.message}`);
        if (typeof err.error_code !== 'undefined') {
            log.error(`\t(error code: ${err.error_code})`);
        }

        throw err;
    }
}

export async function fetchAccounts({ access, debug }) {
    return await _fetchHelper('accounts', access, debug);
}

export async function fetchOperations({ access, debug }) {
    return await _fetchHelper('operations', access, debug);
}

// Can throw.
export async function updateWeboobModules() {
    await callWeboob('update');
}
