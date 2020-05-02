import { spawn } from 'child_process';
import * as path from 'path';

import { Access } from '../../models/';

import {
    assert,
    makeLogger,
    KError,
    checkWeboobMinimalVersion,
    UNKNOWN_WEBOOB_VERSION,
} from '../../helpers';

import {
    WEBOOB_NOT_INSTALLED,
    INTERNAL_ERROR,
    INVALID_PARAMETERS,
    UNKNOWN_WEBOOB_MODULE,
    GENERIC_EXCEPTION,
    INVALID_PASSWORD,
    EXPIRED_PASSWORD,
    WAIT_FOR_2FA,
} from '../../shared/errors.json';

import {
    ProviderAccount,
    ProviderTransaction,
    FetchOperationsOptions,
    FetchAccountsOptions,
} from '../';

const log = makeLogger('providers/weboob');

// A map to store session information attached to an access (cookies, last visited URL...).
// The access' id is the key to get the session information.
const SessionsMap = new Map();

// Subcommand error code indicating malformed argparse parameters.
const ARGPARSE_MALFORMED_OPTIONS_CODE = 2;

// The list of errors which should trigger a reset of the session when raised.
const RESET_SESSION_ERRORS = [INVALID_PARAMETERS, INVALID_PASSWORD, EXPIRED_PASSWORD];

const NOT_INSTALLED_ERRORS = [
    WEBOOB_NOT_INSTALLED,
    INTERNAL_ERROR,
    GENERIC_EXCEPTION,
    UNKNOWN_WEBOOB_MODULE,
];

async function saveSession(access: Access, session: object) {
    if (!access.id) {
        // Probably just testing. Ignore.
        return;
    }

    // Save it as is in the in-memory cache.
    SessionsMap.set(access.id, session);

    // Serialize it in the database.
    const serializedSession = JSON.stringify(session);
    await Access.update(access.userId, access.id, {
        session: serializedSession,
    });
}

async function resetSession(access: Access) {
    if (!access.id) {
        // Probably just testing. Ignore.
        return;
    }

    SessionsMap.delete(access.id);
    await Access.update(access.userId, access.id, { session: null });
}

async function readSession(access: Access): Promise<object | undefined> {
    if (!access.id) {
        // Probably just testing. Ignore.
        return;
    }

    // If it's not in the cache, try to read it from the database first, and
    // save it into the in-memory cache.
    if (!SessionsMap.has(access.id)) {
        const serialized = access.session;
        if (serialized !== null) {
            try {
                const asObject = JSON.parse(serialized);
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
function subcommand(
    command: string,
    args: string[],
    env: OptionalEnvParams
): Promise<{ code: number; stderr: string; stdout: string }> {
    return new Promise(accept => {
        const script = spawn(command, args, { env });

        let stdoutBuffer = Buffer.from('');
        script.stdout.on('data', (data: Buffer) => {
            stdoutBuffer = Buffer.concat([stdoutBuffer, data]);
        });

        let stderrBuffer = Buffer.from('');
        script.stderr.on('data', (data: Buffer) => {
            stderrBuffer = Buffer.concat([stderrBuffer, data]);
        });

        script.on('close', (code: number) => {
            const stderr = stderrBuffer.toString('utf8').trim();
            const stdout = stdoutBuffer.toString('utf8').trim();
            accept({
                code,
                stderr,
                stdout,
            });
        });
    });
}

interface OptionalEnvParams extends NodeJS.ProcessEnv {
    KRESUS_WEBOOB_PWD?: string;
    KRESUS_WEBOOB_SESSION?: string;
}

interface WeboobErrorResponse {
    kind: 'error';
    error_code: string;
    error_message: string;
    error_short: string;
    session: object;
}

interface WeboobSuccessResponse {
    kind: 'success';
    values: [object];
    session: object;
}

type WeboobResponse = WeboobErrorResponse | WeboobSuccessResponse;

async function weboobCommand(
    envParam: OptionalEnvParams,
    cliArgs: string[]
): Promise<WeboobResponse> {
    // We need to copy the whole `process.env` to ensure we don't break any
    // user setup, such as virtualenvs, NODE_ENV, etc.
    const env = Object.assign({ ...process.env }, envParam);

    // Fill in other common environment variables.
    if (process.kresus.weboobDir) {
        env.WEBOOB_DIR = process.kresus.weboobDir;
    }

    if (process.kresus.weboobSourcesList) {
        env.WEBOOB_SOURCES_LIST = process.kresus.weboobSourcesList;
    }

    env.KRESUS_DIR = process.kresus.dataDir;

    // Variable for PyExecJS, necessary for the Paypal module.
    env.EXECJS_RUNTIME = 'Node';

    const { code, stderr, stdout } = await subcommand(
        process.kresus.pythonExec,
        [path.join(path.dirname(__filename), 'py', 'main.py')].concat(cliArgs),
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
    let jsonResponse;
    try {
        jsonResponse = JSON.parse(stdout);
    } catch (e) {
        // We got an invalid JSON response, there is a real and important error.
        if (code === ARGPARSE_MALFORMED_OPTIONS_CODE) {
            throw new KError('Options are malformed', null, INTERNAL_ERROR);
        }

        if (code !== 0) {
            // If code is non-zero, treat as stderr, that is a crash of the Python script.
            throw new KError(
                `Process exited with non-zero error code ${code}. Unknown error. Stderr was:
${stderr}`
            );
        }

        // Else, treat it as invalid JSON. This should never happen, it would
        // be a programming error.
        throw new KError(`Invalid JSON response: ${e.message}.`);
    }

    if (typeof jsonResponse.error_code !== 'undefined') {
        jsonResponse.kind = 'error';
    } else {
        jsonResponse.kind = 'success';
    }

    return jsonResponse;
}

interface WeboobOptions {
    debug: boolean;
    forceUpdate: boolean;
    isInteractive: boolean;
    resume2fa: boolean;
    fromDate: Date | null;
}

function defaultWeboobOptions(): WeboobOptions {
    return {
        debug: false,
        forceUpdate: false,
        isInteractive: false,
        resume2fa: false,
        fromDate: null,
    };
}

async function callWeboob(
    command: string,
    options: WeboobOptions,
    access: Access | null = null
): Promise<any> {
    log.info(`Calling weboob: command ${command}...`);

    const cliArgs = [command];

    if (options.isInteractive) {
        cliArgs.push('--interactive');
    }
    if (options.resume2fa) {
        cliArgs.push('--resume');
    }
    if (options.debug) {
        cliArgs.push('--debug');
    }
    if (options.forceUpdate) {
        cliArgs.push('--update');
        log.info(`Weboob will be updated prior to command "${command}"`);
    }

    const env: OptionalEnvParams = {};
    if (command === 'accounts' || command === 'operations') {
        assert(access !== null, 'Access must not be null for accounts/operations.');

        cliArgs.push('--module', access.vendorId, '--login', access.login);

        // Pass the password via an environment variable to hide it.
        assert(access.password !== null, 'Access must have a password for fetching.');
        env.KRESUS_WEBOOB_PWD = access.password;

        // Pass the session information as environment variable to hide it.
        const session = await readSession(access);
        if (session) {
            env.KRESUS_WEBOOB_SESSION = JSON.stringify(session);
        }

        const { fields = [] } = access;
        for (const { name, value } of fields) {
            if (typeof name === 'undefined' || typeof value === 'undefined') {
                throw new KError(
                    `Missing 'name' (${name}) or 'value' (${value}) for field`,
                    null,
                    INVALID_PARAMETERS
                );
            }
            cliArgs.push('--field', name, value);
        }

        if (command === 'operations' && options.fromDate !== null) {
            const timestamp = `${options.fromDate.getTime() / 1000}`;
            cliArgs.push('--fromDate', timestamp);
        }
    }

    const response = (await weboobCommand(env, cliArgs)) as WeboobResponse;

    // If valid JSON output, check for an error within JSON.
    if (response.kind === 'error') {
        if (response.error_code === WAIT_FOR_2FA) {
            log.info('Waiting for 2fa, restart command with resume.');

            if (access && response.session) {
                log.info(
                    `Saving session for access from bank ${access.vendorId} with login ${access.login}`
                );
                await saveSession(access, response.session);
            }

            const newOpts = { ...options, resume2fa: true };
            return callWeboob(command, newOpts, access);
        }

        log.info('Command returned an error code.');

        if (access && RESET_SESSION_ERRORS.includes(response.error_code)) {
            log.warn(
                `Resetting session for access from bank ${access.vendorId} with login ${access.login}`
            );
            await resetSession(access);
        }

        throw new KError(
            response.error_message ? response.error_message : response.error_code,
            null,
            response.error_code,
            response.error_short
        );
    }

    assert(response.kind === 'success', 'Must be a successful weboob response');

    log.info('OK: weboob exited normally with non-empty JSON content.');

    if (access && response.session) {
        log.info(
            `Saving session for access from bank ${access.vendorId} with login ${access.login}`
        );
        await saveSession(access, response.session);
    }

    return response.values;
}

let cachedWeboobVersion: string | null = UNKNOWN_WEBOOB_VERSION;

export const SOURCE_NAME = 'weboob';

export async function testInstall() {
    try {
        log.info('Checking that weboob is installed and can actually be called…');
        await callWeboob('test', defaultWeboobOptions());
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
            cachedWeboobVersion = (await callWeboob('version', defaultWeboobOptions())) as string;
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

async function _fetchHelper(command: string, options: WeboobOptions, access: Access): Promise<any> {
    try {
        return await callWeboob(command, options, access);
    } catch (err) {
        if (NOT_INSTALLED_ERRORS.includes(err.errCode) && !(await testInstall())) {
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

export async function fetchAccounts({
    access,
    debug,
    update,
    isInteractive,
}: FetchAccountsOptions): Promise<ProviderAccount[]> {
    return await _fetchHelper(
        'accounts',
        {
            ...defaultWeboobOptions(),
            debug,
            forceUpdate: update,
            isInteractive,
        },
        access
    );
}
export async function fetchOperations({
    access,
    debug,
    fromDate,
    isInteractive,
}: FetchOperationsOptions): Promise<ProviderTransaction[]> {
    return await _fetchHelper(
        'operations',
        {
            ...defaultWeboobOptions(),
            debug,
            isInteractive,
            fromDate,
        },
        access
    );
}

// Can throw.
export async function updateWeboobModules() {
    await callWeboob('test', { ...defaultWeboobOptions(), forceUpdate: true });
}

export const testing = {
    callWeboob,
    defaultWeboobOptions,
    SessionsMap,
};
