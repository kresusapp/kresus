/* eslint-disable space-before-function-paren */
import should from 'should';

import { KError } from '../server/helpers';
import {
    UNKNOWN_WEBOOB_MODULE,
    INTERNAL_ERROR,
    INVALID_PASSWORD,
    EXPIRED_PASSWORD,
    ACTION_NEEDED,
    WEBOOB_NOT_INSTALLED,
    INVALID_PARAMETERS,
    NO_PASSWORD
} from '../shared/errors.json';
import { callWeboob, SessionsMap } from '../server/lib/sources/weboob';
import { apply as prepareProcessKresus } from '../server/config';

async function callWeboobBefore(command, access) {
    return callWeboob(command, access)
        .then(success => {
            return { success };
        })
        .catch(error => {
            return { error };
        });
}

function checkError(result, errCode) {
    should.not.exist(result.success);
    should.exist(result.error);
    result.error.should.instanceof(KError);
    should.exist(result.error.errCode);
    result.error.errCode.should.equal(errCode);
}

async function makeDefectSituation(command) {
    describe(`Testing defect situations with "${command}" command`, () => {
        // Command shall be operations or accounts
        it(`call "${command}" command with unknown module should raise "UNKNOWN_WEBOOB_MODULE"`, async () => {
            let result = await callWeboobBefore(command, {
                bank: 'unknown',
                login: 'login',
                password: 'password'
            });

            checkError(result, UNKNOWN_WEBOOB_MODULE);
        });

        it(`call "${command}" command with inconsistent JSON customFields should raise "INVALID_PARAMETERS"`, async () => {
            let result = await callWeboobBefore(command, {
                bank: 'fakeweboobbank',
                customFields: 'p',
                login: 'login',
                password: 'password'
            });

            checkError(result, INVALID_PARAMETERS);
        });

        it(`call "${command}" command without password should raise "INTERNAL_ERROR"`, async () => {
            let result = await callWeboobBefore(command, {
                bank: 'fakeweboobbank',
                login: 'login',
                password: ''
            });

            checkError(result, NO_PASSWORD);
        });

        it(`call "${command}" command without login should raise "INVALID_PARAMETERS"`, async () => {
            let result = await callWeboobBefore(command, {
                bank: 'fakeweboobbank',
                password: 'password',
                login: ''
            });

            checkError(result, INVALID_PARAMETERS);
        });

        it(`call "${command}" command, with incomplete customFields should raise "INVALID_PARAMETERS"`, async () => {
            let result = await callWeboobBefore(command, {
                bank: 'fakeweboobbank',
                password: 'test',
                login: 'login',
                customFields: JSON.stringify([{ name: 'field' }])
            });

            checkError(result, INVALID_PARAMETERS);
        });

        it(`call "${command}" command, with incomplete customFields should raise "INVALID_PARAMETERS"`, async () => {
            let result = await callWeboobBefore(command, {
                bank: 'fakeweboobbank',
                password: 'test',
                login: 'login',
                customFields: JSON.stringify([{ value: 'field' }])
            });

            checkError(result, INVALID_PARAMETERS);
        });

        it(`call "${command}" command, with missing customFields should raise "INVALID_PARAMETERS"`, async () => {
            let result = await callWeboobBefore(command, {
                bank: 'fakeweboobbank',
                password: 'test',
                login: 'login'
            });

            checkError(result, INVALID_PARAMETERS);
        });

        it(`call "${command}" command, with missing customFields should raise "INVALID_PARAMETERS"`, async () => {
            let result = await callWeboobBefore(command, {
                bank: 'fakeweboobbank',
                password: 'test',
                login: 'login',
                customFields: JSON.stringify([])
            });

            checkError(result, INVALID_PARAMETERS);
        });

        it(`call "${command}" command, with missing customFields should raise "INVALID_PARAMETERS"`, async () => {
            let result = await callWeboobBefore(command, {
                bank: 'fakeweboobbank',
                password: 'test',
                login: 'login'
            });

            checkError(result, INVALID_PARAMETERS);
        });

        it(`call "${command}" command with invalid password should raise "INVALID_PASSWORD"`, async () => {
            let result = await callWeboobBefore(command, {
                bank: 'fakeweboobbank',
                password: 'password',
                login: 'invalidpassword',
                customFields: JSON.stringify([
                    { name: 'website', value: 'par' },
                    { name: 'foobar', value: 'toto' }
                ])
            });

            checkError(result, INVALID_PASSWORD);
        });

        it(`call "${command}" command with expired password should raise "EXPIRED_PASSWORD"`, async () => {
            let result = await callWeboobBefore(command, {
                bank: 'fakeweboobbank',
                password: 'password',
                login: 'expiredpassword',
                customFields: JSON.stringify([
                    { name: 'website', value: 'par' },
                    { name: 'foobar', value: 'toto' }
                ])
            });

            checkError(result, EXPIRED_PASSWORD);
        });

        it(`call "${command}" command, the website requires a user action should raise "ACTION_NEEDED"`, async () => {
            let result = await callWeboobBefore(command, {
                bank: 'fakeweboobbank',
                password: 'password',
                login: 'actionneeded',
                customFields: JSON.stringify([
                    { name: 'website', value: 'par' },
                    { name: 'foobar', value: 'toto' }
                ])
            });

            checkError(result, ACTION_NEEDED);
        });
    });
}

// Here everything starts.
describe('Testing kresus/weboob integration', function() {
    // These tests can be long
    this.slow(4000);
    this.timeout(10000);

    describe('with weboob not installed.', () => {
        it('call "test" should raise "WEBOOB_NOT_INSTALLED" error, if weboob is not globally installed. WARNING: if this test fails, make sure Weboob is not installed globally before opening an issue.', async () => {
            prepareProcessKresus(true);
            // Simulate the non installation of weboob.
            process.kresus.weboobDir = null;
            let result = await callWeboobBefore('test');
            checkError(result, WEBOOB_NOT_INSTALLED);
        });
    });
    describe('with weboob installed', () => {
        beforeEach(function() {
            if (!process.env.KRESUS_WEBOOB_DIR) {
                this.skip();
            }
        });
        describe('Defect situations', () => {
            describe('call an unknown command', () => {
                it('should raise "INTERNAL_ERROR" error', async () => {
                    prepareProcessKresus(true);
                    let result = await callWeboobBefore('unknown-command');

                    checkError(result, INTERNAL_ERROR);
                });
            });

            makeDefectSituation('operations');
            makeDefectSituation('accounts');
        });
        describe('Normal uses', () => {
            it('call test should not throw and return nothing', async () => {
                let { error, success } = await callWeboobBefore('test');

                should.not.exist(error);
                should.not.exist(success);
            });
            it('call version should not raise and return a non empty string', async () => {
                let { error, success } = await callWeboobBefore('version');

                should.not.exist(error);
                should.exist(success);
                success.should.instanceof(String);
                success.length.should.be.aboveOrEqual(1);
            });

            it('call "operations" should not raise and should return an array of operation-like shaped objects', async () => {
                let { error, success } = await callWeboobBefore('operations', {
                    bank: 'fakeweboobbank',
                    login: 'noerror',
                    password: 'password',
                    customFields: JSON.stringify([
                        { name: 'website', value: 'par' },
                        { name: 'foobar', value: 'toto' }
                    ])
                });

                should.not.exist(error);
                should.exist(success);
                success.should.instanceof(Array);

                for (let element of success) {
                    element.should.have.keys('date', 'amount', 'title', 'type', 'account');
                }
            });

            it('call "operations" with a password containing special characters should not raise and should return an array of operation-like shaped objects', async () => {
                let { error, success } = await callWeboobBefore('operations', {
                    bank: 'fakeweboobbank',
                    login: 'noerror',
                    password: 'a`&/.:\'?!#>b"',
                    customFields: JSON.stringify([
                        { name: 'website', value: 'par', foobar: 'toto' },
                        { name: 'foobar', value: 'toto' }
                    ])
                });

                should.not.exist(error);
                should.exist(success);
                success.should.instanceof(Array);

                for (let element of success) {
                    element.should.have.keys('date', 'amount', 'title', 'type', 'account');
                }
            });

            it('call "operations" with a password containing only spaces should not raise and should return an array of operation-like shaped objects', async () => {
                let { error, success } = await callWeboobBefore('operations', {
                    bank: 'fakeweboobbank',
                    login: 'noerror',
                    customFields: JSON.stringify([
                        { name: 'website', value: 'par' },
                        { name: 'foobar', value: 'toto' }
                    ]),
                    password: '     '
                });

                should.not.exist(error);
                should.exist(success);
                success.should.instanceof(Array);

                for (let element of success) {
                    element.should.have.keys('date', 'amount', 'title', 'type', 'account');
                }
            });

            it('call "accounts" should not raise and should return an array of account-like shaped objects', async () => {
                let { error, success } = await callWeboobBefore('accounts', {
                    bank: 'fakeweboobbank',
                    login: 'noerror',
                    password: 'password',
                    customFields: JSON.stringify([
                        { name: 'website', value: 'par' },
                        { name: 'foobar', value: 'toto' }
                    ])
                });

                should.not.exist(error);
                should.exist(success);
                success.should.instanceof(Array);

                for (let element of success) {
                    element.should.have.keys(
                        'accountNumber',
                        'title',
                        'currency',
                        'balance',
                        'iban',
                        'type'
                    );
                }
            });
        });
        describe('Storage', () => {
            beforeEach(() => {
                SessionsMap.clear();
            });

            it('call "accounts" on an account which supports session saving should add session information to the SessionMap', async () => {
                SessionsMap.has('accessId').should.equal(false);
                await callWeboobBefore('accounts', {
                    id: 'accessId',
                    bank: 'fakeweboobbank',
                    login: 'session',
                    password: 'password',
                    customFields: JSON.stringify([
                        { name: 'website', value: 'par' },
                        { name: 'foobar', value: 'toto' }
                    ])
                });
                SessionsMap.has('accessId').should.equal(true);
                should.deepEqual(SessionsMap.get('accessId'), {
                    backends: { fakeweboobbank: { browser_state: { password: 'password' } } }
                });
            });

            it('call "operations" on an account which supports session saving should add session information to the SessionMap', async () => {
                SessionsMap.has('accessId').should.equal(false);
                await callWeboobBefore('operations', {
                    id: 'accessId',
                    bank: 'fakeweboobbank',
                    login: 'session',
                    password: 'password2',
                    customFields: JSON.stringify([
                        { name: 'website', value: 'par' },
                        { name: 'foobar', value: 'toto' }
                    ])
                });
                SessionsMap.has('accessId').should.equal(true);
                should.deepEqual(SessionsMap.get('accessId'), {
                    backends: { fakeweboobbank: { browser_state: { password: 'password2' } } }
                });
            });
        });
    });
});
