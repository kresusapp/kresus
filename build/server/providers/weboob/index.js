"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const path = __importStar(require("path"));
const models_1 = require("../../models/");
const helpers_1 = require("../../helpers");
const errors_json_1 = require("../../shared/errors.json");
const log = helpers_1.makeLogger('providers/weboob');
// A map to store session information attached to an access (cookies, last visited URL...).
// The access' id is the key to get the session information.
const SessionsMap = new Map();
// Subcommand error code indicating malformed argparse parameters.
const ARGPARSE_MALFORMED_OPTIONS_CODE = 2;
// The list of errors which should trigger a reset of the session when raised.
const RESET_SESSION_ERRORS = [errors_json_1.INVALID_PARAMETERS, errors_json_1.INVALID_PASSWORD, errors_json_1.EXPIRED_PASSWORD];
const NOT_INSTALLED_ERRORS = [
    errors_json_1.WEBOOB_NOT_INSTALLED,
    errors_json_1.INTERNAL_ERROR,
    errors_json_1.GENERIC_EXCEPTION,
    errors_json_1.UNKNOWN_WEBOOB_MODULE
];
async function saveSession(access, session) {
    if (!access.id) {
        // Probably just testing. Ignore.
        return;
    }
    // Save it as is in the in-memory cache.
    SessionsMap.set(access.id, session);
    // Serialize it in the database.
    const serializedSession = JSON.stringify(session);
    await models_1.Access.update(access.userId, access.id, {
        session: serializedSession
    });
}
async function resetSession(access) {
    if (!access.id) {
        // Probably just testing. Ignore.
        return;
    }
    SessionsMap.delete(access.id);
    await models_1.Access.update(access.userId, access.id, { session: null });
}
async function readSession(access) {
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
            }
            catch (err) {
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
        const script = child_process_1.spawn(command, args, { env });
        let stdoutBuffer = Buffer.from('');
        script.stdout.on('data', data => {
            stdoutBuffer = Buffer.concat([stdoutBuffer, data]);
        });
        let stderrBuffer = Buffer.from('');
        script.stderr.on('data', data => {
            stderrBuffer = Buffer.concat([stderrBuffer, data]);
        });
        script.on('close', code => {
            const stderr = stderrBuffer.toString('utf8').trim();
            const stdout = stdoutBuffer.toString('utf8').trim();
            accept({
                code,
                stderr,
                stdout
            });
        });
    });
}
async function weboobCommand(envParam, cliArgs) {
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
    const { code, stderr, stdout } = await subcommand(process.kresus.pythonExec, [path.join(path.dirname(__filename), 'py', 'main.py')].concat(cliArgs), env);
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
    else {
        jsonResponse.kind = 'success';
    }
    return jsonResponse;
}
function defaultWeboobOptions() {
    return {
        debug: false,
        forceUpdate: false,
        isInteractive: false,
        resume2fa: false,
        fromDate: null
    };
}
async function callWeboob(command, options, access = null) {
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
    const env = {};
    if (command === 'accounts' || command === 'operations') {
        helpers_1.assert(access !== null, 'Access must not be null for accounts/operations.');
        cliArgs.push('--module', access.vendorId, '--login', access.login);
        // Pass the password via an environment variable to hide it.
        helpers_1.assert(access.password !== null, 'Access must have a password for fetching.');
        env.KRESUS_WEBOOB_PWD = access.password;
        // Pass the session information as environment variable to hide it.
        const session = await readSession(access);
        if (session) {
            env.KRESUS_WEBOOB_SESSION = JSON.stringify(session);
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
    const response = (await weboobCommand(env, cliArgs));
    // If valid JSON output, check for an error within JSON.
    if (response.kind === 'error') {
        if (response.error_code === errors_json_1.WAIT_FOR_2FA) {
            log.info('Waiting for 2fa, restart command with resume.');
            if (access && response.session) {
                log.info(`Saving session for access from bank ${access.vendorId} with login ${access.login}`);
                await saveSession(access, response.session);
            }
            const newOpts = { ...options, resume2fa: true };
            return callWeboob(command, newOpts, access);
        }
        log.info('Command returned an error code.');
        if (access && RESET_SESSION_ERRORS.includes(response.error_code)) {
            log.warn(`Resetting session for access from bank ${access.vendorId} with login ${access.login}`);
            await resetSession(access);
        }
        throw new helpers_1.KError(response.error_message ? response.error_message : response.error_code, null, response.error_code, response.error_short);
    }
    helpers_1.assert(response.kind === 'success', 'Must be a successful weboob response');
    log.info('OK: weboob exited normally with non-empty JSON content.');
    if (access && response.session) {
        log.info(`Saving session for access from bank ${access.vendorId} with login ${access.login}`);
        await saveSession(access, response.session);
    }
    return response.values;
}
let cachedWeboobVersion = helpers_1.UNKNOWN_WEBOOB_VERSION;
exports.SOURCE_NAME = 'weboob';
async function testInstall() {
    try {
        log.info('Checking that weboob is installed and can actually be called…');
        await callWeboob('test', defaultWeboobOptions());
        return true;
    }
    catch (err) {
        log.error(`When testing install: ${err}`);
        cachedWeboobVersion = helpers_1.UNKNOWN_WEBOOB_VERSION;
        return false;
    }
}
exports.testInstall = testInstall;
async function getVersion(forceFetch = false) {
    if (cachedWeboobVersion === helpers_1.UNKNOWN_WEBOOB_VERSION ||
        !helpers_1.checkWeboobMinimalVersion(cachedWeboobVersion) ||
        forceFetch) {
        try {
            cachedWeboobVersion = await callWeboob('version', defaultWeboobOptions());
            if (cachedWeboobVersion === '?') {
                cachedWeboobVersion = helpers_1.UNKNOWN_WEBOOB_VERSION;
            }
        }
        catch (err) {
            log.error(`When getting Weboob version: ${err}`);
            cachedWeboobVersion = helpers_1.UNKNOWN_WEBOOB_VERSION;
        }
    }
    return cachedWeboobVersion;
}
exports.getVersion = getVersion;
async function _fetchHelper(command, options, access) {
    try {
        return await callWeboob(command, options, access);
    }
    catch (err) {
        if (NOT_INSTALLED_ERRORS.includes(err.errCode) && !(await testInstall())) {
            throw new helpers_1.KError("Weboob doesn't seem to be installed, skipping fetch.", null, errors_json_1.WEBOOB_NOT_INSTALLED);
        }
        log.error(`Got error while running command "${command}": ${err.message}`);
        if (typeof err.errCode !== 'undefined') {
            log.error(`\t(error code: ${err.errCode})`);
        }
        throw err;
    }
}
async function fetchAccounts({ access, debug, update, isInteractive }) {
    return await _fetchHelper('accounts', {
        ...defaultWeboobOptions(),
        debug,
        forceUpdate: update,
        isInteractive
    }, access);
}
exports.fetchAccounts = fetchAccounts;
async function fetchOperations({ access, debug, fromDate, isInteractive }) {
    return await _fetchHelper('operations', {
        ...defaultWeboobOptions(),
        debug,
        isInteractive,
        fromDate
    }, access);
}
exports.fetchOperations = fetchOperations;
// Can throw.
async function updateWeboobModules() {
    await callWeboob('test', { ...defaultWeboobOptions(), forceUpdate: true });
}
exports.updateWeboobModules = updateWeboobModules;
exports.testing = {
    callWeboob,
    defaultWeboobOptions,
    SessionsMap
};
