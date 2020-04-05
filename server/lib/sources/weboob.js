import { spawn } from 'child_process';
import * as path from 'path';

import { Access } from '../../models/';

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

// A map to store session information attached to an access (cookies, last visited URL...).
// The access' id is the key to get the session information.
const SessionsMap = new Map();

async function saveSession(access /* Access */, session /* object */) {
    if (!access.id) {
        // Probably just testing. Ignore.
        return;
    }

    // Save it as is in the in-memory cache.
    SessionsMap.set(access.id, session);

    // Serialize it in the database.
    let serializedSession = JSON.stringify(session);
    await Access.update(access.userId, access.id, {
        session: serializedSession
    });
}

async function resetSession(access /* Access */) {
    if (!access.id) {
        // Probably just testing. Ignore.
        return;
    }

    SessionsMap.delete(access.id);
    await Access.update(access.userId, access.id, { session: null });
}

async function readSession(access /* Access */) /* : object | undefined */ {
    if (!access.id) {
        // Probably just testing. Ignore.
        return;
    }

    // If it's not in the cache, try to read it from the database first, and
    // save it into the in-memory cache.
    if (!SessionsMap.has(access.id)) {
        let serialized = access.session;
        if (serialized !== null) {
            try {
                let asObject = JSON.parse(serialized);
                SessionsMap.set(access.id, asObject);
                return asObject;
            } catch (err) {
                // Do nothing.
            }
        }
    }

    // It was in the cache!
    return SessionsMap.get(access.id);
}

// Runs the subcommad `command`, with the given array of args, setting the
// environment to the given value.
function subcommand(command, args, env) {
    return new Promise(accept => {
        let script = spawn(command, args, { env });

        let stdoutBuffer = Buffer.from('');
        script.stdout.on('data', data => {
            stdoutBuffer = Buffer.concat([stdoutBuffer, data]);
        });

        let stderrBuffer = Buffer.from('');
        script.stderr.on('data', data => {
            stderrBuffer = Buffer.concat([stderrBuffer, data]);
        });

        script.on('close', code => {
            let stderr = stderrBuffer.toString('utf8').trim();
            let stdout = stdoutBuffer.toString('utf8').trim();
            accept({
                code,
                stderr,
                stdout
            });
        });
    });
}

const ARGPARSE_MALFORMED_OPTIONS_CODE = 2;

export const SOURCE_NAME = 'weboob';

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
async function callWeboob(
    command,
    access,
    debug = false,
    forceUpdate = false,
    fromDate = null,
    isInteractive = false,
    resume2fa = false
) {
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
        let session = await readSession(access);
        if (session) {
            env.KRESUS_WEBOOB_SESSION = JSON.stringify(session);
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

    let { code, stderr, stdout } = await subcommand(
        process.kresus.pythonExec,
        [path.join(path.dirname(__filename), '..', '..', 'weboob/main.py')].concat(weboobArgs),
        env
    );

    log.info(`exited with code ${code}.`);

    if (stderr.length) {
        // Log anything that went to stderr.
        log.warn(`stderr: ${stderr}`);
    }

    // Parse JSON response. Any error (be it a crash of the Python script or a
    // legit error from Weboob) will result in a non-zero error code. Hence, we
    // should first try to parse stdout as JSON, to retrieve an eventual legit
    // error, and THEN check the return code.
    try {
        stdout = JSON.parse(stdout);
    } catch (e) {
        // We got an invalid JSON response, there is a real and important error.
        if (code === ARGPARSE_MALFORMED_OPTIONS_CODE) {
            throw new KError('Options are malformed', null, INTERNAL_ERROR);
        }

        if (code !== 0) {
            // If code is non-zero, treat as stderr, that is a crash of the Python script.
            throw new KError(
                `Process exited with non-zero error code ${code}. Unknown error. Stderr was ${stderr}`
            );
        }

        // Else, treat it as invalid JSON. This should never happen, it would
        // be a programming error.
        throw new KError(`Invalid JSON response: ${e.message}.`);
    }

    // If valid JSON output, check for an error within JSON.
    if (typeof stdout.error_code !== 'undefined') {
        if (stdout.error_code === WAIT_FOR_2FA) {
            log.info('Waiting for 2fa, restart command with resume.');

            if (access && stdout.session) {
                log.info(
                    `Saving session for access from bank ${access.vendorId} with login ${access.login}`
                );
                await saveSession(access, stdout.session);
            }

            return callWeboob(
                command,
                access,
                debug,
                forceUpdate,
                fromDate,
                isInteractive,
                /* resume2fa */ true
            );
        }

        log.info('Command returned an error code.');

        if (access && stdout.error_code in RESET_SESSION_ERRORS) {
            log.warn(
                `Resetting session for access from bank ${access.vendorId} with login ${access.login}`
            );
            await resetSession(access);
        }

        throw new KError(
            stdout.error_message ? stdout.error_message : stdout.error_code,
            null,
            stdout.error_code,
            stdout.error_short
        );
    }

    log.info('OK: weboob exited normally with non-empty JSON content.');

    if (access && stdout.session) {
        log.info(
            `Saving session for access from bank ${access.vendorId} with login ${access.login}`
        );
        await saveSession(access, stdout.session);
    }

    return stdout.values;
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
