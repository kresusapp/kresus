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
} from '../../shared/errors.json';
import { UserActionField, UserActionKind, UserActionResponse } from '../../shared/types';

import {
    Provider,
    FetchOperationsOptions,
    FetchAccountsOptions,
    SessionManager,
    ProviderAccountResponse,
    ProviderTransactionResponse,
} from '../';

const log = makeLogger('providers/weboob');

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

interface OptionalEnvParams extends NodeJS.ProcessEnv {
    KRESUS_WEBOOB_PWD?: string;
    KRESUS_WEBOOB_SESSION?: string;
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

interface PythonResponse {
    kind: 'error' | 'user_action' | 'success';
    session: Record<string, unknown>;
}

interface WeboobErrorResponse extends PythonResponse {
    kind: 'error';
    // eslint-disable-next-line camelcase
    error_code: string;
    // eslint-disable-next-line camelcase
    error_message: string;
    // eslint-disable-next-line camelcase
    error_short: string;
}

interface WeboobUserActionResponse extends PythonResponse {
    kind: 'user_action';
    // eslint-disable-next-line camelcase
    action_kind: UserActionKind;
    message?: string;
    fields: UserActionField[];
}

interface WeboobSuccessResponse extends PythonResponse {
    kind: 'success';
    values: [Record<string, unknown>];
}

type WeboobResponse = WeboobErrorResponse | WeboobSuccessResponse | WeboobUserActionResponse;

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
    } else if (typeof jsonResponse.action_kind !== 'undefined') {
        jsonResponse.kind = 'user_action';
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
    userActionFields: Record<string, string> | null;
}

function defaultWeboobOptions(): WeboobOptions {
    return {
        debug: false,
        forceUpdate: false,
        isInteractive: false,
        resume2fa: false,
        fromDate: null,
        userActionFields: null,
    };
}

async function callWeboob(
    command: string,
    options: WeboobOptions,
    sessionManager: SessionManager | null,
    access: Access | null = null
): Promise<any> {
    log.info(`Calling weboob: command ${command}...`);

    const cliArgs = [command];

    if (options.isInteractive) {
        cliArgs.push('--interactive');
    }

    if (options.userActionFields !== null) {
        const fields = Object.keys(options.userActionFields);
        if (fields.length === 0) {
            // AppValidation resume.
            cliArgs.push('--resume');
        } else {
            for (const name of fields) {
                cliArgs.push('--field', name, options.userActionFields[name]);
            }
        }
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
        assert(
            sessionManager !== null,
            'session manager must be provided for accounts/operations.'
        );
        const session = await sessionManager.read(access);
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
        log.info('Command returned an error code.');

        if (access && RESET_SESSION_ERRORS.includes(response.error_code)) {
            assert(sessionManager !== null, 'session manager required.');
            log.warn(
                `Resetting session for access from bank ${access.vendorId} with login ${access.login}`
            );
            await sessionManager.reset(access);
        }

        throw new KError(
            response.error_message ? response.error_message : response.error_code,
            null,
            response.error_code,
            response.error_short
        );
    }

    if (access && response.session) {
        assert(sessionManager !== null, 'session manager required.');
        log.info(
            `Saving session for access from bank ${access.vendorId} with login ${access.login}`
        );
        await sessionManager.save(access, response.session);
    }

    if (response.kind === 'user_action') {
        switch (response.action_kind) {
            case 'decoupled_validation': {
                log.info('Decoupled validation is required; propagating information to the user.');
                assert(typeof response.message === 'string', 'message must be filled by weboob');
                return {
                    kind: 'user_action',
                    actionKind: 'decoupled_validation',
                    message: response.message,
                };
            }

            case 'browser_question': {
                log.info('Browser question is required; propagating question to the user.');
                assert(response.fields instanceof Array, 'fields must be filled by weboob');
                for (const field of response.fields) {
                    assert(typeof field.id === 'string', 'field id must be filled by weboob');
                }
                return {
                    kind: 'user_action',
                    actionKind: 'browser_question',
                    fields: response.fields,
                };
            }

            default: {
                throw new KError(
                    `Likely a programmer error: unknown user action kind ${response.action_kind}`
                );
            }
        }
    }

    assert(response.kind === 'success', 'Must be a successful weboob response');
    log.info('OK: weboob exited normally with non-empty JSON content.');
    return {
        kind: 'values',
        values: response.values,
    };
}

let cachedWeboobVersion: string | null = UNKNOWN_WEBOOB_VERSION;

async function testInstall() {
    try {
        log.info('Checking that weboob is installed and can actually be called…');
        await callWeboob('test', defaultWeboobOptions(), null);
        return true;
    } catch (err) {
        log.error(`When testing install: ${err}`);
        cachedWeboobVersion = UNKNOWN_WEBOOB_VERSION;
        return false;
    }
}

async function _fetchHelper<T>(
    command: string,
    options: WeboobOptions,
    sessionManager: SessionManager,
    access: Access
): Promise<T | UserActionResponse> {
    try {
        return await callWeboob(command, options, sessionManager, access);
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

export async function fetchAccounts(
    { access, debug, update, isInteractive, userActionFields }: FetchAccountsOptions,
    sessionManager: SessionManager
): Promise<ProviderAccountResponse | UserActionResponse> {
    return await _fetchHelper<ProviderAccountResponse>(
        'accounts',
        {
            ...defaultWeboobOptions(),
            debug,
            forceUpdate: update,
            isInteractive,
            userActionFields,
        },
        sessionManager,
        access
    );
}

export async function fetchOperations(
    { access, debug, fromDate, isInteractive, userActionFields }: FetchOperationsOptions,
    sessionManager: SessionManager
): Promise<ProviderTransactionResponse | UserActionResponse> {
    return await _fetchHelper<ProviderTransactionResponse>(
        'operations',
        {
            ...defaultWeboobOptions(),
            debug,
            isInteractive,
            fromDate,
            userActionFields,
        },
        sessionManager,
        access
    );
}

export const SOURCE_NAME = 'weboob';

// It's not possible to type-check the exports themselves, so make a synthetic
// object that represents those, to make sure that the exports behave as
// expected, and use it.
export const _: Provider = {
    SOURCE_NAME: 'weboob',
    fetchAccounts,
    fetchOperations,
};

export async function getVersion(forceFetch = false) {
    if (
        cachedWeboobVersion === UNKNOWN_WEBOOB_VERSION ||
        !checkWeboobMinimalVersion(cachedWeboobVersion) ||
        forceFetch
    ) {
        try {
            const response = await callWeboob('version', defaultWeboobOptions(), null);

            assert(response.kind === 'values', 'getting the version number should always succeed');
            cachedWeboobVersion = response.values as string;

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

// Can throw.
export async function updateWeboobModules() {
    await callWeboob('test', { ...defaultWeboobOptions(), forceUpdate: true }, null);
}

export const testing = {
    callWeboob,
    defaultWeboobOptions,
};
