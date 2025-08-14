import fs from 'fs';
import ini from 'ini';
import ospath from 'ospath';
import path from 'path';
import should from 'should';

import { apply as applyConfig } from '../../server/config';

function checkHasConfigKeys(env) {
    let configKeys = [
        'dataDir',
        'user',
        'providedUserId',
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

    env.should.have.keys(...configKeys);

    // Note: Checking the length as well so that test will fail if someone adds
    // new config options and does not update the tests.
    Object.keys(env).should.have.length(configKeys.length);
}

function checkCommonDefaultConfig(env) {
    env.port.should.equal(9876);
    env.host.should.equal('127.0.0.1');
    env.pythonExec.should.equal('python3');
    should.not.exist(env.salt);
    env.forceDemoMode.should.equal(false);
    should.not.exist(env.woobDir);
    should.not.exist(env.woobSourcesList);
    should.not.exist(env.emailTransport);
    should.not.exist(env.emailSendmailBin);
    should.not.exist(env.emailFrom);
    should.not.exist(env.smtpHost);
    should.not.exist(env.smtpPort);
    should.not.exist(env.smtpUser);
    should.not.exist(env.smtpPassword);
    should.not.exist(env.appriseApiBaseUrl);
    env.smtpForceTLS.should.equal(false);
    env.smtpRejectUnauthorizedTLS.should.equal(true);
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

            process.kresus.port.should.equal(4242);
            process.kresus.host.should.equal('127.0.0.1');
            process.kresus.pythonExec.should.equal('python3');
            should.not.exist(process.kresus.woobDir);
            should.not.exist(process.kresus.woobSourcesList);
            should.not.exist(process.kresus.emailTransport);
            should.not.exist(process.kresus.emailSendmailBin);
            should.not.exist(process.kresus.emailFrom);
            should.not.exist(process.kresus.smtpHost);
            should.not.exist(process.kresus.smtpPort);
            should.not.exist(process.kresus.smtpUser);
            should.not.exist(process.kresus.smtpPassword);
            should.not.exist(process.kresus.appriseApiBaseUrl);
            process.kresus.smtpForceTLS.should.equal(false);
            process.kresus.smtpRejectUnauthorizedTLS.should.equal(true);
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

            process.kresus.dataDir.should.equal(path.join(ospath.home(), '.kresus'));
            process.kresus.logFilePath.should.equal(
                path.join(ospath.home(), '.kresus', 'kresus.log')
            );
            process.kresus.urlPrefix.should.equal('/');
        });
    });

    describe('Test overloading configuration', () => {
        it('shall return correct overloaded config', () => {
            process.kresus = {};
            let config = {
                kresus: {
                    datadir: 'dataDir',
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

            process.kresus.port.should.equal(8080);
            process.kresus.host.should.equal('0.0.0.0');
            process.kresus.pythonExec.should.equal('pythonExec');
            process.kresus.salt.should.equal('1234567890123456');
            process.kresus.woobDir.should.equal('woobDir');
            process.kresus.woobSourcesList.should.equal('woobSourcesList');
            process.kresus.emailTransport.should.equal('smtp');
            process.kresus.emailSendmailBin.should.equal('sendmailBin');
            process.kresus.emailFrom.should.equal('emailFrom');
            process.kresus.smtpHost.should.equal('smtpHost');
            process.kresus.smtpPort.should.equal(4242);
            process.kresus.smtpUser.should.equal('smtpUser');
            process.kresus.smtpPassword.should.equal('smtpPassword');
            process.kresus.smtpForceTLS.should.equal(true);
            process.kresus.smtpRejectUnauthorizedTLS.should.equal(false);
            process.kresus.appriseApiBaseUrl.should.equal('appriseApiBaseUrl');

            process.kresus.dbType.should.equal('postgres');
            process.kresus.dbPort.should.equal(1234);
            process.kresus.dbHost.should.equal('dbhost');
            process.kresus.dbName.should.equal('dbname');
            process.kresus.dbUsername.should.equal('dbuser');
            process.kresus.dbPassword.should.equal('dbpassword');
            should.equal(process.kresus.sqlitePath, null);
            process.kresus.dbLog.should.equal('error');

            process.kresus.dataDir.should.equal('dataDir');
            process.kresus.urlPrefix.should.equal('/foobar');

            process.kresus.logFilePath.should.equal('/tmp/kresus.log');
        });

        it('shall let environment variables define config keys', () => {
            process.kresus = {};

            let previousEnv = process.env;
            process.env = {
                NODE_ENV: 'test',
                PORT: '8080',
                HOST: '0.0.0.0',
                KRESUS_DIR: 'dataDir',
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

            process.kresus.port.should.equal(8080);
            process.kresus.host.should.equal('0.0.0.0');
            process.kresus.pythonExec.should.equal('pythonExec');
            process.kresus.salt.should.equal('1234567890123456');
            process.kresus.woobDir.should.equal('woobDir');
            process.kresus.woobSourcesList.should.equal('woobSourcesList');
            process.kresus.emailTransport.should.equal('smtp');
            process.kresus.emailSendmailBin.should.equal('sendmailBin');
            process.kresus.emailFrom.should.equal('emailFrom');
            process.kresus.smtpHost.should.equal('smtpHost');
            process.kresus.smtpPort.should.equal(4242);
            process.kresus.smtpUser.should.equal('smtpUser');
            process.kresus.smtpPassword.should.equal('smtpPassword');
            process.kresus.smtpForceTLS.should.equal(true);
            process.kresus.smtpRejectUnauthorizedTLS.should.equal(false);
            process.kresus.appriseApiBaseUrl.should.equal('appriseApiBaseUrl');

            process.kresus.dbType.should.equal('sqlite');
            process.kresus.sqlitePath.should.equal('/tmp/kresus-tests-env-path.sqlite');

            process.kresus.dataDir.should.equal('dataDir');
            process.kresus.urlPrefix.should.equal('/foobar');

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

            process.kresus.port.should.equal(8080);
            process.kresus.host.should.equal('0.0.0.0');
            process.kresus.pythonExec.should.equal('pythonExec');
            process.kresus.salt.should.equal('1234567890123456');
            process.kresus.woobDir.should.equal('woobDir');
            process.kresus.woobSourcesList.should.equal('woobSourcesList');
            process.kresus.emailTransport.should.equal('smtp');
            process.kresus.emailSendmailBin.should.equal('sendmailBin');
            process.kresus.emailFrom.should.equal('emailFrom');
            process.kresus.smtpHost.should.equal('smtpHost');
            process.kresus.smtpPort.should.equal(4242);
            process.kresus.smtpUser.should.equal('smtpUser');
            process.kresus.smtpPassword.should.equal('smtpPassword');
            process.kresus.smtpForceTLS.should.equal(true);
            process.kresus.smtpRejectUnauthorizedTLS.should.equal(false);
            process.kresus.appriseApiBaseUrl.should.equal('appriseApiBaseUrl');

            process.kresus.dbType.should.equal('sqlite');
            process.kresus.sqlitePath.should.equal('/tmp/kresus-tests-env-path.sqlite');

            process.kresus.dataDir.should.equal('dataDir');
            process.kresus.urlPrefix.should.equal('/foobar');

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

            process.kresus.dbType.should.equal('postgres');
            process.kresus.dbHost.should.equal('localhost');
            process.kresus.dbPort.should.equal(5432);
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
            process.kresus.dbType.should.equal('postgres');
            process.kresus.dbHost.should.equal('localhost');
            process.kresus.dbPort.should.equal(5433);

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
            process.kresus.dbType.should.equal('postgres');
            process.kresus.dbHost.should.equal('172.17.0.1');
            process.kresus.dbPort.should.equal(5432);
        });

        it("doesn't set a default host and port for sqlite", () => {
            process.kresus = {};
            applyConfig({
                ...TEST_CONFIG,
            });

            process.kresus.dbType.should.equal('sqlite');
            should.not.exist(process.kresus.dbHost);
            should.not.exist(process.kresus.dbPort);
        });
    });

    describe('Test invalid configurations', () => {
        it('shall throw when no configuration is provided', () => {
            (function noConfig() {
                process.kresus = {};
                applyConfig();
            }).should.throw();

            (function emptyConfig() {
                process.kresus = {};
                applyConfig({});
            }).should.throw();
        });

        it('shall throw when an invalid database type is provided', () => {
            (function noDatabaseConfig() {
                process.kresus = {};
                applyConfig({
                    db: null,
                });
            }).should.throw();

            (function invalidDatabaseType() {
                process.kresus = {};
                applyConfig({
                    db: {
                        type: 'WHATEVER',
                    },
                });
            }).should.throw();
        });

        it('shall throw when Kresus port is out of range', () => {
            (function negativePort() {
                process.kresus = {};
                applyConfig({ kresus: { port: -1 }, ...TEST_CONFIG });
            }).should.throw();

            (function negativePortEnv() {
                process.kresus = {};
                process.env.PORT = '-1';
                applyConfig({ ...TEST_CONFIG });
            }).should.throw();
            delete process.env.PORT;

            (function zeroPort() {
                process.kresus = {};
                applyConfig({ kresus: { port: 0 }, ...TEST_CONFIG });
            }).should.throw();

            (function zeroPortEnv() {
                process.kresus = {};
                process.env.PORT = '0';
                applyConfig({ ...TEST_CONFIG });
            }).should.throw();
            delete process.env.PORT;

            (function overflowPort() {
                process.kresus = {};
                applyConfig({ kresus: { port: 65536 }, ...TEST_CONFIG });
            }).should.throw();

            (function stringPort() {
                process.kresus = {};
                applyConfig({ kresus: { port: 'ALO UI CER LE BUG' }, ...TEST_CONFIG });
            }).should.throw();
        });

        it('shall throw when SMTP port is out of range', () => {
            (function negativePort() {
                process.kresus = {};
                applyConfig({ email: { port: -1 }, ...TEST_CONFIG });
            }).should.throw();

            (function zeroPort() {
                process.kresus = {};
                applyConfig({ email: { port: 0 }, ...TEST_CONFIG });
            }).should.throw();

            (function overflowPort() {
                process.kresus = {};
                applyConfig({ email: { port: 65536 }, ...TEST_CONFIG });
            }).should.throw();

            (function stringPort() {
                process.kresus = {};
                applyConfig({ email: { port: 'COUCOU TU VEUX VOIR MON BUG' }, ...TEST_CONFIG });
            }).should.throw();
        });

        it('shall throw when email transport is not smtp or sendmail', () => {
            (function negativePort() {
                process.kresus = {};
                applyConfig({ email: { transport: 'foobar' }, ...TEST_CONFIG });
            }).should.throw();
        });

        it("shall throw when a non-empty salt doesn't fit the criteria", () => {
            // An empty string is not taken into account.
            process.kresus = {};
            applyConfig({ kresus: { salt: '' }, ...TEST_CONFIG });
            checkHasConfigKeys(process.kresus);
            checkCommonDefaultConfig(process.kresus);

            (function tooShort1() {
                process.kresus = {};
                applyConfig({ kresus: { salt: 'a' }, ...TEST_CONFIG });
            }).should.throw();

            (function tooShort15() {
                process.kresus = {};
                applyConfig({ kresus: { salt: '123456789012345' }, ...TEST_CONFIG });
            }).should.throw();
        });
    });
});
