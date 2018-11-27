import fs from 'fs';
import ini from 'ini';
import ospath from 'ospath';
import path from 'path';
import should from 'should';

import { apply as prepareProcessKresus } from '../server/config';

function checkHasConfigKeys(env) {
    let configKeys = [
        'dataDir',
        'user',
        'port',
        'host',
        'pythonExec',
        'urlPrefix',
        'weboobDir',
        'weboobSourcesList',
        'emailTransport',
        'emailSendmailBin',
        'emailFrom',
        'smtpHost',
        'smtpPort',
        'smtpUser',
        'smtpPassword',
        'smtpForceTLS',
        'smtpRejectUnauthorizedTLS',
        'logFilePath'
    ];
    env.should.have.keys(...configKeys);

    // Note: Checking the length as well so that test will fail if someone adds
    // new config options and does not update the tests.
    Object.keys(env).should.have.length(configKeys.length);
}

function checkCommonDefaultConfig(env) {
    env.port.should.equal(9876);
    env.host.should.equal('127.0.0.1');
    env.pythonExec.should.equal('python2');
    should.not.exist(env.weboobDir);
    should.not.exist(env.weboobSourcesList);
    should.not.exist(env.emailTransport);
    should.not.exist(env.emailSendmailBin);
    should.not.exist(env.emailFrom);
    should.not.exist(env.smtpHost);
    should.not.exist(env.smtpPort);
    should.not.exist(env.smtpUser);
    should.not.exist(env.smtpPassword);
    env.smtpForceTLS.should.equal(false);
    env.smtpRejectUnauthorizedTLS.should.equal(true);
}

describe('Test the configuration file is correctly taken into consideration', () => {
    // If the path to Weboob is set, if will override the configuration, we then skip these tests
    // if KRESUS_WEBOOB_DIR is set.
    beforeEach(function() {
        if (process.env.KRESUS_WEBOOB_DIR) {
            this.skip();
        }
    });

    describe('Test default configuration', () => {
        it('shall return correct default config', () => {
            process.kresus = {};
            prepareProcessKresus({});

            checkHasConfigKeys(process.kresus);
            checkCommonDefaultConfig(process.kresus);

            process.kresus.dataDir.should.equal(path.join(ospath.home(), '.kresus'));
            process.kresus.urlPrefix.should.equal('/');
        });

        it('a partially incomplete configuration should get the default keys', () => {
            process.kresus = {};

            // Empty configuration object.
            let config = {};
            prepareProcessKresus(config);
            checkHasConfigKeys(process.kresus);
            checkCommonDefaultConfig(process.kresus);

            process.kresus = {};

            // Empty sub-config object.
            config = {
                email: {}
            };

            prepareProcessKresus(config);
            checkHasConfigKeys(process.kresus);
            checkCommonDefaultConfig(process.kresus);

            process.kresus = {};

            // Only one key is defined.
            config = {
                kresus: {
                    port: 4242
                }
            };

            prepareProcessKresus(config);
            checkHasConfigKeys(process.kresus);

            process.kresus.port.should.equal(4242);
            process.kresus.host.should.equal('127.0.0.1');
            process.kresus.pythonExec.should.equal('python2');
            should.not.exist(process.kresus.weboobDir);
            should.not.exist(process.kresus.weboobSourcesList);
            should.not.exist(process.kresus.emailTransport);
            should.not.exist(process.kresus.emailSendmailBin);
            should.not.exist(process.kresus.emailFrom);
            should.not.exist(process.kresus.smtpHost);
            should.not.exist(process.kresus.smtpPort);
            should.not.exist(process.kresus.smtpUser);
            should.not.exist(process.kresus.smtpPassword);
            process.kresus.smtpForceTLS.should.equal(false);
            process.kresus.smtpRejectUnauthorizedTLS.should.equal(true);
        });
    });

    describe('Test config.example.ini matches default configuration', () => {
        let configPath = path.join(
            path.dirname(fs.realpathSync(__filename)),
            '..',
            'config.example.ini'
        );
        let content = fs.readFileSync(configPath, { encoding: 'utf8' });
        let config = ini.parse(content);

        it('shall return correct default config', () => {
            process.kresus = {};
            prepareProcessKresus(config);

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
                    python_exec: 'pythonExec'
                },
                weboob: {
                    srcdir: 'weboobDir',
                    sources_list: 'weboobSourcesList'
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
                    reject_unauthorized_tls: false
                },
                logs: {
                    log_file: '/tmp/kresus.log'
                }
            };
            prepareProcessKresus(config);

            checkHasConfigKeys(process.kresus);

            process.kresus.port.should.equal(8080);
            process.kresus.host.should.equal('0.0.0.0');
            process.kresus.pythonExec.should.equal('pythonExec');
            process.kresus.weboobDir.should.equal('weboobDir');
            process.kresus.weboobSourcesList.should.equal('weboobSourcesList');
            process.kresus.emailTransport.should.equal('smtp');
            process.kresus.emailSendmailBin.should.equal('sendmailBin');
            process.kresus.emailFrom.should.equal('emailFrom');
            process.kresus.smtpHost.should.equal('smtpHost');
            process.kresus.smtpPort.should.equal(4242);
            process.kresus.smtpUser.should.equal('smtpUser');
            process.kresus.smtpPassword.should.equal('smtpPassword');
            process.kresus.smtpForceTLS.should.equal(true);
            process.kresus.smtpRejectUnauthorizedTLS.should.equal(false);

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
                KRESUS_PYTHON_EXEC: 'pythonExec',
                KRESUS_URL_PREFIX: 'foobar',
                KRESUS_WEBOOB_DIR: 'weboobDir',
                KRESUS_WEBOOB_SOURCES_LIST: 'weboobSourcesList',
                KRESUS_EMAIL_TRANSPORT: 'smtp',
                KRESUS_EMAIL_SENDMAIL_BIN: 'sendmailBin',
                KRESUS_EMAIL_FROM: 'emailFrom',
                KRESUS_EMAIL_HOST: 'smtpHost',
                KRESUS_EMAIL_PORT: '4242',
                KRESUS_EMAIL_USER: 'smtpUser',
                KRESUS_EMAIL_PASSWORD: 'smtpPassword',
                KRESUS_EMAIL_FORCE_TLS: 'true',
                KRESUS_EMAIL_REJECT_UNAUTHORIZED_TLS: 'false'
            };

            prepareProcessKresus();

            checkHasConfigKeys(process.kresus);

            process.kresus.port.should.equal(8080);
            process.kresus.host.should.equal('0.0.0.0');
            process.kresus.pythonExec.should.equal('pythonExec');
            process.kresus.weboobDir.should.equal('weboobDir');
            process.kresus.weboobSourcesList.should.equal('weboobSourcesList');
            process.kresus.emailTransport.should.equal('smtp');
            process.kresus.emailSendmailBin.should.equal('sendmailBin');
            process.kresus.emailFrom.should.equal('emailFrom');
            process.kresus.smtpHost.should.equal('smtpHost');
            process.kresus.smtpPort.should.equal(4242);
            process.kresus.smtpUser.should.equal('smtpUser');
            process.kresus.smtpPassword.should.equal('smtpPassword');
            process.kresus.smtpForceTLS.should.equal(true);
            process.kresus.smtpRejectUnauthorizedTLS.should.equal(false);

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
                KRESUS_PYTHON_EXEC: 'pythonExec',
                KRESUS_URL_PREFIX: 'foobar',
                KRESUS_WEBOOB_DIR: 'weboobDir',
                KRESUS_WEBOOB_SOURCES_LIST: 'weboobSourcesList',
                KRESUS_EMAIL_TRANSPORT: 'smtp',
                KRESUS_EMAIL_SENDMAIL_BIN: 'sendmailBin',
                KRESUS_EMAIL_FROM: 'emailFrom',
                KRESUS_EMAIL_HOST: 'smtpHost',
                KRESUS_EMAIL_PORT: '4242',
                KRESUS_EMAIL_USER: 'smtpUser',
                KRESUS_EMAIL_PASSWORD: 'smtpPassword',
                KRESUS_EMAIL_FORCE_TLS: 'true',
                KRESUS_EMAIL_REJECT_UNAUTHORIZED_TLS: 'false'
            };

            let config = {
                kresus: {
                    datadir: 'dites',
                    host: 'non',
                    port: 'à',
                    url_prefix: 'la',
                    python_exec: 'drogue'
                },
                weboob: {
                    srcdir: 'salut',
                    sources_list: "c'est cool"
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
                    reject_unauthorized_tls: '.'
                }
            };

            prepareProcessKresus(config);

            checkHasConfigKeys(process.kresus);

            process.kresus.port.should.equal(8080);
            process.kresus.host.should.equal('0.0.0.0');
            process.kresus.pythonExec.should.equal('pythonExec');
            process.kresus.weboobDir.should.equal('weboobDir');
            process.kresus.weboobSourcesList.should.equal('weboobSourcesList');
            process.kresus.emailTransport.should.equal('smtp');
            process.kresus.emailSendmailBin.should.equal('sendmailBin');
            process.kresus.emailFrom.should.equal('emailFrom');
            process.kresus.smtpHost.should.equal('smtpHost');
            process.kresus.smtpPort.should.equal(4242);
            process.kresus.smtpUser.should.equal('smtpUser');
            process.kresus.smtpPassword.should.equal('smtpPassword');
            process.kresus.smtpForceTLS.should.equal(true);
            process.kresus.smtpRejectUnauthorizedTLS.should.equal(false);

            process.kresus.dataDir.should.equal('dataDir');
            process.kresus.urlPrefix.should.equal('/foobar');

            process.env = previousEnv;
        });
    });

    describe('Test invalid configurations', () => {
        it('shall throw when Kresus port is out of range', () => {
            (function negativePort() {
                process.kresus = {};
                prepareProcessKresus({ kresus: { port: -1 } });
            }.should.throw());

            (function negativePortEnv() {
                process.kresus = {};
                process.env.PORT = '-1';
                prepareProcessKresus();
            }.should.throw());
            delete process.env.PORT;

            (function zeroPort() {
                process.kresus = {};
                prepareProcessKresus({ kresus: { port: 0 } });
            }.should.throw());

            (function zeroPortEnv() {
                process.kresus = {};
                process.env.PORT = '0';
                prepareProcessKresus();
            }.should.throw());
            delete process.env.PORT;

            (function overflowPort() {
                process.kresus = {};
                prepareProcessKresus({ kresus: { port: 65536 } });
            }.should.throw());

            (function stringPort() {
                process.kresus = {};
                prepareProcessKresus({ kresus: { port: 'ALO UI CER LE BUG' } });
            }.should.throw());
        });

        it('shall throw when SMTP port is out of range', () => {
            (function negativePort() {
                process.kresus = {};
                prepareProcessKresus({ email: { port: -1 } });
            }.should.throw());

            (function zeroPort() {
                process.kresus = {};
                prepareProcessKresus({ email: { port: 0 } });
            }.should.throw());

            (function overflowPort() {
                process.kresus = {};
                prepareProcessKresus({ email: { port: 65536 } });
            }.should.throw());

            (function stringPort() {
                process.kresus = {};
                prepareProcessKresus({ email: { port: 'COUCOU TU VEUX VOIR MON BUG' } });
            }.should.throw());
        });

        it('shall throw when email transport is not smtp or sendmail', () => {
            (function negativePort() {
                process.kresus = {};
                prepareProcessKresus({ email: { transport: 'foobar' } });
            }.should.throw());
        });
    });
});
