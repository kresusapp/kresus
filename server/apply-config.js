import path from 'path';
import ospath from 'ospath';

import { makeLogger } from './helpers';
import { setLogFilePath } from './lib/logger.js';

let log = makeLogger('apply-config');

function toBool(x) {
    return typeof x === 'string' ? x !== 'false' : !!x;
}

function checkPortOrDefault(maybePort, defaultPort, errorMessage) {
    // Use the defaultPort in case maybePort is not set in the config file, in an env variable
    // and the config file is not used.
    if (maybePort === null || typeof maybePort === 'undefined' || maybePort === '') {
        return defaultPort;
    }

    let port = Number.parseInt(maybePort, 10);

    if (Number.isNaN(port) || port <= 0 || port > 65535) {
        log.error(`Invalid value for port: ${maybePort}`);
        throw new Error(errorMessage);
    }

    return port;
}

module.exports = function prepareProcessKresus(config) {
    // Assume development mode if NODE_ENV isn't set.
    if (typeof process.env.NODE_ENV === 'undefined' || process.env.NODE_ENV.length === 0) {
        process.env.NODE_ENV = 'development';
    }

    process.kresus = {};

    let dataDir =
        process.env.KRESUS_DIR || (config && config.kresus && config.kresus.datadir) || null;
    if (!dataDir) {
        dataDir = path.join(ospath.home(), '.kresus');
    }
    process.kresus.dataDir = dataDir;

    let logFilePath = `${process.kresus.dataDir}/kresus.log`;
    if (typeof process.env.KRESUS_LOG_FILE !== 'undefined') {
        logFilePath = process.env.KRESUS_LOG_FILE;
    } else if (config && config.logs && config.logs.log_file) {
        logFilePath = config.logs.log_file;
    }
    process.kresus.logFilePath = logFilePath;
    setLogFilePath(process.kresus.logFilePath);

    let port = process.env.PORT || (config && config.kresus && config.kresus.port);
    if (process.env.NODE_ENV === 'development') {
        log.warn('In development mode, forcing port to 9876 for webpack-dev-server.');
        port = null;
    }
    process.kresus.port = checkPortOrDefault(port, 9876, 'Invalid Kresus port provided.');

    process.kresus.host =
        process.env.HOST || (config && config.kresus && config.kresus.host) || '127.0.0.1';

    process.kresus.pythonExec =
        process.env.KRESUS_PYTHON_EXEC ||
        (config && config.kresus && config.kresus.python_exec) ||
        'python2';

    let urlPrefix =
        process.env.KRESUS_URL_PREFIX ||
        (config && config.kresus && config.kresus.url_prefix) ||
        '';
    process.kresus.urlPrefix = path.posix.resolve('/', urlPrefix);

    process.kresus.weboobDir =
        process.env.KRESUS_WEBOOB_DIR || (config && config.weboob && config.weboob.srcdir) || null;

    process.kresus.weboobSourcesList =
        process.env.KRESUS_WEBOOB_SOURCES_LIST ||
        (config && config.weboob && config.weboob.sources_list) ||
        null;

    process.kresus.emailTransport =
        process.env.KRESUS_EMAIL_TRANSPORT ||
        (config && config.email && config.email.transport) ||
        null;
    if (
        process.kresus.emailTransport &&
        process.kresus.emailTransport !== 'smtp' &&
        process.kresus.emailTransport !== 'sendmail'
    ) {
        throw new Error('Invalid email transport provided.');
    }

    process.kresus.emailSendmailBin =
        process.env.KRESUS_EMAIL_SENDMAIL_BIN ||
        (config && config.email && config.email.sendmail_bin) ||
        null;

    process.kresus.emailFrom =
        process.env.KRESUS_EMAIL_FROM || (config && config.email && config.email.from) || null;

    process.kresus.smtpHost =
        process.env.KRESUS_EMAIL_HOST || (config && config.email && config.email.host) || null;

    let smtpPort = process.env.KRESUS_EMAIL_PORT || (config && config.email && config.email.port);
    process.kresus.smtpPort = checkPortOrDefault(smtpPort, null, 'Invalid SMTP port provided.');

    process.kresus.smtpUser =
        process.env.KRESUS_EMAIL_USER || (config && config.email && config.email.user) || null;

    process.kresus.smtpPassword =
        process.env.KRESUS_EMAIL_PASSWORD ||
        (config && config.email && config.email.password) ||
        null;

    let smtpForceTLS = false;
    if (typeof process.env.KRESUS_EMAIL_FORCE_TLS !== 'undefined') {
        smtpForceTLS = process.env.KRESUS_EMAIL_FORCE_TLS;
    } else if (config && config.email && typeof config.email.force_tls !== 'undefined') {
        smtpForceTLS = config.email.force_tls;
    }
    process.kresus.smtpForceTLS = toBool(smtpForceTLS);

    let smtpRejectUnauthorizedTLS = true;
    if (typeof process.env.KRESUS_EMAIL_REJECT_UNAUTHORIZED_TLS !== 'undefined') {
        smtpRejectUnauthorizedTLS = process.env.KRESUS_EMAIL_REJECT_UNAUTHORIZED_TLS;
    } else if (
        config &&
        config.email &&
        typeof config.email.reject_unauthorized_tls !== 'undefined'
    ) {
        smtpRejectUnauthorizedTLS = config.email.reject_unauthorized_tls;
    }
    process.kresus.smtpRejectUnauthorizedTLS = toBool(smtpRejectUnauthorizedTLS);

    let displayedPassword = process.kresus.smtpPassword === null ? null : '(hidden)';

    log.info(`Running Kresus with the following parameters:
- NODE_ENV = ${process.env.NODE_ENV}
- KRESUS_DIR = ${process.kresus.dataDir}
- HOST = ${process.kresus.host}
- PORT = ${process.kresus.port}
- KRESUS_PYTHON_EXEC = ${process.kresus.pythonExec}
- KRESUS_URL_PREFIX = ${process.kresus.urlPrefix}
- KRESUS_WEBOOB_DIR = ${process.kresus.weboobDir}
- KRESUS_WEBOOB_SOURCES_LIST = ${process.kresus.weboobSourcesList}
- KRESUS_EMAIL_TRANSPORT = ${process.kresus.emailTransport}
- KRESUS_EMAIL_SENDMAIL_BIN = ${process.kresus.emailSendmailBin}
- KRESUS_EMAIL_FROM = ${process.kresus.emailFrom}
- KRESUS_EMAIL_HOST = ${process.kresus.smtpHost}
- KRESUS_EMAIL_PORT = ${process.kresus.smtpPort}
- KRESUS_EMAIL_USER = ${process.kresus.smtpUser}
- KRESUS_EMAIL_PASSWORD = ${displayedPassword}
- KRESUS_EMAIL_FORCE_TLS = ${process.kresus.smtpForceTLS}
- KRESUS_EMAIL_REJECT_UNAUTHORIZED_TLS = ${process.kresus.smtpRejectUnauthorizedTLS}
- KRESUS_LOG_FILE = ${process.kresus.logFilePath}
            `);
};
