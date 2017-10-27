import fs from 'fs';
import ini from 'ini';
import ospath from 'ospath';
import path from 'path';
import should from 'should';

import prepareProcessKresus from '../server/apply-config';

function checkHasConfigKeys(env) {
    let configKeys = [
        'standalone',
        'dataDir',
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
        'smtpRejectUnauthorizedTLS'
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

describe('Test application of configuration apply-config', function() {
    // Do not run the tests if KRESUS_WEBOOB_DIR is set, as it would override
    // configuration passed through config file.
    beforeEach(function() {
        if (process.env.KRESUS_WEBOOB_DIR) {
            this.skip();
        }
    });

    describe('Test default configuration', () => {
        it('shall return correct default config in standalone mode', () => {
            process.kresus = {};
            prepareProcessKresus(true, {});

            checkHasConfigKeys(process.kresus);
            checkCommonDefaultConfig(process.kresus);

            process.kresus.standalone.should.equal(true);
            process.kresus.dataDir.should.equal(path.join(ospath.home(), '.kresus'));
            process.kresus.urlPrefix.should.equal('/');
        });
    });

    describe('Test config.example.ini matches default configuration', () => {
        let configPath = path.join(path.dirname(fs.realpathSync(__filename)), '..', 'config.example.ini');
        let content = fs.readFileSync(configPath, { encoding: 'utf8' });
        let config = ini.parse(content);

        it('shall return correct default config in standalone mode', () => {
            process.kresus = {};
            prepareProcessKresus(true, config);

            checkHasConfigKeys(process.kresus);
            checkCommonDefaultConfig(process.kresus);

            process.kresus.standalone.should.equal(true);
            process.kresus.dataDir.should.equal(path.join(ospath.home(), '.kresus'));
            process.kresus.urlPrefix.should.equal('/');
        });
    });

    describe('Test overloading configuration', () => {
        it('shall return correct overloaded config in standalone mode', () => {
            process.kresus = {};
            let config = {
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
                }
            };
            prepareProcessKresus(true, config);

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

            process.kresus.standalone.should.equal(true);
            process.kresus.dataDir.should.equal('dataDir');
            process.kresus.urlPrefix.should.equal('/foobar');
        });
    });

    describe('Test invalid configurations', () => {
        it('shall throw when Kresus port is out of range', () => {
            (function negativePort(){
                process.kresus = {};
                prepareProcessKresus(true, { kresus: { port: -1 } });
            }).should.throw();

            (function zeroPort(){
                process.kresus = {};
                prepareProcessKresus(true, { kresus: { port: 0 } });
            }).should.throw();

            (function overflowPort(){
                process.kresus = {};
                prepareProcessKresus(true, { kresus: { port: 65536 } });
            }).should.throw();

            (function stringPort(){
                process.kresus = {};
                prepareProcessKresus(true, { kresus: { port: 'ALO UI CER LE BUG' } });
            }).should.throw();
        });

        it('shall throw when SMTP port is out of range', () => {
            (function negativePort(){
                process.kresus = {};
                prepareProcessKresus(true, { email: { port: -1 }});
            }).should.throw();

            (function zeroPort(){
                process.kresus = {};
                prepareProcessKresus(true, { email: { port: 0 }});
            }).should.throw();

            (function overflowPort(){
                process.kresus = {};
                prepareProcessKresus(true, { email: { port: 65536 }});
            }).should.throw();

            (function stringPort(){
                process.kresus = {};
                prepareProcessKresus(true, { email: { port: 'COUCOU TU VEUX VOIR MON BUG' }});
            }).should.throw();
        });

        it('shall throw when email transport is not smtp or sendmail', () => {
            (function negativePort(){
                process.kresus = {};
                prepareProcessKresus(true, { email: { transport: 'foobar' }});
            }).should.throw();
        });
    });
});
