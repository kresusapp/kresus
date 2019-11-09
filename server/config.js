import path from 'path';
import ospath from 'ospath';

import { assert, makeLogger } from './helpers';
import { setLogFilePath } from './lib/logger';

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

let OPTIONS = [
    {
        envName: 'KRESUS_DIR',
        configPath: 'config.kresus.datadir',
        defaultVal: path.join(ospath.home(), '.kresus'),
        processPath: 'dataDir',
        doc: `This is where Kresus stores additional data, as the latest bank
        scrapping modules. It should be writeable by the user which launches
        the Kresus executable.`,
        defaultDoc: 'HOME_DIR/.kresus',
        docExample: '/home/ben/.kresus'
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
        },
        doc: `This is the port that Kresus will run on. It is recommended not
        to expose it on port 80 directly but to use a reverse-proxy
        configuration like Nginx, Caddy or Apache.`
    },

    {
        envName: 'HOST',
        configPath: 'config.kresus.host',
        defaultVal: '127.0.0.1',
        processPath: 'host',
        doc: 'The host on which the Kresus server will listen to.'
    },

    {
        envName: 'KRESUS_PYTHON_EXEC',
        configPath: 'config.kresus.python_exec',
        defaultVal: 'python2',
        processPath: 'pythonExec',
        doc: `The executable version of Python that is going to get used when
        interacting with Python scripts. This can be python, python2 or
        python3.`
    },

    {
        envName: 'KRESUS_URL_PREFIX',
        configPath: 'config.kresus.url_prefix',
        defaultVal: '',
        processPath: 'urlPrefix',
        cleanupAction: prefix => path.posix.resolve('/', prefix),
        doc: `The directory prefix in the URL, if Kresus is to be served from a
        subdirectory. For instance, if your website is hosted at example.com
        and the url prefix is "money", then Kresus will be reachable at
        example.com/money. By default, it's '', meaning that Kresus has its own
        subdomain.`,
        docExample: '/money'
    },

    {
        envName: 'KRESUS_SALT',
        configPath: 'config.kresus.salt',
        defaultVal: null,
        processPath: 'salt',
        cleanupAction: val => {
            if (val !== null && val.length < 16) {
                throw new Error('Please provide a salt value with at least 16 characters.');
            }
            return val;
        },
        doc: `A salt value used in encryption algorithms (used for instance to
            encrypt/decrypt exports). It should be a random string value with
            at least 16 characters if you decide to provide it.`,
        docExample: 'gj4J89fkjf4h29aDi0f{}fu4389sejk`9osk`'
    },

    {
        envName: 'KRESUS_FORCE_DEMO_MODE',
        configPath: 'config.kresus.force_demo_mode',
        defaultVal: 'false',
        processPath: 'forceDemoMode',
        cleanupAction: val => {
            return val === 'true';
        },
        doc: `Set this to true if you want to use this instance only in demo
        mode, and to never allow users to link their personal accounts.

        WARNING! Switching this on and off may trigger data loss. Note that it
        is still possible to try Kresus in demo mode, even if this is not set
        to true. Setting this to true will *force* demo mode, and prevent users
        from leaving this mode.`,
        docExample: 'true'
    },

    {
        envName: 'KRESUS_WEBOOB_DIR',
        configPath: 'config.weboob.srcdir',
        defaultVal: null,
        processPath: 'weboobDir',
        doc: `The directory in which Weboob core is stored. If empty, indicates
        that weboob is already in the PYTHON_PATH (e.g. installed at the global
        level)`,
        docExample: '/home/ben/code/weboob'
    },

    {
        envName: 'KRESUS_WEBOOB_SOURCES_LIST',
        configPath: 'config.weboob.sources_list',
        defaultVal: null,
        processPath: 'weboobSourcesList',
        doc: `Path to a file containing a valid Weboob's source list directory.
        If empty (the default), indicates that Kresus will generate its own
        source list file and will store it in
        DATA_DIR/weboob-data/sources.list.`,
        docExample: '/home/ben/code/weboob/sources.list'
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
        },
        doc: `The transport method you want to use. Can be either:
            * "sendmail": relies on sendmail executable to be available on your
            system and only sendmail-specific parameters are used,

            * "smtp": you should provide proper SMTP credentials to use, in the
            dedicated configuration entries.

            If empty, no emails will be sent by Kresus.`,
        docExample: 'smtp'
    },

    {
        envName: 'KRESUS_EMAIL_SENDMAIL_BIN',
        configPath: 'config.email.sendmail_bin',
        defaultVal: null,
        processPath: 'emailSendmailBin',
        doc: `The path to the sendmail executable to use. If empty, indicates
        that the default sendmail executable will be used.`,
        docExample: '/usr/bin/sendmail'
    },

    {
        envName: 'KRESUS_EMAIL_FROM',
        configPath: 'config.email.from',
        defaultVal: null,
        processPath: 'emailFrom',
        doc: `The email address from which email alerts will be sent. Make sure
        that your domain DNS is correctly configured and that you've done
        what's needed to prevent email alerts from landing in the spam folder.`,
        docExample: 'kresus@domain.tld'
    },

    {
        envName: 'KRESUS_EMAIL_HOST',
        configPath: 'config.email.host',
        defaultVal: null,
        processPath: 'smtpHost',
        doc: 'The network address (ipv4, ipv6 or FQDN) of the SMTP server.',
        docExample: 'mail.domain.tld'
    },

    {
        envName: 'KRESUS_EMAIL_PORT',
        configPath: 'config.email.port',
        defaultVal: null,
        processPath: 'smtpPort',
        cleanupAction: val => {
            return val !== null ? checkPort(val, 'Invalid SMTP port provided') : null;
        },
        doc: `The port to which the SMTP server listens. Default values tend to
        be: 25 (server to server), or 587 (clients to server), or 465
        (nonstandard).`,
        docExample: '465'
    },

    {
        envName: 'KRESUS_EMAIL_USER',
        configPath: 'config.email.user',
        defaultVal: null,
        processPath: 'smtpUser',
        doc: `The username used during authentication to the SMTP server. If
        empty, indicates an anonymous connection will be used.`,
        docExample: 'login'
    },

    {
        envName: 'KRESUS_EMAIL_PASSWORD',
        configPath: 'config.email.password',
        defaultVal: null,
        processPath: 'smtpPassword',
        doc: `The password used during authentication to the SMTP server. If
        empty, indicates no password will be used.`,
        docExample: 'hunter2'
    },

    {
        envName: 'KRESUS_EMAIL_FORCE_TLS',
        configPath: 'config.email.force_tls',
        defaultVal: 'false',
        processPath: 'smtpForceTLS',
        cleanupAction: toBool,
        doc: `If set to true, will force using a TLS connection. By default,
        emails are sent with STARTTLS, i.e. using TLS if available.`
    },

    {
        envName: 'KRESUS_EMAIL_REJECT_UNAUTHORIZED_TLS',
        configPath: 'config.email.reject_unauthorized_tls',
        defaultVal: 'true',
        processPath: 'smtpRejectUnauthorizedTLS',
        cleanupAction: toBool,
        doc: 'If set to false, will allow self-signed TLS certificates.'
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
        },
        doc: `The path to the log file to use. If empty, defaults to kresus.log
        in datadir.`,
        docExample: '/var/log/kresus.log'
    }
];

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
    assert(typeof envName === 'string', 'envName must be a string');
    assert(
        typeof defaultVal === 'string' || defaultVal === null,
        'defaultVal must be a string or null'
    );
    assert(typeof configPath === 'string', 'configPath must be a string');
    assert(typeof processPath === 'string', 'processPath must be a string');

    let value = extractValue(config, { envName, defaultVal, configPath });
    if (typeof cleanupAction !== 'undefined') {
        assert(typeof cleanupAction === 'function');
        value = cleanupAction(value);
    }
    process.kresus[processPath] = value;
}

function comment(x) {
    return `${x
        .split('\n')
        .map(string => `; ${string.trim()}`)
        .join('\n')}\n`;
}

export function generate() {
    let map = new Map();
    let keys = []; // Remember order of keys.

    for (let opt of OPTIONS) {
        let { configPath } = opt;
        configPath = configPath.split('.');
        configPath.shift(); // remove 'config';
        let sectionName = configPath.shift();
        let optionName = configPath.shift();

        if (!map.has(sectionName)) {
            keys.push(sectionName);
            map.set(sectionName, []);
        }
        let section = map.get(sectionName);
        section.push({ name: optionName, opt });
        map.set(sectionName, section);
    }

    let preamble = comment(`Hi there! This is the configuration file for
        Kresus. Please make sure to read all the options before setting up
        Kresus for the first time.
`);

    let ret = preamble;

    for (let key of keys) {
        ret += `[${key}]

`;
        for (let { name, opt } of map.get(key)) {
            // Print the doc.
            ret += comment(opt.doc);

            // Print the default value.
            if (opt.defaultVal !== null) {
                let defaultVal = opt.defaultDoc || opt.defaultVal;
                ret += comment(`Can be removed; defaults to "${defaultVal}".`);
            }
            ret += comment(`Overriden by the ${opt.envName} environment variable, if it's set.`);

            // Print an example value.
            if (!opt.docExample && opt.defaultVal === null) {
                throw new Error('missing documentation example or default value');
            }
            let exampleValue = opt.docExample ? opt.docExample : opt.defaultVal;
            ret += comment(`Example:
            ${name}=${exampleValue}`);

            // Print the actual value.
            ret += `${name}=

`;
        }
    }

    return ret;
}

export function apply(config = {}) {
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

    assert(
        typeof config === 'object' && config !== null,
        'a configuration object, even empty, must be provided'
    );
    for (let option of OPTIONS) {
        processOption(config, option);
    }

    log.info('Running Kresus with the following parameters:');
    log.info(`NODE_ENV = ${process.env.NODE_ENV}`);
    log.info(`KRESUS_LOGIN = ${process.kresus.user.login}`);
    for (let option of OPTIONS) {
        let displayed = ['password', 'salt'].includes(option.processPath.toLowerCase())
            ? '(hidden)'
            : process.kresus[option.processPath];
        log.info(`${option.envName} = ${displayed}`);
    }
}
