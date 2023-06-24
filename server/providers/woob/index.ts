import { spawn } from 'child_process';
import * as path from 'path';

import { Access } from '../../models/';

import {
    assert,
    makeLogger,
    KError,
    checkMinimalWoobVersion,
    UNKNOWN_WOOB_VERSION,
} from '../../helpers';

import {
    WOOB_NOT_INSTALLED,
    INTERNAL_ERROR,
    INVALID_PARAMETERS,
    UNKNOWN_WOOB_MODULE,
    GENERIC_EXCEPTION,
    INVALID_PASSWORD,
    EXPIRED_PASSWORD,
} from '../../shared/errors.json';
import { UserActionField, UserActionKind, UserActionResponse } from '../../shared/types';

import {
    Provider,
    FetchTransactionsOptions,
    FetchAccountsOptions,
    SessionManager,
    ProviderAccountResponse,
    ProviderTransactionResponse,
} from '../';

const log = makeLogger('providers/woob');

// Subcommand error code indicating malformed argparse parameters.
const ARGPARSE_MALFORMED_OPTIONS_CODE = 2;

// The list of errors which should trigger a reset of the session when raised.
const RESET_SESSION_ERRORS = [INVALID_PARAMETERS, INVALID_PASSWORD, EXPIRED_PASSWORD];

const NOT_INSTALLED_ERRORS = [
    WOOB_NOT_INSTALLED,
    INTERNAL_ERROR,
    GENERIC_EXCEPTION,
    UNKNOWN_WOOB_MODULE,
];

interface OptionalEnvParams extends NodeJS.ProcessEnv {
    KRESUS_WOOB_PWD?: string;
    KRESUS_WOOB_SESSION?: string;
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

// An error returned by Woob.
interface WoobErrorResponse extends PythonResponse {
    kind: 'error';
    // eslint-disable-next-line camelcase
    error_code: string;
    // eslint-disable-next-line camelcase
    error_message: string;
    // eslint-disable-next-line camelcase
    error_short: string;
}

// The woob connection requires a user action.
interface WoobUserActionResponse extends PythonResponse {
    kind: 'user_action';
    // eslint-disable-next-line camelcase
    action_kind: UserActionKind;
    message?: string;
    fields: UserActionField[];
}

// Successful execution of woob, with a range of values, to be interpreted in
// the context of the caller's query.
interface WoobSuccessResponse extends PythonResponse {
    kind: 'success';
    values: [Record<string, unknown>];
}

type WoobResponse = WoobErrorResponse | WoobSuccessResponse | WoobUserActionResponse;

async function woobCommand(envParam: OptionalEnvParams, cliArgs: string[]): Promise<WoobResponse> {
    // We need to copy the whole `process.env` to ensure we don't break any
    // user setup, such as virtualenvs, NODE_ENV, etc.
    const env = Object.assign({ ...process.env }, envParam);

    // Fill in other common environment variables.
    if (process.kresus.woobDir) {
        env.WOOB_DIR = process.kresus.woobDir;
    }

    if (process.kresus.woobSourcesList) {
        env.WOOB_SOURCES_LIST = process.kresus.woobSourcesList;
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
    // legit error from Woob) will result in a non-zero error code. Hence, we
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

interface WoobOptions {
    debug: boolean;
    forceUpdate: boolean;
    isInteractive: boolean;
    resume2fa: boolean;
    useNss?: boolean;
    fromDate: Date | null;
    userActionFields: Record<string, string> | null;
}

function defaultOptions(): WoobOptions {
    return {
        debug: false,
        forceUpdate: false,
        isInteractive: false,
        resume2fa: false,
        useNss: false,
        fromDate: null,
        userActionFields: null,
    };
}

// bug in eslint which thinks this is declared twice??
// eslint-disable-next-line
enum CallWoobCommand {
    Test,
    Version,
    Transactions,
    Accounts,
}

async function callWoob(
    command: CallWoobCommand,
    options: WoobOptions,
    sessionManager: SessionManager | null,
    access: Access | null = null
): Promise<any> {
    log.info(`Calling woob: command ${command}...`);

    let textCommand: string;
    switch (command) {
        case CallWoobCommand.Test: {
            textCommand = 'test';
            break;
        }
        case CallWoobCommand.Version: {
            textCommand = 'version';
            break;
        }
        case CallWoobCommand.Transactions: {
            textCommand = 'transactions';
            break;
        }
        case CallWoobCommand.Accounts: {
            textCommand = 'accounts';
            break;
        }
        default: {
            throw new KError('invalid callWoob command');
        }
    }

    const cliArgs = [textCommand];

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
        log.info(`Woob will be updated prior to command "${command}"`);
    }

    if (typeof options.useNss !== 'undefined' && options.useNss) {
        cliArgs.push('--nss');
    }

    const env: OptionalEnvParams = {};
    if (command === CallWoobCommand.Accounts || command === CallWoobCommand.Transactions) {
        assert(access !== null, 'Access must not be null for accounts/transactions.');

        cliArgs.push('--module', access.vendorId, '--login', access.login);

        // Pass the password via an environment variable to hide it.
        assert(access.password !== null, 'Access must have a password for fetching.');
        env.KRESUS_WOOB_PWD = access.password;

        // Pass the session information as environment variable to hide it.
        assert(
            sessionManager !== null,
            'session manager must be provided for accounts/transactions.'
        );
        const session = await sessionManager.read(access);
        if (session) {
            env.KRESUS_WOOB_SESSION = JSON.stringify(session);
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

        if (command === CallWoobCommand.Transactions && options.fromDate !== null) {
            const timestamp = `${options.fromDate.getTime() / 1000}`;
            cliArgs.push('--fromDate', timestamp);
        }
    }

    const response = (await woobCommand(env, cliArgs)) as WoobResponse;

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
                assert(typeof response.message === 'string', 'message must be filled by woob');
                return {
                    kind: 'user_action',
                    actionKind: 'decoupled_validation',
                    message: response.message,
                };
            }

            case 'browser_question': {
                log.info('Browser question is required; propagating question to the user.');
                assert(response.fields instanceof Array, 'fields must be filled by woob');
                for (const field of response.fields) {
                    assert(typeof field.id === 'string', 'field id must be filled by woob');
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

    assert(response.kind === 'success', 'Must be a successful woob response');
    log.info('OK: woob exited normally with non-empty JSON content.');
    return {
        kind: 'values',
        values: response.values,
    };
}

let cachedVersion: string | null = UNKNOWN_WOOB_VERSION;

async function testInstall() {
    try {
        log.info('Checking that woob is installed and can actually be called…');
        await callWoob(CallWoobCommand.Test, defaultOptions(), null);
        return true;
    } catch (err) {
        log.error(`When testing install: ${err}`);
        cachedVersion = UNKNOWN_WOOB_VERSION;
        return false;
    }
}

async function _fetchHelper<T>(
    command: CallWoobCommand,
    options: WoobOptions,
    sessionManager: SessionManager,
    access: Access
): Promise<T | UserActionResponse> {
    try {
        return await callWoob(command, options, sessionManager, access);
    } catch (err) {
        if (NOT_INSTALLED_ERRORS.includes(err.errCode) && !(await testInstall())) {
            throw new KError(
                "Woob doesn't seem to be installed, skipping fetch.",
                null,
                WOOB_NOT_INSTALLED
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
    { access, debug, update, isInteractive, userActionFields, useNss }: FetchAccountsOptions,
    sessionManager: SessionManager
): Promise<ProviderAccountResponse | UserActionResponse> {
    return await _fetchHelper<ProviderAccountResponse>(
        CallWoobCommand.Accounts,
        {
            ...defaultOptions(),
            debug,
            forceUpdate: update,
            isInteractive,
            userActionFields,
            useNss,
        },
        sessionManager,
        access
    );
}

export async function fetchTransactions(
    { access, debug, fromDate, isInteractive, userActionFields, useNss }: FetchTransactionsOptions,
    sessionManager: SessionManager
): Promise<ProviderTransactionResponse | UserActionResponse> {
    return await _fetchHelper<ProviderTransactionResponse>(
        CallWoobCommand.Transactions,
        {
            ...defaultOptions(),
            debug,
            isInteractive,
            fromDate,
            userActionFields,
            useNss,
        },
        sessionManager,
        access
    );
}

export const SOURCE_NAME = 'woob';

// It's not possible to type-check the exports themselves, so make a synthetic
// object that represents those, to make sure that the exports behave as
// expected, and use it.
export const _: Provider = {
    SOURCE_NAME: 'woob',
    fetchAccounts,
    fetchTransactions,
};

export async function getVersion(forceFetch = false) {
    if (
        cachedVersion === UNKNOWN_WOOB_VERSION ||
        !checkMinimalWoobVersion(cachedVersion) ||
        forceFetch
    ) {
        try {
            const response = await callWoob(CallWoobCommand.Version, defaultOptions(), null);

            assert(response.kind === 'values', 'getting the version number should always succeed');
            cachedVersion = response.values as string;

            if (cachedVersion === '?') {
                cachedVersion = UNKNOWN_WOOB_VERSION;
            }
        } catch (err) {
            log.error(`When getting Woob version: ${err}`);
            cachedVersion = UNKNOWN_WOOB_VERSION;
        }
    }
    return cachedVersion;
}

// Can throw.
export async function updateModules() {
    await callWoob(CallWoobCommand.Test, { ...defaultOptions(), forceUpdate: true }, null);
}

export const testing = {
    callWoob,
    CallWoobCommand,
    defaultOptions,
};
