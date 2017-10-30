import fs from 'fs';
import ini from 'ini';
import ospath from 'ospath';
import path from 'path';
import should from 'should';

import prepareProcessKresus from '../server/apply-config';


function checkConfigKeys(env) {
    env.should.have.keys(
        'standalone',
        'dataDir',
        'port',
        'host',
        'pythonExec',
        'urlPrefix',
        'weboobDir',
        'weboobSourcesList',
        'emailFrom',
        'smtpHost',
        'smtpPort',
        'smtpUser',
        'smtpPassword',
        'smtpForceTLS',
        'smtpRejectUnauthorizedTLS'
    );
}


function checkCommonDefaultConfig(env) {
    env.port.should.equal(9876);
    env.host.should.equal('127.0.0.1');
    env.pythonExec.should.equal('python2');
    env.weboobDir.should.equal('');
    env.weboobSourcesList.should.equal('');
    env.emailFrom.should.equal('');
    env.smtpHost.should.equal('');
    env.smtpPort.should.equal(0);
    env.smtpUser.should.equal('');
    env.smtpPassword.should.equal('');
    env.smtpForceTLS.should.equal(false);
    env.smtpRejectUnauthorizedTLS.should.equal(true);
}


describe('Test default configuration', () => {
    it('shall return correct default config in standalone mode', () => {
        prepareProcessKresus(true, {});

        checkConfigKeys(process.kresus);
        checkCommonDefaultConfig(process.kresus);

        process.kresus.standalone.should.equal(true);
        process.kresus.dataDir.should.equal(path.join(ospath.home(), '.kresus'));
        process.kresus.urlPrefix.should.equal('/');
    });

    it('shall return correct default config in cozy mode', () => {
        prepareProcessKresus(false, {});

        checkConfigKeys(process.kresus);
        checkCommonDefaultConfig(process.kresus);

        process.kresus.standalone.should.equal(false);
        process.kresus.dataDir.should.equal('');
        process.kresus.urlPrefix.should.equal('/apps/kresus');
    });
});


describe('Test config.example.ini matches default configuration', () => {
    let configPath = path.join(path.dirname(fs.realpathSync(__filename)), '..', 'config.example.ini');
    let content = fs.readFileSync(configPath, { encoding: 'utf8' });
    let config = ini.parse(content);

    it('shall return correct default config in standalone mode', () => {
        prepareProcessKresus(true, config);

        checkConfigKeys(process.kresus);
        checkCommonDefaultConfig(process.kresus);

        process.kresus.standalone.should.equal(true);
        process.kresus.dataDir.should.equal(path.join(ospath.home(), '.kresus'));
        process.kresus.urlPrefix.should.equal('/');
    });

    it('shall return correct default config in cozy mode', () => {
        prepareProcessKresus(false, config);

        checkConfigKeys(process.kresus);
        checkCommonDefaultConfig(process.kresus);

        process.kresus.standalone.should.equal(false);
        process.kresus.dataDir.should.equal('');
        process.kresus.urlPrefix.should.equal('/apps/kresus');
    });
});


describe('Test overloading configuration', () => {
    let config  = {
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

    checkConfigKeys(process.kresus);

    process.kresus.port.should.equal(8080);
    process.kresus.host.should.equal('0.0.0.0');
    process.kresus.pythonExec.should.equal('pythonExec');
    process.kresus.weboobDir.should.equal('weboobDir');
    process.kresus.weboobSourcesList.should.equal('weboobSourcesList');
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
