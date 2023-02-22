"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testing = exports.updateModules = exports.getVersion = exports._ = exports.SOURCE_NAME = exports.fetchOperations = exports.fetchAccounts = void 0;
const child_process_1 = require("child_process");
const path = __importStar(require("path"));
const helpers_1 = require("../../helpers");
const errors_json_1 = require("../../shared/errors.json");
const log = (0, helpers_1.makeLogger)('providers/woob');
// Subcommand error code indicating malformed argparse parameters.
const ARGPARSE_MALFORMED_OPTIONS_CODE = 2;
// The list of errors which should trigger a reset of the session when raised.
const RESET_SESSION_ERRORS = [errors_json_1.INVALID_PARAMETERS, errors_json_1.INVALID_PASSWORD, errors_json_1.EXPIRED_PASSWORD];
const NOT_INSTALLED_ERRORS = [
    errors_json_1.WOOB_NOT_INSTALLED,
    errors_json_1.INTERNAL_ERROR,
    errors_json_1.GENERIC_EXCEPTION,
    errors_json_1.UNKNOWN_WOOB_MODULE,
];
// Runs the subcommad `command`, with the given array of args, setting the
// environment to the given value.
function subcommand(command, args, env) {
    return new Promise(accept => {
        const script = (0, child_process_1.spawn)(command, args, { env });
        let stdoutBuffer = Buffer.from('');
        script.stdout.on('data', (data) => {
            stdoutBuffer = Buffer.concat([stdoutBuffer, data]);
        });
        let stderrBuffer = Buffer.from('');
        script.stderr.on('data', (data) => {
            stderrBuffer = Buffer.concat([stderrBuffer, data]);
        });
        script.on('close', (code) => {
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
async function woobCommand(envParam, cliArgs) {
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
    const { code, stderr, stdout } = await subcommand(process.kresus.pythonExec, [path.join(path.dirname(__filename), 'py', 'main.py')].concat(cliArgs), env);
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
    }
    catch (e) {
        // We got an invalid JSON response, there is a real and important error.
        if (code === ARGPARSE_MALFORMED_OPTIONS_CODE) {
            throw new helpers_1.KError('Options are malformed', null, errors_json_1.INTERNAL_ERROR);
        }
        if (code !== 0) {
            // If code is non-zero, treat as stderr, that is a crash of the Python script.
            throw new helpers_1.KError(`Process exited with non-zero error code ${code}. Unknown error. Stderr was:
${stderr}`);
        }
        // Else, treat it as invalid JSON. This should never happen, it would
        // be a programming error.
        throw new helpers_1.KError(`Invalid JSON response: ${e.message}.`);
    }
    if (typeof jsonResponse.error_code !== 'undefined') {
        jsonResponse.kind = 'error';
    }
    else if (typeof jsonResponse.action_kind !== 'undefined') {
        jsonResponse.kind = 'user_action';
    }
    else {
        jsonResponse.kind = 'success';
    }
    return jsonResponse;
}
function defaultOptions() {
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
async function callWoob(command, options, sessionManager, access = null) {
    log.info(`Calling woob: command ${command}...`);
    const cliArgs = [command];
    if (options.isInteractive) {
        cliArgs.push('--interactive');
    }
    if (options.userActionFields !== null) {
        const fields = Object.keys(options.userActionFields);
        if (fields.length === 0) {
            // AppValidation resume.
            cliArgs.push('--resume');
        }
        else {
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
    const env = {};
    if (command === 'accounts' || command === 'operations') {
        (0, helpers_1.assert)(access !== null, 'Access must not be null for accounts/operations.');
        cliArgs.push('--module', access.vendorId, '--login', access.login);
        // Pass the password via an environment variable to hide it.
        (0, helpers_1.assert)(access.password !== null, 'Access must have a password for fetching.');
        env.KRESUS_WOOB_PWD = access.password;
        // Pass the session information as environment variable to hide it.
        (0, helpers_1.assert)(sessionManager !== null, 'session manager must be provided for accounts/operations.');
        const session = await sessionManager.read(access);
        if (session) {
            env.KRESUS_WOOB_SESSION = JSON.stringify(session);
        }
        const { fields = [] } = access;
        for (const { name, value } of fields) {
            if (typeof name === 'undefined' || typeof value === 'undefined') {
                throw new helpers_1.KError(`Missing 'name' (${name}) or 'value' (${value}) for field`, null, errors_json_1.INVALID_PARAMETERS);
            }
            cliArgs.push('--field', name, value);
        }
        if (command === 'operations' && options.fromDate !== null) {
            const timestamp = `${options.fromDate.getTime() / 1000}`;
            cliArgs.push('--fromDate', timestamp);
        }
    }
    const response = (await woobCommand(env, cliArgs));
    // If valid JSON output, check for an error within JSON.
    if (response.kind === 'error') {
        log.info('Command returned an error code.');
        if (access && RESET_SESSION_ERRORS.includes(response.error_code)) {
            (0, helpers_1.assert)(sessionManager !== null, 'session manager required.');
            log.warn(`Resetting session for access from bank ${access.vendorId} with login ${access.login}`);
            await sessionManager.reset(access);
        }
        throw new helpers_1.KError(response.error_message ? response.error_message : response.error_code, null, response.error_code, response.error_short);
    }
    if (access && response.session) {
        (0, helpers_1.assert)(sessionManager !== null, 'session manager required.');
        log.info(`Saving session for access from bank ${access.vendorId} with login ${access.login}`);
        await sessionManager.save(access, response.session);
    }
    if (response.kind === 'user_action') {
        switch (response.action_kind) {
            case 'decoupled_validation': {
                log.info('Decoupled validation is required; propagating information to the user.');
                (0, helpers_1.assert)(typeof response.message === 'string', 'message must be filled by woob');
                return {
                    kind: 'user_action',
                    actionKind: 'decoupled_validation',
                    message: response.message,
                };
            }
            case 'browser_question': {
                log.info('Browser question is required; propagating question to the user.');
                (0, helpers_1.assert)(response.fields instanceof Array, 'fields must be filled by woob');
                for (const field of response.fields) {
                    (0, helpers_1.assert)(typeof field.id === 'string', 'field id must be filled by woob');
                }
                return {
                    kind: 'user_action',
                    actionKind: 'browser_question',
                    fields: response.fields,
                };
            }
            default: {
                throw new helpers_1.KError(`Likely a programmer error: unknown user action kind ${response.action_kind}`);
            }
        }
    }
    (0, helpers_1.assert)(response.kind === 'success', 'Must be a successful woob response');
    log.info('OK: woob exited normally with non-empty JSON content.');
    return {
        kind: 'values',
        values: response.values,
    };
}
let cachedVersion = helpers_1.UNKNOWN_WOOB_VERSION;
async function testInstall() {
    try {
        log.info('Checking that woob is installed and can actually be called…');
        await callWoob('test', defaultOptions(), null);
        return true;
    }
    catch (err) {
        log.error(`When testing install: ${err}`);
        cachedVersion = helpers_1.UNKNOWN_WOOB_VERSION;
        return false;
    }
}
async function _fetchHelper(command, options, sessionManager, access) {
    try {
        return await callWoob(command, options, sessionManager, access);
    }
    catch (err) {
        if (NOT_INSTALLED_ERRORS.includes(err.errCode) && !(await testInstall())) {
            throw new helpers_1.KError("Woob doesn't seem to be installed, skipping fetch.", null, errors_json_1.WOOB_NOT_INSTALLED);
        }
        log.error(`Got error while running command "${command}": ${err.message}`);
        if (typeof err.errCode !== 'undefined') {
            log.error(`\t(error code: ${err.errCode})`);
        }
        throw err;
    }
}
async function fetchAccounts({ access, debug, update, isInteractive, userActionFields, useNss }, sessionManager) {
    return await _fetchHelper('accounts', {
        ...defaultOptions(),
        debug,
        forceUpdate: update,
        isInteractive,
        userActionFields,
        useNss,
    }, sessionManager, access);
}
exports.fetchAccounts = fetchAccounts;
async function fetchOperations({ access, debug, fromDate, isInteractive, userActionFields, useNss }, sessionManager) {
    return await _fetchHelper('operations', {
        ...defaultOptions(),
        debug,
        isInteractive,
        fromDate,
        userActionFields,
        useNss,
    }, sessionManager, access);
}
exports.fetchOperations = fetchOperations;
exports.SOURCE_NAME = 'woob';
// It's not possible to type-check the exports themselves, so make a synthetic
// object that represents those, to make sure that the exports behave as
// expected, and use it.
exports._ = {
    SOURCE_NAME: 'woob',
    fetchAccounts,
    fetchOperations,
};
async function getVersion(forceFetch = false) {
    if (cachedVersion === helpers_1.UNKNOWN_WOOB_VERSION ||
        !(0, helpers_1.checkMinimalWoobVersion)(cachedVersion) ||
        forceFetch) {
        try {
            const response = await callWoob('version', defaultOptions(), null);
            (0, helpers_1.assert)(response.kind === 'values', 'getting the version number should always succeed');
            cachedVersion = response.values;
            if (cachedVersion === '?') {
                cachedVersion = helpers_1.UNKNOWN_WOOB_VERSION;
            }
        }
        catch (err) {
            log.error(`When getting Woob version: ${err}`);
            cachedVersion = helpers_1.UNKNOWN_WOOB_VERSION;
        }
    }
    return cachedVersion;
}
exports.getVersion = getVersion;
// Can throw.
async function updateModules() {
    await callWoob('test', { ...defaultOptions(), forceUpdate: true }, null);
}
exports.updateModules = updateModules;
exports.testing = {
    callWoob,
    defaultOptions,
};
