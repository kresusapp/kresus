import path from 'path';
import ospath from 'ospath';

import { assert, makeLogger } from './helpers';
import { setLogFilePath } from './lib/logger';

type KresusConfig = { [key: string]: any };
type DependentCheck = (value: KresusConfig) => void;
type DependentDefaultVal = (value: KresusConfig) => string | null;
type DefaultVal = string | null | DependentDefaultVal;
type PendingDependentDefaultVal = {
    defaultVal: DependentDefaultVal;
    processPath: string;
};
type CleanupAction = (value: any | null, kresusConfig: KresusConfig) => any;

const log = makeLogger('apply-config');

function toBool(strOrBool: string | boolean): boolean {
    const ret = typeof strOrBool === 'string' ? strOrBool !== 'false' : strOrBool;
    assert(typeof ret === 'boolean', `toBool expects a string or boolean, ${typeof ret} given`);
    return ret;
}

function crash(msg: string): never {
    log.error(msg);
    throw new Error(msg);
}

function requiredForDbmsServers(processPath: string, what: string): DependentCheck {
    return (kresusConfig: KresusConfig) => {
        if (!kresusConfig[processPath]) {
            return;
        }
        switch (kresusConfig.dbType) {
            case 'postgres':
                return;
            case 'sqlite':
                return crash(
                    `${what} set, but not required for sqlite. Did you forget to set db.type
(KRESUS_DB_TYPE), or did you add a spurious configuration line in your config.ini?`
                );
            default:
                assert(false, 'unexpected database driver');
        }
    };
}

function checkPort(portStr: string, errorMessage: string): number {
    const port = Number.parseInt(portStr, 10);
    if (Number.isNaN(port) || port <= 0 || port > 65535) {
        log.error(`Invalid value for port: ${portStr}`);
        crash(errorMessage);
    }
    return port;
}

// Whenever you add any options here, make sure to also update the definition
// of KresusProcess in the `global.d.ts` file of the top directory!

const OPTIONS: {
    // Environment variable name.
    envName: string;
    // Path in config.ini's file, e.g. `config.kresus.datadir`.
    configPath: string;
    // Default value, or function implying a default value.
    defaultVal: DefaultVal;
    // Path in process.kresus; only top-level keys.
    processPath: string;
    // Documentation string.
    doc: string;
    // Default value for documentation purposes, if different from defaultVal.
    defaultDoc?: string;
    // Example of a valid value.
    docExample?: string;
    // Action to clean up/normalize the read string value.
    cleanupAction?: CleanupAction;
    // Check that might depend on other configuration values, and thus must be
    // executed once the whole configuration has been read.
    dependentCheck?: DependentCheck;
}[] = [
    {
        envName: 'KRESUS_DIR',
        configPath: 'config.kresus.datadir',
        defaultVal: path.join(ospath.home(), '.kresus'),
        processPath: 'dataDir',
        doc: `This is where Kresus stores additional data, as the latest bank
        scrapping modules. It should be writeable by the user which launches
        the Kresus executable.`,
        defaultDoc: 'HOME_DIR/.kresus',
        docExample: '/home/ben/.kresus',
    },

    {
        envName: 'KRESUS_USER_ID',
        configPath: 'config.kresus.userid',
        defaultVal: null,
        processPath: 'providedUserId',
        doc: `A user id obtained from using the "kresus create-user" command.
        This allows sharing a single database with several users. If your
        instance is only planned to host a single user, you can keep it
        disabled, and Kresus will know how to automatically generate a new
        user.`,
        cleanupAction: (value: any | null) => {
            if (typeof value === 'number' || value === null) {
                return value;
            }
            const asInteger = Number.parseInt(value, 10);
            if (Number.isNaN(asInteger)) {
                throw new Error(
                    'The userid must be an integer provided with the command "kresus create:user".'
                );
            }
            return asInteger;
        },
        docExample: '1',
    },

    {
        envName: 'PORT',
        configPath: 'config.kresus.port',
        defaultVal: '9876',
        processPath: 'port',
        cleanupAction: (uncheckedPort: any | null) => {
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
        configuration like Nginx, Caddy or Apache.`,
    },

    {
        envName: 'HOST',
        configPath: 'config.kresus.host',
        defaultVal: '127.0.0.1',
        processPath: 'host',
        doc: 'The host on which the Kresus server will listen to.',
    },

    {
        envName: 'KRESUS_PYTHON_EXEC',
        configPath: 'config.kresus.python_exec',
        defaultVal: 'python3',
        processPath: 'pythonExec',
        doc: `The executable version of Python that is going to get used when
        interacting with Python scripts. This can be python or python3.`,
    },

    {
        envName: 'KRESUS_URL_PREFIX',
        configPath: 'config.kresus.url_prefix',
        defaultVal: '',
        processPath: 'urlPrefix',
        cleanupAction: (prefix: any | null) => path.posix.resolve('/', prefix),
        doc: `The directory prefix in the URL, if Kresus is to be served from a
        subdirectory. For instance, if your website is hosted at example.com
        and the url prefix is "money", then Kresus will be reachable at
        example.com/money. By default, it's '', meaning that Kresus has its own
        subdomain.`,
        defaultDoc: '""',
        docExample: '/money',
    },

    {
        envName: 'KRESUS_SALT',
        configPath: 'config.kresus.salt',
        defaultVal: null,
        processPath: 'salt',
        cleanupAction: (val: any | null) => {
            if (val !== null && val.length < 16) {
                crash('Please provide a salt value with at least 16 characters.');
            }
            return val;
        },
        doc: `A salt value used in encryption algorithms (used for instance to
            encrypt/decrypt exports). It should be a random string value with
            at least 16 characters if you decide to provide it.`,
        docExample: 'gj4J89fkjf4h29aDi0f{}fu4389sejk`9osk`',
    },

    {
        envName: 'KRESUS_FORCE_DEMO_MODE',
        configPath: 'config.kresus.force_demo_mode',
        defaultVal: 'false',
        processPath: 'forceDemoMode',
        cleanupAction: (val: any | null) => {
            return val === 'true';
        },
        doc: `Set this to true if you want to use this instance only in demo
        mode, and to never allow users to link their personal accounts.

        WARNING! Switching this on and off may trigger data loss. Note that it
        is still possible to try Kresus in demo mode, even if this is not set
        to true. Setting this to true will *force* demo mode, and prevent users
        from leaving this mode.`,
        docExample: 'true',
    },

    {
        envName: 'KRESUS_WEBOOB_DIR',
        configPath: 'config.weboob.srcdir',
        defaultVal: null,
        processPath: 'weboobDir',
        doc: `The directory in which Weboob core is stored. If empty, indicates
        that weboob is already in the PYTHON_PATH (e.g. installed at the global
        level)`,
        docExample: '/home/ben/code/weboob',
    },

    {
        envName: 'KRESUS_WEBOOB_SOURCES_LIST',
        configPath: 'config.weboob.sources_list',
        defaultVal: null,
        processPath: 'weboobSourcesList',
        doc: `Path to a file containing a valid Weboob's source list directory.
        If empty (the default), indicates that Kresus will generate its own
        source list file and will store it in
        KRESUS_DIR/weboob-data/sources.list.`,
        docExample: '/home/ben/code/weboob/sources.list',
    },

    {
        envName: 'KRESUS_EMAIL_TRANSPORT',
        configPath: 'config.email.transport',
        defaultVal: null,
        processPath: 'emailTransport',
        cleanupAction: (val: any | null) => {
            if (val !== null && val !== 'smtp' && val !== 'sendmail') {
                crash('Invalid email transport provided.');
            }
            return val;
        },
        doc: `The transport method you want to use. Can be either:
            * "sendmail": relies on sendmail executable to be available on your
            system and only sendmail-specific parameters are used,

            * "smtp": you should provide proper SMTP credentials to use, in the
            dedicated configuration entries.

            If empty, no emails will be sent by Kresus.`,
        docExample: 'smtp',
    },

    {
        envName: 'KRESUS_EMAIL_SENDMAIL_BIN',
        configPath: 'config.email.sendmail_bin',
        defaultVal: null,
        processPath: 'emailSendmailBin',
        doc: `The path to the sendmail executable to use. If empty, indicates
        that the default sendmail executable will be used.`,
        docExample: '/usr/bin/sendmail',
    },

    {
        envName: 'KRESUS_EMAIL_FROM',
        configPath: 'config.email.from',
        defaultVal: null,
        processPath: 'emailFrom',
        doc: `The email address from which email alerts will be sent. Make sure
        that your domain DNS is correctly configured and that you've done
        what's needed to prevent email alerts from landing in the spam folder.`,
        docExample: 'kresus@domain.tld',
    },

    {
        envName: 'KRESUS_EMAIL_HOST',
        configPath: 'config.email.host',
        defaultVal: null,
        processPath: 'smtpHost',
        doc: 'The network address (ipv4, ipv6 or FQDN) of the SMTP server.',
        docExample: 'mail.domain.tld',
    },

    {
        envName: 'KRESUS_EMAIL_PORT',
        configPath: 'config.email.port',
        defaultVal: null,
        processPath: 'smtpPort',
        cleanupAction: (val: any | null) => {
            return val !== null ? checkPort(val, 'Invalid SMTP port provided') : null;
        },
        doc: `The port to which the SMTP server listens. Default values tend to
        be: 25 (server to server), or 587 (clients to server), or 465
        (nonstandard).`,
        docExample: '465',
    },

    {
        envName: 'KRESUS_EMAIL_USER',
        configPath: 'config.email.user',
        defaultVal: null,
        processPath: 'smtpUser',
        doc: `The username used during authentication to the SMTP server. If
        empty, indicates an anonymous connection will be used.`,
        docExample: 'login',
        dependentCheck: (kresusConfig: KresusConfig) => {
            if (kresusConfig.smtpUser !== null && kresusConfig.smtpPassword === null) {
                crash('missing password to use with the SMTP login');
            }
        },
    },

    {
        envName: 'KRESUS_EMAIL_PASSWORD',
        configPath: 'config.email.password',
        defaultVal: null,
        processPath: 'smtpPassword',
        doc: `The password used during authentication to the SMTP server. If
        empty, indicates no password will be used.`,
        docExample: 'hunter2',
        dependentCheck: (kresusConfig: KresusConfig) => {
            if (kresusConfig.smtpPassword !== null && kresusConfig.smtpUser === null) {
                crash('missing username to use with the SMTP password');
            }
        },
    },

    {
        envName: 'KRESUS_EMAIL_FORCE_TLS',
        configPath: 'config.email.force_tls',
        defaultVal: 'false',
        processPath: 'smtpForceTLS',
        cleanupAction: toBool,
        doc: `If set to true, will force using a TLS connection. By default,
        emails are sent with STARTTLS, i.e. using TLS if available.`,
    },

    {
        envName: 'KRESUS_EMAIL_REJECT_UNAUTHORIZED_TLS',
        configPath: 'config.email.reject_unauthorized_tls',
        defaultVal: 'true',
        processPath: 'smtpRejectUnauthorizedTLS',
        cleanupAction: toBool,
        doc: 'If set to false, will allow self-signed TLS certificates.',
    },

    {
        envName: 'KRESUS_APPRISE_API_BASE_URL',
        configPath: 'config.notifications.appriseApiBaseUrl',
        defaultVal: null,
        processPath: 'appriseApiBaseUrl',
        doc: `The baseurl from which apprise-api will be called for
        notifications to be sent.
        See https://github.com/caronc/apprise-api#installation for
        installation`,
        docExample: 'http://localhost:8000/',
    },

    {
        envName: 'KRESUS_AUTH',
        configPath: 'config.kresus.auth',
        defaultVal: null,
        processPath: 'basicAuth',
        cleanupAction: (val: string | null) => {
            if (val === null) {
                return null;
            }
            if (val.indexOf(':') === -1) {
                return null;
            }
            const _ = val.split(':');
            return { [_[0]]: _[1] };
        },
        doc: `If set to a string, will enable HTTP Basic Auth, by splitting the
        string on a colon, i.e. "<username>:<passwd>"`,
        docExample: 'foo:bar',
    },

    {
        envName: 'KRESUS_LOG_FILE',
        configPath: 'config.logs.log_file',
        defaultVal: null,
        processPath: 'logFilePath',
        cleanupAction: (maybePath: any | null, kresusConfig: KresusConfig) => {
            let checkedPath = maybePath;
            if (checkedPath === null) {
                checkedPath = path.join(kresusConfig.dataDir, 'kresus.log');
            }
            setLogFilePath(checkedPath);
            return checkedPath;
        },
        doc: `The path to the log file to use. If empty, defaults to kresus.log
        in datadir.`,
        docExample: '/var/log/kresus.log',
    },

    {
        envName: 'KRESUS_DB_TYPE',
        configPath: 'config.db.type',
        defaultVal: null,
        processPath: 'dbType',
        cleanupAction: (dbType: any | null) => {
            // Keep this switch in sync with server/models/index.ts!
            switch (dbType) {
                case 'sqlite':
                case 'postgres':
                    return dbType;
                default:
                    crash(`Unknown database type ${dbType}.`);
            }
        },

        dependentCheck: (kresusConfig: KresusConfig) => {
            switch (kresusConfig.dbType) {
                case 'sqlite':
                    if (!kresusConfig.sqlitePath) {
                        crash('missing path for the sqlite database');
                    }
                    break;
                case 'postgres': {
                    assert(kresusConfig.dbHost, 'host for the database connection must be defined');
                    assert(kresusConfig.dbPort, 'port for the database connection must be defined');
                    if (!kresusConfig.dbUsername) {
                        crash('missing username for the database connection');
                    }
                    if (!kresusConfig.dbPassword) {
                        crash('missing password for the database connection');
                    }
                    if (!kresusConfig.dbName) {
                        crash('missing database name for the database connection');
                    }
                    break;
                }
                default:
                    break;
            }
        },

        doc: `Database type supported by Kresus, to choose among:
- postgres
- sqlite

It must be set by the user. PostgreSQL is recommended and strongly supported; your experience with other databases might vary.

Note using sqlite is *strongly discouraged* because it can't properly handle certain kinds of database migrations. It is only intended for development purposes.`,
        docExample: 'sqlite',
    },

    {
        envName: 'KRESUS_DB_LOG',
        configPath: 'config.db.log',
        defaultVal: 'error',
        processPath: 'dbLog',
        cleanupAction: (value: any | null) => {
            switch (value) {
                case 'error':
                    break;
                case 'all':
                    // "all" in the ORM means a different thing; here we want
                    // both errors and all the queries, which is "true" for the ORM.
                    return true;
                case 'none':
                    return false;
                default:
                    throw new Error('Invalid db.log configuration value.');
            }
            return value;
        },
        doc: `Logging level for the SQL queries. Possible values are:

- all: will log every SQL query, including queries causing errors.
- error (default value): will only log SQL queries resulting in errors. This is useful for debugging purposes.
- none: nothing will be logged.`,
    },

    {
        envName: 'KRESUS_DB_SQLITE_PATH',
        configPath: 'config.db.sqlite_path',
        defaultVal: null,
        processPath: 'sqlitePath',
        doc: `Path to the sqlite database file. Make sure that the user running
Kresus has the right permissions to write into this file. Required only for
sqlite.`,
        docExample: '/tmp/dev.sqlite',
        dependentCheck: (kresusConfig: KresusConfig) => {
            if (kresusConfig.sqlitePath !== null && kresusConfig.dbType !== 'sqlite') {
                crash('database type not set to sqlite, but a sqlite path is provided.');
            }
        },
    },

    {
        envName: 'KRESUS_DB_HOST',
        configPath: 'config.db.host',
        defaultVal: (config: KresusConfig) => {
            if (config.dbType === 'postgres') {
                return 'localhost';
            }
            return null;
        },
        processPath: 'dbHost',
        doc: `Path to a directory containing a Unix socket to connect to the
database, or host address of the database server. Required for postgres.

If using a Unix socket, the socket file's name will be inferred from the
standard postgres name and the port number.`,
        dependentCheck: requiredForDbmsServers('dbHost', 'database host'),
        defaultDoc: 'localhost for postgres',
        docExample: 'localhost',
    },

    {
        envName: 'KRESUS_DB_PORT',
        configPath: 'config.db.port',
        defaultVal: (config: KresusConfig) => {
            if (config.dbType === 'postgres') {
                return '5432';
            }
            return null;
        },
        processPath: 'dbPort',
        doc: `Port of the database server. Required for postgres, even when
using a Unix socket (the port is used to compute the socket's file name).`,
        cleanupAction: (port: any | null) => {
            if (port !== null) {
                return checkPort(port, 'invalid database port');
            }
            return port;
        },
        dependentCheck: requiredForDbmsServers('dbPort', 'database port'),
        defaultDoc: '5432 for postgres',
        docExample: '5432',
    },

    {
        envName: 'KRESUS_DB_USERNAME',
        configPath: 'config.db.username',
        defaultVal: null,
        processPath: 'dbUsername',
        doc: 'Username to connect to the database server. Required for postgres.',
        docExample: 'benjamin',
        dependentCheck: requiredForDbmsServers('dbUsername', 'database username'),
    },

    {
        envName: 'KRESUS_DB_PASSWORD',
        configPath: 'config.db.password',
        defaultVal: null,
        processPath: 'dbPassword',
        doc: 'Password to connect to the database server. Required for postgres.',
        docExample: 'hunter2',
        dependentCheck: requiredForDbmsServers('dbPassword', 'database password'),
    },

    {
        envName: 'KRESUS_DB_NAME',
        configPath: 'config.db.name',
        defaultVal: 'kresus',
        processPath: 'dbName',
        doc: 'Database name to use. Required for postgres.',
        dependentCheck: (kresusConfig: KresusConfig) => {
            switch (kresusConfig.dbType) {
                case 'sqlite': // Allow sqlite to have a database name, even if it's unused.
                case 'postgres':
                    return;
                default:
                    crash('database name set but not required');
            }
        },
    },
];

function extractValue(
    config: Record<string, unknown>,
    dependentDefaultVal: PendingDependentDefaultVal[],
    {
        envName,
        defaultVal,
        configPath,
        processPath,
    }: { envName: string; defaultVal: any; configPath: string; processPath: string }
): string | null {
    let value = process.env[envName];

    if (typeof value === 'undefined') {
        const stack = configPath.split('.');
        stack.shift(); // Remove 'config'.
        let needle: any = config;
        while (stack.length && typeof needle !== 'undefined') {
            const shifted = stack.shift();
            assert(typeof shifted !== 'undefined', 'protected by above stack.length check');
            needle = needle[shifted];
        }
        value = needle;
    }

    if (typeof value === 'undefined' || (typeof value === 'string' && value.length === 0)) {
        if (typeof defaultVal === 'function') {
            dependentDefaultVal.push({ processPath, defaultVal });
        } else {
            value = defaultVal;
        }
    }

    return value === null ? null : `${value}`;
}

// Processes a single option object, given the `config` object defined by the
// user.
function readOption(
    kresusConfig: KresusConfig,
    dependentChecks: DependentCheck[],
    dependentDefaultVal: PendingDependentDefaultVal[],
    config: Record<string, unknown>,
    {
        envName,
        defaultVal,
        configPath,
        processPath,
        dependentCheck = null,
    }: {
        envName: string;
        defaultVal: DefaultVal;
        configPath: string;
        processPath: string;
        dependentCheck?: DependentCheck | null;
    }
) {
    const value = extractValue(config, dependentDefaultVal, {
        envName,
        defaultVal,
        configPath,
        processPath,
    });
    if (dependentCheck !== null) {
        dependentChecks.push(dependentCheck);
    }
    kresusConfig[processPath] = value;
}

function comment(x: string) {
    return `${x
        .split('\n')
        .map((str: string) => {
            let ret = ';';
            if (str.length) {
                ret += ` ${str.trim()}`;
            }
            return ret;
        })
        .join('\n')}\n`;
}

export function generate() {
    const map = new Map();
    const keys: string[] = []; // Remember order of keys.

    for (const opt of OPTIONS) {
        const { configPath } = opt;
        const configPathParts = configPath.split('.');
        configPathParts.shift(); // remove 'config';
        const sectionName = configPathParts.shift();
        const optionName = configPathParts.shift();

        assert(typeof sectionName !== 'undefined', 'sectionName must be defined');

        if (!map.has(sectionName)) {
            keys.push(sectionName);
            map.set(sectionName, []);
        }
        const section = map.get(sectionName);
        section.push({ name: optionName, opt });
        map.set(sectionName, section);
    }

    const preamble = comment(`Hi there! This is the configuration file for
        Kresus. Please make sure to read all the options before setting up
        Kresus for the first time.
`);

    let ret = preamble;

    for (const key of keys) {
        ret += `[${key}]

`;
        for (const { name, opt } of map.get(key)) {
            // Print the doc.
            ret += comment(opt.doc);

            // Print the default value. Note this won't print it for defaultVal
            // functions.
            if (typeof opt.defaultVal === 'string' || typeof opt.defaultDoc === 'string') {
                const defaultVal = opt.defaultDoc || opt.defaultVal;
                ret += comment(`Can be removed; defaults to ${defaultVal}.`);
            }
            ret += comment(`Overriden by the ${opt.envName} environment variable, if it's set.`);

            // Print an example value.
            if (!opt.docExample && typeof opt.defaultVal !== 'string') {
                throw new Error(
                    `missing documentation example or default value for ${opt.envName}`
                );
            }
            const exampleValue = opt.docExample ? opt.docExample : opt.defaultVal;
            ret += comment(`Example:
            ${name}=${exampleValue}`);

            // Print the actual value.
            ret += `${name}=

`;
        }
    }

    return ret;
}

export function apply(config: Record<string, unknown>) {
    // Assume development mode if NODE_ENV isn't set.
    if (typeof process.env.NODE_ENV === 'undefined' || process.env.NODE_ENV.length === 0) {
        process.env.NODE_ENV = 'development';
    }

    const kresusConfig: KresusConfig = {
        user: {
            // Put a fake value here until we get proper identity management.
            login: 'user',
        },
    };

    const dependentDefaultVal: PendingDependentDefaultVal[] = [];
    const dependentChecks: DependentCheck[] = [];

    // Read options from the config.ini file.
    for (const option of OPTIONS) {
        readOption(kresusConfig, dependentChecks, dependentDefaultVal, config, option);
    }

    // Apply deferred default value functions.
    for (const { defaultVal, processPath } of dependentDefaultVal) {
        kresusConfig[processPath] = defaultVal(kresusConfig);
    }

    // Apply cleanup actions, if they exist.
    for (const option of OPTIONS) {
        if (option.cleanupAction) {
            kresusConfig[option.processPath] = option.cleanupAction(
                kresusConfig[option.processPath],
                kresusConfig
            );
        }
    }

    // Run dependent checks.
    for (const check of dependentChecks) {
        check(kresusConfig);
    }

    log.info('Running Kresus with the following parameters:');
    log.info(`NODE_ENV = ${process.env.NODE_ENV}`);
    log.info(`KRESUS_LOGIN = ${kresusConfig.user.login}`);
    for (const option of OPTIONS) {
        const lowercasePath = option.processPath.toLowerCase();
        const displayed =
            lowercasePath.includes('password') || lowercasePath.includes('salt')
                ? '(hidden)'
                : kresusConfig[option.processPath];
        log.info(`${option.envName} = ${displayed}`);
    }

    process.kresus = kresusConfig as KresusProcess;
}
