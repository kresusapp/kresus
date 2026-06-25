import assert from 'node:assert';

import fs from 'fs';
import ini from 'ini';
import ospath from 'ospath';
import path from 'path';

import { apply as applyConfig } from '../../server/config';

function checkHasConfigKeys(env) {
    const configKeys = [
        'dataDir',
        'providedUserId',
        'userLoginHttpHeader',
        'defaultUser',
        'port',
        'host',
        'pythonExec',
        'urlPrefix',
        'salt',
        'basicAuth',
        'forceDemoMode',
        'woobDir',
        'woobSourcesList',
        'emailTransport',
        'emailSendmailBin',
        'emailFrom',
        'smtpHost',
        'smtpPort',
        'smtpUser',
        'smtpPassword',
        'smtpForceTLS',
        'smtpRejectUnauthorizedTLS',
        'appriseApiBaseUrl',
        'logFilePath',
        'dbType',
        'sqlitePath',
        'dbHost',
        'dbPort',
        'dbName',
        'dbUsername',
        'dbPassword',
        'dbLog',
    ];

    configKeys.forEach(key => assert.ok(key in env));

    // Note: Checking the length as well so that test will fail if someone adds
    // new config options and does not update the tests.
    assert.strictEqual(Object.keys(env).length, configKeys.length);
}

function checkCommonDefaultConfig(env) {
    assert.strictEqual(env.port, 9876);
    assert.strictEqual(env.host, '127.0.0.1');
    assert.strictEqual(env.pythonExec, 'python3');
    assert.ok(!env.salt);
    assert.strictEqual(env.forceDemoMode, false);
    assert.ok(!env.woobDir);
    assert.ok(!env.woobSourcesList);
    assert.ok(!env.emailTransport);
    assert.ok(!env.emailSendmailBin);
    assert.ok(!env.emailFrom);
    assert.ok(!env.smtpHost);
    assert.ok(!env.smtpPort);
    assert.ok(!env.smtpUser);
    assert.ok(!env.smtpPassword);
    assert.ok(!env.appriseApiBaseUrl);
    assert.strictEqual(env.smtpForceTLS, false);
    assert.strictEqual(env.smtpRejectUnauthorizedTLS, true);
}

const TEST_CONFIG = {
    db: {
        type: 'sqlite',
        sqlite_path: '/tmp/kresus-test-apply-config.sqlite',
    },
};

describe('Test the configuration file is correctly taken into account', () => {
    // If the path to Woob is set, it will override the configuration, we then skip these tests
    // if KRESUS_WOOB_DIR is set.
    beforeEach(function () {
        if (process.env.KRESUS_WOOB_DIR) {
            this.skip();
        }
    });
    describe('Test default configuration', () => {
        it('the minimal configuration should not throw', () => {
            process.kresus = {};
            applyConfig(TEST_CONFIG);

            process.kresus = {};
            const currentEnv = { ...process.env };
            process.env.KRESUS_DB_TYPE = TEST_CONFIG.db.type;
            process.env.KRESUS_DB_SQLITE_PATH = TEST_CONFIG.db.sqlite_path;
            applyConfig({});

            // Reset environment values.
            for (let envName in process.env) {
                if (currentEnv.hasOwnProperty(envName)) {
                    process.env[envName] = currentEnv[envName];
                } else {
                    delete process.env[envName];
                }
            }
        });

        it('a partially incomplete configuration should get the default keys', () => {
            process.kresus = {};

            // Empty configuration object.
            let config = { ...TEST_CONFIG };
            applyConfig(config);
            checkHasConfigKeys(process.kresus);
            checkCommonDefaultConfig(process.kresus);

            process.kresus = {};

            // Empty sub-config object.
            config = {
                email: {},
                ...TEST_CONFIG,
            };

            applyConfig(config);
            checkHasConfigKeys(process.kresus);
            checkCommonDefaultConfig(process.kresus);

            process.kresus = {};

            // Only one key is defined.
            config = {
                kresus: {
                    port: 4242,
                },
                ...TEST_CONFIG,
            };

            applyConfig(config);
            checkHasConfigKeys(process.kresus);

            assert.strictEqual(process.kresus.port, 4242);
            assert.strictEqual(process.kresus.host, '127.0.0.1');
            assert.strictEqual(process.kresus.pythonExec, 'python3');
            assert.ok(!process.kresus.woobDir);
            assert.ok(!process.kresus.woobSourcesList);
            assert.ok(!process.kresus.emailTransport);
            assert.ok(!process.kresus.emailSendmailBin);
            assert.ok(!process.kresus.emailFrom);
            assert.ok(!process.kresus.smtpHost);
            assert.ok(!process.kresus.smtpPort);
            assert.ok(!process.kresus.smtpUser);
            assert.ok(!process.kresus.smtpPassword);
            assert.ok(!process.kresus.appriseApiBaseUrl);
            assert.strictEqual(process.kresus.smtpForceTLS, false);
            assert.strictEqual(process.kresus.smtpRejectUnauthorizedTLS, true);
        });
    });

    describe('Test config.example.ini matches default configuration', () => {
        let configPath = path.join(
            path.dirname(fs.realpathSync(__filename)),
            '..',
            '..',
            'config.example.ini'
        );
        let content = fs.readFileSync(configPath, { encoding: 'utf8' });
        let config = { ...ini.parse(content), ...TEST_CONFIG };

        it('shall return correct default config', () => {
            process.kresus = { ...TEST_CONFIG };
            applyConfig(config);

            checkHasConfigKeys(process.kresus);
            checkCommonDefaultConfig(process.kresus);

            assert.strictEqual(process.kresus.dataDir, path.join(ospath.home(), '.kresus'));
            assert.strictEqual(
                process.kresus.logFilePath,
                path.join(ospath.home(), '.kresus', 'kresus.log')
            );
            assert.strictEqual(process.kresus.urlPrefix, '/');
        });
    });

    describe('Test overloading configuration', () => {
        it('shall return correct overloaded config', () => {
            process.kresus = {};
            let config = {
                kresus: {
                    datadir: 'dataDir',
                    userLoginHttpHeader: '',
                    host: '0.0.0.0',
                    port: 8080,
                    url_prefix: 'foobar',
                    python_exec: 'pythonExec',
                    salt: '1234567890123456',
                },
                woob: {
                    srcdir: 'woobDir',
                    sources_list: 'woobSourcesList',
                },
                email: {
                    transport: 'smtp',
                    sendmail_bin: 'sendmailBin',
                    from: 'emailFrom',
                    host: 'smtpHost',
                    port: 4242,
                    user: 'smtpUser',
                    password: 'smtpPassword',
                    force_tls: true,
                    reject_unauthorized_tls: false,
                },
                notifications: {
                    appriseApiBaseUrl: 'appriseApiBaseUrl',
                },
                logs: {
                    log_file: '/tmp/kresus.log',
                },
                db: {
                    type: 'postgres',
                    host: 'dbhost',
                    port: 1234,
                    name: 'dbname',
                    username: 'dbuser',
                    password: 'dbpassword',
                },
            };
            applyConfig(config);

            checkHasConfigKeys(process.kresus);

            assert.strictEqual(process.kresus.port, 8080);
            assert.strictEqual(process.kresus.host, '0.0.0.0');
            assert.strictEqual(process.kresus.pythonExec, 'pythonExec');
            assert.strictEqual(process.kresus.salt, '1234567890123456');
            assert.strictEqual(process.kresus.woobDir, 'woobDir');
            assert.strictEqual(process.kresus.woobSourcesList, 'woobSourcesList');
            assert.strictEqual(process.kresus.emailTransport, 'smtp');
            assert.strictEqual(process.kresus.emailSendmailBin, 'sendmailBin');
            assert.strictEqual(process.kresus.emailFrom, 'emailFrom');
            assert.strictEqual(process.kresus.smtpHost, 'smtpHost');
            assert.strictEqual(process.kresus.smtpPort, 4242);
            assert.strictEqual(process.kresus.smtpUser, 'smtpUser');
            assert.strictEqual(process.kresus.smtpPassword, 'smtpPassword');
            assert.strictEqual(process.kresus.smtpForceTLS, true);
            assert.strictEqual(process.kresus.smtpRejectUnauthorizedTLS, false);
            assert.strictEqual(process.kresus.appriseApiBaseUrl, 'appriseApiBaseUrl');

            assert.strictEqual(process.kresus.dbType, 'postgres');
            assert.strictEqual(process.kresus.dbPort, 1234);
            assert.strictEqual(process.kresus.dbHost, 'dbhost');
            assert.strictEqual(process.kresus.dbName, 'dbname');
            assert.strictEqual(process.kresus.dbUsername, 'dbuser');
            assert.strictEqual(process.kresus.dbPassword, 'dbpassword');
            assert.strictEqual(process.kresus.sqlitePath, null);
            assert.strictEqual(process.kresus.dbLog, 'error');

            assert.strictEqual(process.kresus.dataDir, 'dataDir');
            assert.strictEqual(process.kresus.userLoginHttpHeader, null);
            assert.strictEqual(process.kresus.urlPrefix, '/foobar');

            assert.strictEqual(process.kresus.logFilePath, '/tmp/kresus.log');
        });

        it('shall let environment variables define config keys', () => {
            process.kresus = {};

            let previousEnv = process.env;
            process.env = {
                NODE_ENV: 'test',
                PORT: '8080',
                HOST: '0.0.0.0',
                KRESUS_DIR: 'dataDir',
                KRESUS_USER_LOGIN_HTTP_HEADER: 'SOME_HTTP_HEADER',
                KRESUS_SALT: '1234567890123456',
                KRESUS_PYTHON_EXEC: 'pythonExec',
                KRESUS_URL_PREFIX: 'foobar',
                KRESUS_WOOB_DIR: 'woobDir',
                KRESUS_WOOB_SOURCES_LIST: 'woobSourcesList',
                KRESUS_EMAIL_TRANSPORT: 'smtp',
                KRESUS_EMAIL_SENDMAIL_BIN: 'sendmailBin',
                KRESUS_EMAIL_FROM: 'emailFrom',
                KRESUS_EMAIL_HOST: 'smtpHost',
                KRESUS_EMAIL_PORT: '4242',
                KRESUS_EMAIL_USER: 'smtpUser',
                KRESUS_EMAIL_PASSWORD: 'smtpPassword',
                KRESUS_EMAIL_FORCE_TLS: 'true',
                KRESUS_EMAIL_REJECT_UNAUTHORIZED_TLS: 'false',
                KRESUS_APPRISE_API_BASE_URL: 'appriseApiBaseUrl',
                KRESUS_DB_TYPE: 'sqlite',
                KRESUS_DB_SQLITE_PATH: '/tmp/kresus-tests-env-path.sqlite',
            };

            applyConfig({});

            checkHasConfigKeys(process.kresus);

            assert.strictEqual(process.kresus.port, 8080);
            assert.strictEqual(process.kresus.host, '0.0.0.0');
            assert.strictEqual(process.kresus.pythonExec, 'pythonExec');
            assert.strictEqual(process.kresus.salt, '1234567890123456');
            assert.strictEqual(process.kresus.woobDir, 'woobDir');
            assert.strictEqual(process.kresus.woobSourcesList, 'woobSourcesList');
            assert.strictEqual(process.kresus.emailTransport, 'smtp');
            assert.strictEqual(process.kresus.emailSendmailBin, 'sendmailBin');
            assert.strictEqual(process.kresus.emailFrom, 'emailFrom');
            assert.strictEqual(process.kresus.smtpHost, 'smtpHost');
            assert.strictEqual(process.kresus.smtpPort, 4242);
            assert.strictEqual(process.kresus.smtpUser, 'smtpUser');
            assert.strictEqual(process.kresus.smtpPassword, 'smtpPassword');
            assert.strictEqual(process.kresus.smtpForceTLS, true);
            assert.strictEqual(process.kresus.smtpRejectUnauthorizedTLS, false);
            assert.strictEqual(process.kresus.appriseApiBaseUrl, 'appriseApiBaseUrl');

            assert.strictEqual(process.kresus.dbType, 'sqlite');
            assert.strictEqual(process.kresus.sqlitePath, '/tmp/kresus-tests-env-path.sqlite');

            assert.strictEqual(process.kresus.dataDir, 'dataDir');
            assert.strictEqual(process.kresus.userLoginHttpHeader, 'SOME_HTTP_HEADER');
            assert.strictEqual(process.kresus.urlPrefix, '/foobar');

            process.env = previousEnv;
        });

        it('shall let environment variables override configuration', () => {
            process.kresus = {};

            let previousEnv = process.env;
            process.env = {
                NODE_ENV: 'test',
                PORT: '8080',
                HOST: '0.0.0.0',
                KRESUS_DIR: 'dataDir',
                KRESUS_USER_LOGIN_HTTP_HEADER: 'SOME_HTTP_HEADER',
                KRESUS_SALT: '1234567890123456',
                KRESUS_PYTHON_EXEC: 'pythonExec',
                KRESUS_URL_PREFIX: 'foobar',
                KRESUS_WOOB_DIR: 'woobDir',
                KRESUS_WOOB_SOURCES_LIST: 'woobSourcesList',
                KRESUS_EMAIL_TRANSPORT: 'smtp',
                KRESUS_EMAIL_SENDMAIL_BIN: 'sendmailBin',
                KRESUS_EMAIL_FROM: 'emailFrom',
                KRESUS_EMAIL_HOST: 'smtpHost',
                KRESUS_EMAIL_PORT: '4242',
                KRESUS_EMAIL_USER: 'smtpUser',
                KRESUS_EMAIL_PASSWORD: 'smtpPassword',
                KRESUS_EMAIL_FORCE_TLS: 'true',
                KRESUS_EMAIL_REJECT_UNAUTHORIZED_TLS: 'false',
                KRESUS_APPRISE_API_BASE_URL: 'appriseApiBaseUrl',
                KRESUS_DB_TYPE: 'sqlite',
                KRESUS_DB_SQLITE_PATH: '/tmp/kresus-tests-env-path.sqlite',
            };

            let config = {
                kresus: {
                    datadir: 'dites',
                    userLoginHttpHeader: 'bien',
                    host: 'non',
                    port: 'à',
                    url_prefix: 'la',
                    python_exec: 'drogue',
                    salt: "mhhh la drogue c'est mal, m'voyez ?",
                },
                woob: {
                    srcdir: 'salut',
                    sources_list: "c'est cool",
                },
                email: {
                    transport: 'il',
                    sendmail_bin: 'était',
                    from: 'une',
                    host: 'fois',
                    port: 'un',
                    user: 'bonhomme',
                    password: 'de',
                    force_tls: 'foi',
                    reject_unauthorized_tls: '.',
                },
                db: {
                    type: 'postgres',
                },
            };

            applyConfig(config);

            checkHasConfigKeys(process.kresus);

            assert.strictEqual(process.kresus.port, 8080);
            assert.strictEqual(process.kresus.host, '0.0.0.0');
            assert.strictEqual(process.kresus.pythonExec, 'pythonExec');
            assert.strictEqual(process.kresus.salt, '1234567890123456');
            assert.strictEqual(process.kresus.woobDir, 'woobDir');
            assert.strictEqual(process.kresus.woobSourcesList, 'woobSourcesList');
            assert.strictEqual(process.kresus.emailTransport, 'smtp');
            assert.strictEqual(process.kresus.emailSendmailBin, 'sendmailBin');
            assert.strictEqual(process.kresus.emailFrom, 'emailFrom');
            assert.strictEqual(process.kresus.smtpHost, 'smtpHost');
            assert.strictEqual(process.kresus.smtpPort, 4242);
            assert.strictEqual(process.kresus.smtpUser, 'smtpUser');
            assert.strictEqual(process.kresus.smtpPassword, 'smtpPassword');
            assert.strictEqual(process.kresus.smtpForceTLS, true);
            assert.strictEqual(process.kresus.smtpRejectUnauthorizedTLS, false);
            assert.strictEqual(process.kresus.appriseApiBaseUrl, 'appriseApiBaseUrl');

            assert.strictEqual(process.kresus.dbType, 'sqlite');
            assert.strictEqual(process.kresus.sqlitePath, '/tmp/kresus-tests-env-path.sqlite');

            assert.strictEqual(process.kresus.dataDir, 'dataDir');
            assert.strictEqual(process.kresus.userLoginHttpHeader, 'SOME_HTTP_HEADER');
            assert.strictEqual(process.kresus.urlPrefix, '/foobar');

            process.env = previousEnv;
        });
    });

    describe('Test contextual default values', () => {
        it('sets a default host and port for postgres', () => {
            process.kresus = {};
            applyConfig({
                db: {
                    type: 'postgres',
                    name: 'postgres',
                    username: 'root',
                    password: 'iamroot',
                },
            });

            assert.strictEqual(process.kresus.dbType, 'postgres');
            assert.strictEqual(process.kresus.dbHost, 'localhost');
            assert.strictEqual(process.kresus.dbPort, 5432);
        });

        it("doesn't overload values with default values for postgres", () => {
            process.kresus = {};
            applyConfig({
                db: {
                    type: 'postgres',
                    name: 'postgres',
                    username: 'root',
                    password: 'jesappelleroot',
                    port: '5433',
                },
            });
            assert.strictEqual(process.kresus.dbType, 'postgres');
            assert.strictEqual(process.kresus.dbHost, 'localhost');
            assert.strictEqual(process.kresus.dbPort, 5433);

            process.kresus = {};
            applyConfig({
                db: {
                    type: 'postgres',
                    name: 'postgres',
                    username: 'root',
                    password: 'jesappelleroot',
                    host: '172.17.0.1',
                },
            });
            assert.strictEqual(process.kresus.dbType, 'postgres');
            assert.strictEqual(process.kresus.dbHost, '172.17.0.1');
            assert.strictEqual(process.kresus.dbPort, 5432);
        });

        it("doesn't set a default host and port for sqlite", () => {
            process.kresus = {};
            applyConfig({
                ...TEST_CONFIG,
            });

            assert.strictEqual(process.kresus.dbType, 'sqlite');
            assert.ok(!process.kresus.dbHost);
            assert.ok(!process.kresus.dbPort);
        });
    });

    describe('Test invalid configurations', () => {
        it('shall throw when no configuration is provided', () => {
            assert.throws(() => {
                process.kresus = {};
                applyConfig();
            });

            assert.throws(() => {
                process.kresus = {};
                applyConfig({});
            });
        });

        it('shall throw when an invalid database type is provided', () => {
            assert.throws(() => {
                process.kresus = {};
                applyConfig({
                    db: null,
                });
            });

            assert.throws(() => {
                process.kresus = {};
                applyConfig({
                    db: {
                        type: 'WHATEVER',
                    },
                });
            });
        });

        it('shall throw when Kresus port is out of range', () => {
            assert.throws(() => {
                process.kresus = {};
                applyConfig({ kresus: { port: -1 }, ...TEST_CONFIG });
            });

            assert.throws(() => {
                process.kresus = {};
                process.env.PORT = '-1';
                applyConfig({ ...TEST_CONFIG });
            });
            delete process.env.PORT;

            assert.throws(() => {
                process.kresus = {};
                applyConfig({ kresus: { port: 0 }, ...TEST_CONFIG });
            });

            assert.throws(() => {
                process.kresus = {};
                process.env.PORT = '0';
                applyConfig({ ...TEST_CONFIG });
            });
            delete process.env.PORT;

            assert.throws(() => {
                process.kresus = {};
                applyConfig({ kresus: { port: 65536 }, ...TEST_CONFIG });
            });

            assert.throws(() => {
                process.kresus = {};
                applyConfig({ kresus: { port: 'ALO UI CER LE BUG' }, ...TEST_CONFIG });
            });
        });

        it('shall throw when SMTP port is out of range', () => {
            assert.throws(() => {
                process.kresus = {};
                applyConfig({ email: { port: -1 }, ...TEST_CONFIG });
            });

            assert.throws(() => {
                process.kresus = {};
                applyConfig({ email: { port: 0 }, ...TEST_CONFIG });
            });

            assert.throws(() => {
                process.kresus = {};
                applyConfig({ email: { port: 65536 }, ...TEST_CONFIG });
            });

            assert.throws(() => {
                process.kresus = {};
                applyConfig({ email: { port: 'COUCOU TU VEUX VOIR MON BUG' }, ...TEST_CONFIG });
            });
        });

        it('shall throw when email transport is not smtp or sendmail', () => {
            assert.throws(() => {
                process.kresus = {};
                applyConfig({ email: { transport: 'foobar' }, ...TEST_CONFIG });
            });
        });

        it("shall throw when a non-empty salt doesn't fit the criteria", () => {
            // An empty string is not taken into account.
            process.kresus = {};
            applyConfig({ kresus: { salt: '' }, ...TEST_CONFIG });
            checkHasConfigKeys(process.kresus);
            checkCommonDefaultConfig(process.kresus);

            assert.throws(() => {
                process.kresus = {};
                applyConfig({ kresus: { salt: 'a' }, ...TEST_CONFIG });
            });

            assert.throws(() => {
                process.kresus = {};
                applyConfig({ kresus: { salt: '123456789012345' }, ...TEST_CONFIG });
            });
        });
    });
});
