import ospath from 'ospath';
import path from 'path';
import should from 'should';

import prepareProcessKresus from '../server/apply-config';


function checkDefaultConfig(env) {
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

    env.port.should.equal(9876);
    env.host.should.equal('127.0.0.1');
    env.pythonExec.should.equal('python2');
    should.not.exist(env.weboobDir);
    should.not.exist(env.weboobSourcesList);
    env.emailFrom.should.equal('');
    should.not.exist(env.smtpHost);
    env.smtpPort.should.equal(0);
    should.not.exist(env.smtpUser);
    should.not.exist(env.smtpPassword);
    env.smtpForceTLS.should.equal(false);
    env.smtpRejectUnauthorizedTLS.should.equal(false);
}


describe('Test default configuration', () => {
    it('shall return correct default config in standalone mode', () => {
        prepareProcessKresus(true, {});

        checkDefaultConfig(process.kresus);

        process.kresus.standalone.should.equal(true);
        process.kresus.dataDir.should.equal(path.join(ospath.home(), '.kresus'));
        process.kresus.urlPrefix.should.equal('/');
    });

    it('shall return correct default config in cozy mode', () => {
        prepareProcessKresus(false, {});

        checkDefaultConfig(process.kresus);

        process.kresus.standalone.should.equal(false);
        should.not.exist(process.kresus.dataDir);
        process.kresus.urlPrefix.should.equal('/apps/kresus');
    });
});


describe('Test config.example.ini matches default configuration', () => {
});


describe('Test overloading configuration', () => {
});
