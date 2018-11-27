import path from 'path';
import ospath from 'ospath';

import { assert, makeLogger } from './helpers';
import { setLogFilePath } from './lib/logger.js';

let log = makeLogger('apply-config');

function toBool(strOrBool) {
    let ret = typeof strOrBool === 'string' ? strOrBool !== 'false' : strOrBool;
    assert(typeof ret === 'boolean');
    return ret;
}

function checkPort(portStr, errorMessage) {
    assert(typeof portStr === 'string');
    assert(typeof errorMessage === 'string');
    let port = Number.parseInt(portStr, 10);
    if (Number.isNaN(port) || port <= 0 || port > 65535) {
        log.error(`Invalid value for port: ${portStr}`);
        throw new Error(errorMessage);
    }
    return port;
}

function extractValue(config, { envName, defaultVal, configPath }) /* -> string */ {
    let value = process.env[envName];

    if (typeof value === 'undefined') {
        let stack = configPath.split('.');
        stack.shift(); // Remove 'config'.
        value = config;
        while (stack.length && typeof value !== 'undefined') {
            value = value[stack.shift()];
        }
    }

    if (typeof value === 'undefined' || (typeof value === 'string' && value.length === 0)) {
        value = defaultVal;
    }

    return value === null ? null : `${value}`;
}

function processOption(config, { envName, defaultVal, configPath, cleanupAction, processPath }) {
    assert(typeof envName === 'string');
    assert(typeof defaultVal === 'string' || defaultVal === null);
    assert(typeof configPath === 'string');
    assert(typeof processPath === 'string');

    let value = extractValue(config, { envName, defaultVal, configPath });
    if (typeof cleanupAction !== 'undefined') {
        assert(typeof cleanupAction === 'function');
        value = cleanupAction(value);
    }
    process.kresus[processPath] = value;
}

let OPTIONS = [
    {
        envName: 'KRESUS_DIR',
        configPath: 'config.kresus.datadir',
        defaultVal: path.join(ospath.home(), '.kresus'),
        processPath: 'dataDir'
    },

    {
        envName: 'KRESUS_LOG_FILE',
        configPath: 'config.logs.log_file',
        defaultVal: null,
        processPath: 'logFilePath',
        cleanupAction: maybePath => {
            let checkedPath = maybePath;
            if (checkedPath === null) {
                checkedPath = path.join(process.kresus.dataDir, 'kresus.log');
            }
            setLogFilePath(checkedPath);
            return checkedPath;
        }
    },

    {
        envName: 'PORT',
        configPath: 'config.kresus.port',
        defaultVal: '9876',
        processPath: 'port',
        cleanupAction: uncheckedPort => {
            let port = uncheckedPort;
            if (process.env.NODE_ENV === 'development') {
                log.warn('In development mode, forcing port to 9876 for webpack-dev-server.');
                port = 9876;
            } else {
                port = checkPort(port, 'Invalid Kresus port provided.');
            }
            return port;
        }
    },

    {
        envName: 'HOST',
        configPath: 'config.kresus.host',
        defaultVal: '127.0.0.1',
        processPath: 'host'
    },

    {
        envName: 'KRESUS_PYTHON_EXEC',
        configPath: 'config.kresus.python_exec',
        defaultVal: 'python2',
        processPath: 'pythonExec'
    },

    {
        envName: 'KRESUS_URL_PREFIX',
        configPath: 'config.kresus.url_prefix',
        defaultVal: '',
        processPath: 'urlPrefix',
        cleanupAction: prefix => path.posix.resolve('/', prefix)
    },

    {
        envName: 'KRESUS_WEBOOB_DIR',
        configPath: 'config.weboob.srcdir',
        defaultVal: null,
        processPath: 'weboobDir'
    },

    {
        envName: 'KRESUS_WEBOOB_SOURCES_LIST',
        configPath: 'config.weboob.sources_list',
        defaultVal: null,
        processPath: 'weboobSourcesList'
    },

    {
        envName: 'KRESUS_EMAIL_TRANSPORT',
        configPath: 'config.email.transport',
        defaultVal: null,
        processPath: 'emailTransport',
        cleanupAction: val => {
            if (val !== null && val !== 'smtp' && val !== 'sendmail') {
                throw new Error('Invalid email transport provided.');
            }
            return val;
        }
    },

    {
        envName: 'KRESUS_EMAIL_SENDMAIL_BIN',
        configPath: 'config.email.sendmail_bin',
        defaultVal: null,
        processPath: 'emailSendmailBin'
    },

    {
        envName: 'KRESUS_EMAIL_FROM',
        configPath: 'config.email.from',
        defaultVal: null,
        processPath: 'emailFrom'
    },

    {
        envName: 'KRESUS_EMAIL_HOST',
        configPath: 'config.email.host',
        defaultVal: null,
        processPath: 'smtpHost'
    },

    {
        envName: 'KRESUS_EMAIL_PORT',
        configPath: 'config.email.port',
        defaultVal: null,
        processPath: 'smtpPort',
        cleanupAction: val => {
            return val !== null ? checkPort(val, 'Invalid SMTP port provided') : null;
        }
    },

    {
        envName: 'KRESUS_EMAIL_USER',
        configPath: 'config.email.user',
        defaultVal: null,
        processPath: 'smtpUser'
    },

    {
        envName: 'KRESUS_EMAIL_PASSWORD',
        configPath: 'config.email.password',
        defaultVal: null,
        processPath: 'smtpPassword'
    },

    {
        envName: 'KRESUS_EMAIL_FORCE_TLS',
        configPath: 'config.email.force_tls',
        defaultVal: 'false',
        processPath: 'smtpForceTLS',
        cleanupAction: toBool
    },

    {
        envName: 'KRESUS_EMAIL_REJECT_UNAUTHORIZED_TLS',
        configPath: 'config.email.reject_unauthorized_tls',
        defaultVal: 'true',
        processPath: 'smtpRejectUnauthorizedTLS',
        cleanupAction: toBool
    }
];

module.exports = function prepareProcessKresus(config) {
    // Assume development mode if NODE_ENV isn't set.
    if (typeof process.env.NODE_ENV === 'undefined' || process.env.NODE_ENV.length === 0) {
        process.env.NODE_ENV = 'development';
    }

    process.kresus = {
        user: {
            // Put a fake value here until we get proper identity management.
            login: 'user'
        }
    };

    for (let option of OPTIONS) {
        processOption(config, option);
    }

    log.info('Running Kresus with the following parameters:');
    log.info(`NODE_ENV = ${process.env.NODE_ENV}`);
    log.info(`KRESUS_LOGIN = ${process.kresus.user.login}`);
    for (let option of OPTIONS) {
        let displayed = option.processPath.toLowerCase().includes('password')
            ? '(hidden)'
            : process.kresus[option.processPath];
        log.info(`${option.envName} = ${displayed}`);
    }
};
