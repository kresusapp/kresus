import should from 'should';

import { KError } from '../../server/helpers';
import { testing } from '../../server/providers/weboob';
import { applyTestConfig } from '../database/config';

import {
    UNKNOWN_WEBOOB_MODULE,
    INTERNAL_ERROR,
    INVALID_PASSWORD,
    EXPIRED_PASSWORD,
    ACTION_NEEDED,
    WEBOOB_NOT_INSTALLED,
    INVALID_PARAMETERS,
    NO_PASSWORD,
    AUTH_METHOD_NYI,
} from '../../shared/errors.json';

const { callWeboob, defaultWeboobOptions } = testing;

const VALID_FAKEWEBOOBBANK_ACCESS = {
    vendorId: 'fakeweboobbank',
    password: 'password',
    login: 'noerror',
    fields: [
        { name: 'website', value: 'par' },
        { name: 'foobar', value: 'toto' },
        { name: 'secret', value: 'topsikret' },
    ],
};

// A simple class implementing a dummy SessionManager.
class TestSession {
    map = new Map();
    clear() {
        this.map = new Map();
    }
    save(access, session) {
        this.map.set(access.id, session);
    }
    reset(access) {
        this.map.delete(access.id);
    }
    read(access) {
        return this.map.get(access.id);
    }
}

async function callWeboobBefore(command, access, session) {
    return callWeboob(command, defaultWeboobOptions(), session, access)
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
        // Command must be operations or accounts.
        it(`call "${command}" command with unknown module should raise "UNKNOWN_WEBOOB_MODULE"`, async () => {
            let result = await callWeboobBefore(
                command,
                {
                    vendorId: 'unknown',
                    login: 'login',
                    password: 'password',
                    fields: [],
                },
                new TestSession()
            );

            checkError(result, UNKNOWN_WEBOOB_MODULE);
        });

        it(`call "${command}" command without password should raise "INTERNAL_ERROR"`, async () => {
            let result = await callWeboobBefore(
                command,
                {
                    vendorId: 'fakeweboobbank',
                    login: 'login',
                    password: '',
                    fields: [],
                },
                new TestSession()
            );

            checkError(result, NO_PASSWORD);
        });

        it(`call "${command}" command without login should raise "INVALID_PARAMETERS"`, async () => {
            let result = await callWeboobBefore(
                command,
                {
                    vendorId: 'fakeweboobbank',
                    password: 'password',
                    login: '',
                    fields: [],
                },
                new TestSession()
            );

            checkError(result, INVALID_PARAMETERS);
        });

        it(`call "${command}" command, with incomplete fields should raise "INVALID_PARAMETERS"`, async () => {
            let result = await callWeboobBefore(
                command,
                {
                    vendorId: 'fakeweboobbank',
                    password: 'test',
                    login: 'login',
                    fields: [{ name: 'field' }],
                },
                new TestSession()
            );

            checkError(result, INVALID_PARAMETERS);
        });

        it(`call "${command}" command, with incomplete fields should raise "INVALID_PARAMETERS"`, async () => {
            let result = await callWeboobBefore(
                command,
                {
                    vendorId: 'fakeweboobbank',
                    password: 'test',
                    login: 'login',
                    fields: [{ value: 'field' }],
                },
                new TestSession()
            );

            checkError(result, INVALID_PARAMETERS);
        });

        it(`call "${command}" command, with missing fields should raise "INVALID_PARAMETERS"`, async () => {
            let result = await callWeboobBefore(
                command,
                {
                    vendorId: 'fakeweboobbank',
                    password: 'test',
                    login: 'login',
                    fields: [],
                },
                new TestSession()
            );

            checkError(result, INVALID_PARAMETERS);
        });

        it(`call "${command}" command, with missing fields should raise "INVALID_PARAMETERS"`, async () => {
            let result = await callWeboobBefore(
                command,
                {
                    vendorId: 'fakeweboobbank',
                    password: 'test',
                    login: 'login',
                    fields: [],
                },
                new TestSession()
            );

            checkError(result, INVALID_PARAMETERS);
        });

        it(`call "${command}" command with invalid password should raise "INVALID_PASSWORD"`, async () => {
            let result = await callWeboobBefore(
                command,
                Object.assign({}, VALID_FAKEWEBOOBBANK_ACCESS, { login: 'invalidpassword' }),
                new TestSession()
            );
            checkError(result, INVALID_PASSWORD);
        });

        it(`call "${command}" command with expired password should raise "EXPIRED_PASSWORD"`, async () => {
            let result = await callWeboobBefore(
                command,
                Object.assign({}, VALID_FAKEWEBOOBBANK_ACCESS, { login: 'expiredpassword' }),
                new TestSession()
            );
            checkError(result, EXPIRED_PASSWORD);
        });

        it(`call "${command}" command, the website requires a user action should raise "ACTION_NEEDED"`, async () => {
            let result = await callWeboobBefore(
                command,
                Object.assign({}, VALID_FAKEWEBOOBBANK_ACCESS, { login: 'actionneeded' }),
                new TestSession()
            );
            checkError(result, ACTION_NEEDED);
        });

        it(`call "${command}" command, the configured auth method is not supported by weboob should raise "AUTH_METHOD_NYI"`, async () => {
            let result = await callWeboobBefore(
                command,
                Object.assign({}, VALID_FAKEWEBOOBBANK_ACCESS, {
                    login: 'authmethodnotimplemented',
                }),
                new TestSession()
            );
            checkError(result, AUTH_METHOD_NYI);
        });

        it(`call "${command}" command, the user has to input extra data should raise "BROWSER_QUESTION"`, async () => {
            let sessionManager = new TestSession();

            let result = await callWeboobBefore(
                command,
                Object.assign({}, VALID_FAKEWEBOOBBANK_ACCESS, { login: '2fa' }),
                sessionManager
            );

            should.exist(result.success);
            should.exist(result.success.kind);
            result.success.kind.should.equal('user_action');
            should.exist(result.success.fields);
            result.success.fields.should.instanceof(Array);

            // And re-calling with the same session and fields should be
            // sufficient to launch the sync.
            let weboobOptions = {
                ...defaultWeboobOptions(),
                userActionFields: {
                    code: '1337',
                },
            };

            let weboobResponse = await callWeboob(
                command,
                weboobOptions,
                sessionManager,
                Object.assign({}, VALID_FAKEWEBOOBBANK_ACCESS, { login: '2fa' })
            );

            should.exist(weboobResponse);
            should.exist(weboobResponse.kind);
            weboobResponse.kind.should.equal('values');
            should.exist(weboobResponse.values);
        });
    });
}

// Here everything starts.
describe('Testing kresus/weboob integration', function () {
    // These tests can be long
    this.slow(4000);
    this.timeout(10000);

    describe('with weboob not installed.', () => {
        it('call "test" should raise "WEBOOB_NOT_INSTALLED" error, if weboob is not globally installed. WARNING: if this test fails, make sure Weboob is not installed globally before opening an issue.', async () => {
            applyTestConfig();
            // Simulate the non installation of weboob.
            process.kresus.weboobDir = '/dev/null';
            let result = await callWeboobBefore('test');
            checkError(result, WEBOOB_NOT_INSTALLED);
        });
    });

    describe('with weboob installed', () => {
        beforeEach(function () {
            if (!process.env.KRESUS_WEBOOB_DIR) {
                this.skip();
            }
        });

        describe('Defect situations', () => {
            describe('call an unknown command', () => {
                it('should raise "INTERNAL_ERROR" error', async () => {
                    applyTestConfig();
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
                should.exist(success);
            });

            it('call version should not raise and return a non empty string', async () => {
                let { error, success } = await callWeboobBefore('version');
                should.not.exist(error);
                should.exist(success);
                should.exist(success.values);
                success.values.should.instanceof(String);
                success.values.length.should.be.aboveOrEqual(1);
            });

            it('call "operations" should not raise and should return an array of operation-like shaped objects', async () => {
                let { error, success } = await callWeboobBefore(
                    'operations',
                    VALID_FAKEWEBOOBBANK_ACCESS,
                    new TestSession()
                );

                should.not.exist(error);
                should.exist(success);
                should.exist(success.values);
                success.values.should.instanceof(Array);

                for (let element of success.values) {
                    element.should.have.keys('date', 'amount', 'label', 'type', 'account');
                }
            });

            it('call "operations" with a password containing special characters should not raise and should return an array of operation-like shaped objects', async () => {
                let { error, success } = await callWeboobBefore(
                    'operations',
                    Object.assign({}, VALID_FAKEWEBOOBBANK_ACCESS, {
                        password: 'a`&/.:\'?!#>b"',
                    }),
                    new TestSession()
                );

                should.not.exist(error);
                should.exist(success);
                should.exist(success.values);
                success.values.should.instanceof(Array);

                for (let element of success.values) {
                    element.should.have.keys('date', 'amount', 'label', 'type', 'account');
                }
            });

            it('call "operations" with a password containing only spaces should not raise and should return an array of operation-like shaped objects', async () => {
                let { error, success } = await callWeboobBefore(
                    'operations',
                    Object.assign({}, VALID_FAKEWEBOOBBANK_ACCESS, {
                        password: '     ',
                    }),
                    new TestSession()
                );

                should.not.exist(error);
                should.exist(success);
                should.exist(success.values);
                success.values.should.instanceof(Array);

                for (let element of success.values) {
                    element.should.have.keys('date', 'amount', 'label', 'type', 'account');
                }
            });

            it('call "accounts" should not raise and should return an array of account-like shaped objects', async () => {
                let { error, success } = await callWeboobBefore(
                    'accounts',
                    VALID_FAKEWEBOOBBANK_ACCESS,
                    new TestSession()
                );

                should.not.exist(error);
                should.exist(success);
                should.exist(success.values);
                success.values.should.instanceof(Array);

                for (let element of success.values) {
                    element.should.have.keys(
                        'vendorAccountId',
                        'label',
                        'currency',
                        'balance',
                        'iban',
                        'type'
                    );
                }
            });
        });

        describe('Storage', () => {
            let session = new TestSession();

            beforeEach(() => {
                session.clear();
            });

            it('call "accounts" on an account which supports session saving should add session information to the SessionMap', async () => {
                session.map.has('accessId').should.equal(false);
                await callWeboobBefore(
                    'accounts',
                    Object.assign({}, VALID_FAKEWEBOOBBANK_ACCESS, {
                        id: 'accessId',
                        login: 'session',
                        password: 'password',
                    }),
                    session
                );
                session.map.has('accessId').should.equal(true);
                should.deepEqual(session.map.get('accessId'), {
                    backends: { fakeweboobbank: { browser_state: { password: 'password' } } },
                });
            });

            it('call "operations" on an account which supports session saving should add session information to the SessionMap', async () => {
                session.map.has('accessId').should.equal(false);
                await callWeboobBefore(
                    'operations',
                    Object.assign({}, VALID_FAKEWEBOOBBANK_ACCESS, {
                        id: 'accessId',
                        login: 'session',
                        password: 'password2',
                    }),
                    session
                );
                session.map.has('accessId').should.equal(true);
                should.deepEqual(session.map.get('accessId'), {
                    backends: { fakeweboobbank: { browser_state: { password: 'password2' } } },
                });
            });
        });
    });
});
