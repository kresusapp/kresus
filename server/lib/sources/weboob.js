import { spawn } from 'child_process';
import * as path from 'path';

import {
    makeLogger,
    KError,
    checkWeboobMinimalVersion,
    UNKNOWN_WEBOOB_VERSION
} from '../../helpers';
import {
    WEBOOB_NOT_INSTALLED,
    INTERNAL_ERROR,
    INVALID_PARAMETERS,
    UNKNOWN_WEBOOB_MODULE,
    GENERIC_EXCEPTION,
    INVALID_PASSWORD,
    EXPIRED_PASSWORD,
    WAIT_FOR_2FA
} from '../../shared/errors.json';

let log = makeLogger('sources/weboob');

const ARGPARSE_MALFORMED_OPTIONS_CODE = 2;

export const SOURCE_NAME = 'weboob';

// A map to store session information attached to an access (cookies, last visited URL...).
// The access' id is the key to get the session information.
const SessionsMap = new Map();

// The list of errors which should trigger a reset of the session when raised.
const RESET_SESSION_ERRORS = [INVALID_PARAMETERS, INVALID_PASSWORD, EXPIRED_PASSWORD];

// Possible commands include:
// - test: test whether weboob is accessible from the current kresus user.
// - version: get weboob's version number.
// - update: updates weboob modules.
// All the following commands require $vendorId $login $password $fields:
// - accounts
// - operations
// To enable Weboob debug, one should pass an extra `--debug` argument.
function callWeboob(
    command,
    access,
    debug = false,
    forceUpdate = false,
    fromDate = null,
    isInteractive = false,
    resume2fa = false
) {
    return new Promise((accept, reject) => {
        log.info(`Calling weboob: command ${command}...`);

        // We need to copy the whole `process.env` to ensure we don't break any
        // user setup, such as virtualenvs, NODE_ENV, etc.

        let env = { ...process.env };
        if (process.kresus.weboobDir) {
            env.WEBOOB_DIR = process.kresus.weboobDir;
        }
        if (process.kresus.weboobSourcesList) {
            env.WEBOOB_SOURCES_LIST = process.kresus.weboobSourcesList;
        }
        env.KRESUS_DIR = process.kresus.dataDir;

        // Variable for PyExecJS, necessary for the Paypal module.
        env.EXECJS_RUNTIME = 'Node';

        let weboobArgs = [command];

        if (isInteractive) {
            weboobArgs.push('--interactive');
        }
        if (resume2fa) {
            weboobArgs.push('--resume');
        }

        if (debug) {
            weboobArgs.push('--debug');
        }

        if (forceUpdate) {
            weboobArgs.push('--update');
            log.info(`Weboob will be updated prior to command "${command}"`);
        }

        if (command === 'accounts' || command === 'operations') {
            weboobArgs.push('--module', access.vendorId, '--login', access.login);

            // Pass the password via an environment variable to hide it.
            env.KRESUS_WEBOOB_PWD = access.password;

            // Pass the session information as environment variable to hide it.
            if (SessionsMap.has(access.id)) {
                env.KRESUS_WEBOOB_SESSION = JSON.stringify(SessionsMap.get(access.id));
            }

            let { fields = [] } = access;
            for (let { name, value } of fields) {
                if (typeof name === 'undefined' || typeof value === 'undefined') {
                    throw new KError(
                        `Missing 'name' (${name}) or 'value' (${value}) for field`,
                        null,
                        INVALID_PARAMETERS
                    );
                }
                weboobArgs.push('--field', name, value);
            }

            if (command === 'operations' && fromDate instanceof Date) {
                weboobArgs.push('--fromDate', fromDate.getTime() / 1000);
            }
        }

        let script = spawn(
            process.kresus.pythonExec,
            [path.join(path.dirname(__filename), '..', '..', 'weboob/main.py')].concat(weboobArgs),
            { env }
        );

        let stdoutBuffer = Buffer.from('');
        script.stdout.on('data', data => {
            stdoutBuffer = Buffer.concat([stdoutBuffer, data]);
        });

        let stderrBuffer = Buffer.from('');
        script.stderr.on('data', data => {
            stderrBuffer = Buffer.concat([stderrBuffer, data]);
        });

        script.on('close', code => {
            log.info(`exited with code ${code}.`);

            let stderr = stderrBuffer.toString('utf8');
            let stdoutStr = stdoutBuffer.toString('utf8');

            if (stderr.trim().length) {
                // Log anything that went to stderr.
                log.warn(`stderr: ${stderr}`);
            }

            // Parse JSON response.
            // Any error (be it a crash of the Python script or a legit error
            // from Weboob) will result in a non-zero error code. Hence, we
            // should first try to parse stdout as JSON, to retrieve an
            // eventual legit error, and THEN check the return code.
            let stdout;
            try {
                stdout = JSON.parse(stdoutStr);
            } catch (e) {
                // We got an invalid JSON response, there is a real and
                // important error.
                if (code === ARGPARSE_MALFORMED_OPTIONS_CODE) {
                    return reject(new KError('Options are malformed', null, INTERNAL_ERROR));
                }
                if (code !== 0) {
                    // If code is non-zero, treat as stderr, that is a crash of
                    // the Python script.
                    return reject(
                        new KError(
                            `Process exited with non-zero error code ${code}. Unknown error. Stderr was ${stderr}`
                        )
                    );
                }
                // Else, treat it as invalid JSON
                // This should never happen, it would be a programming error.
                return reject(new KError(`Invalid JSON response: ${e.message}.`));
            }

            // If valid JSON output, check for an error within JSON
            if (typeof stdout.error_code !== 'undefined') {
                if (stdout.error_code === WAIT_FOR_2FA) {
                    log.info('Waiting for 2fa, restart command with resume.');

                    if (access && stdout.session) {
                        log.info(
                            `Saving session for access from bank ${access.vendorId} with login ${access.login}`
                        );
                        SessionsMap.set(access.id, stdout.session);
                    }

                    return callWeboob(
                        command,
                        access,
                        debug,
                        forceUpdate,
                        fromDate,
                        isInteractive,
                        /* resume2fa */ true
                    ).then(
                        results => {
                            accept(results);
                        },
                        error => {
                            reject(error);
                        }
                    );
                }

                log.info('Command returned an error code.');

                if (
                    access &&
                    stdout.error_code in RESET_SESSION_ERRORS &&
                    SessionsMap.has(access.id)
                ) {
                    log.warn(
                        `Resetting session for access from bank ${access.vendorId} with login ${access.login}`
                    );
                    SessionsMap.delete(access.id);
                }

                return reject(
                    new KError(
                        stdout.error_message ? stdout.error_message : stdout.error_code,
                        null,
                        stdout.error_code,
                        stdout.error_short
                    )
                );
            }

            log.info('OK: weboob exited normally with non-empty JSON content.');

            if (access && stdout.session) {
                log.info(
                    `Saving session for access from bank ${access.vendorId} with login ${access.login}`
                );
                SessionsMap.set(access.id, stdout.session);
            }
            accept(stdout.values);
        });
    });
}

let cachedWeboobVersion = UNKNOWN_WEBOOB_VERSION;

export async function testInstall() {
    try {
        log.info('Checking that weboob is installed and can actually be called…');
        await callWeboob('test');
        return true;
    } catch (err) {
        log.error(`When testing install: ${err}`);
        cachedWeboobVersion = UNKNOWN_WEBOOB_VERSION;
        return false;
    }
}

export async function getVersion(forceFetch = false) {
    if (
        cachedWeboobVersion === UNKNOWN_WEBOOB_VERSION ||
        !checkWeboobMinimalVersion(cachedWeboobVersion) ||
        forceFetch
    ) {
        try {
            cachedWeboobVersion = await callWeboob('version');
            if (cachedWeboobVersion === '?') {
                cachedWeboobVersion = UNKNOWN_WEBOOB_VERSION;
            }
        } catch (err) {
            log.error(`When getting Weboob version: ${err}`);
            cachedWeboobVersion = UNKNOWN_WEBOOB_VERSION;
        }
    }
    return cachedWeboobVersion;
}

async function _fetchHelper(
    command,
    access,
    isDebugEnabled,
    forceUpdate = false,
    fromDate = null,
    isInteractive = false
) {
    try {
        return await callWeboob(
            command,
            access,
            isDebugEnabled,
            forceUpdate,
            fromDate,
            isInteractive
        );
    } catch (err) {
        if (
            [
                WEBOOB_NOT_INSTALLED,
                INTERNAL_ERROR,
                GENERIC_EXCEPTION,
                UNKNOWN_WEBOOB_MODULE
            ].includes(err.errCode) &&
            !(await testInstall())
        ) {
            throw new KError(
                "Weboob doesn't seem to be installed, skipping fetch.",
                null,
                WEBOOB_NOT_INSTALLED
            );
        }

        log.error(`Got error while running command "${command}": ${err.message}`);
        if (typeof err.errCode !== 'undefined') {
            log.error(`\t(error code: ${err.errCode})`);
        }

        throw err;
    }
}

export async function fetchAccounts({ access, debug, update, isInteractive }) {
    return await _fetchHelper(
        'accounts',
        access,
        debug,
        update,
        /* fromDate */ null,
        isInteractive
    );
}
export async function fetchOperations({ access, debug, fromDate, isInteractive }) {
    return await _fetchHelper(
        'operations',
        access,
        debug,
        /* forceUpdate */ false,
        fromDate,
        isInteractive
    );
}

// Can throw.
export async function updateWeboobModules() {
    await callWeboob('test', /* access = */ {}, /* debug = */ false, /* forceUpdate = */ true);
}

export const testing = {
    callWeboob,
    SessionsMap
};
