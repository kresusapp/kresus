import should from 'should';

import { KError } from '../../server/helpers';
import { testing } from '../../server/providers/woob';
import { applyTestConfig } from '../database/config';

import {
    UNKNOWN_WOOB_MODULE,
    INVALID_PASSWORD,
    EXPIRED_PASSWORD,
    ACTION_NEEDED,
    WOOB_NOT_INSTALLED,
    INVALID_PARAMETERS,
    NO_PASSWORD,
    AUTH_METHOD_NYI,
} from '../../shared/errors.json';

const { callWoob, defaultOptions, CallWoobCommand } = testing;

const VALID_FAKE_ACCESS = {
    vendorId: 'fakewoobbank',
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

async function callWoobBefore(command, access, session) {
    return callWoob(command, defaultOptions(), session, access)
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

// Test different defect situations. `command` must be transactions or accounts.
async function makeDefectSituation(command) {
    let textCmd;
    switch (command) {
        case CallWoobCommand.Test: {
            textCmd = 'test';
            break;
        }
        case CallWoobCommand.Accounts: {
            textCmd = 'accounts';
            break;
        }
        case CallWoobCommand.Transactions: {
            textCmd = 'transactions';
            break;
        }
        case CallWoobCommand.Version: {
            textCmd = 'version';
            break;
        }
        default: {
            throw new Error(`unexpected command: ${command}`);
        }
    }

    describe(`Testing defect situations with "${textCmd}" command`, () => {
        it(`call "${textCmd}" command with unknown module should raise "UNKNOWN_WOOB_MODULE"`, async () => {
            let result = await callWoobBefore(
                command,
                {
                    vendorId: 'unknown',
                    login: 'login',
                    password: 'password',
                    fields: [],
                },
                new TestSession()
            );

            checkError(result, UNKNOWN_WOOB_MODULE);
        });

        it(`call "${textCmd}" command without password should raise "INTERNAL_ERROR"`, async () => {
            let result = await callWoobBefore(
                command,
                {
                    vendorId: 'fakewoobbank',
                    login: 'login',
                    password: '',
                    fields: [],
                },
                new TestSession()
            );

            checkError(result, NO_PASSWORD);
        });

        it(`call "${textCmd}" command without login should raise "INVALID_PARAMETERS"`, async () => {
            let result = await callWoobBefore(
                command,
                {
                    vendorId: 'fakewoobbank',
                    password: 'password',
                    login: '',
                    fields: [],
                },
                new TestSession()
            );

            checkError(result, INVALID_PARAMETERS);
        });

        it(`call "${textCmd}" command, with incomplete fields should raise "INVALID_PARAMETERS"`, async () => {
            let result = await callWoobBefore(
                command,
                {
                    vendorId: 'fakewoobbank',
                    password: 'test',
                    login: 'login',
                    fields: [{ name: 'field' }],
                },
                new TestSession()
            );

            checkError(result, INVALID_PARAMETERS);
        });

        it(`call "${textCmd}" command, with incomplete fields should raise "INVALID_PARAMETERS"`, async () => {
            let result = await callWoobBefore(
                command,
                {
                    vendorId: 'fakewoobbank',
                    password: 'test',
                    login: 'login',
                    fields: [{ value: 'field' }],
                },
                new TestSession()
            );

            checkError(result, INVALID_PARAMETERS);
        });

        it(`call "${textCmd}" command, with missing fields should raise "INVALID_PARAMETERS"`, async () => {
            let result = await callWoobBefore(
                command,
                {
                    vendorId: 'fakewoobbank',
                    password: 'test',
                    login: 'login',
                    fields: [],
                },
                new TestSession()
            );

            checkError(result, INVALID_PARAMETERS);
        });

        it(`call "${textCmd}" command, with missing fields should raise "INVALID_PARAMETERS"`, async () => {
            let result = await callWoobBefore(
                command,
                {
                    vendorId: 'fakewoobbank',
                    password: 'test',
                    login: 'login',
                    fields: [],
                },
                new TestSession()
            );

            checkError(result, INVALID_PARAMETERS);
        });

        it(`call "${textCmd}" command with invalid password should raise "INVALID_PASSWORD"`, async () => {
            let result = await callWoobBefore(
                command,
                Object.assign({}, VALID_FAKE_ACCESS, { login: 'invalidpassword' }),
                new TestSession()
            );
            checkError(result, INVALID_PASSWORD);
        });

        it(`call "${textCmd}" command with expired password should raise "EXPIRED_PASSWORD"`, async () => {
            let result = await callWoobBefore(
                command,
                Object.assign({}, VALID_FAKE_ACCESS, { login: 'expiredpassword' }),
                new TestSession()
            );
            checkError(result, EXPIRED_PASSWORD);
        });

        it(`call "${textCmd}" command, the website requires a user action should raise "ACTION_NEEDED"`, async () => {
            let result = await callWoobBefore(
                command,
                Object.assign({}, VALID_FAKE_ACCESS, { login: 'actionneeded' }),
                new TestSession()
            );
            checkError(result, ACTION_NEEDED);
        });

        it(`call "${textCmd}" command, the configured auth method is not supported should raise "AUTH_METHOD_NYI"`, async () => {
            let result = await callWoobBefore(
                command,
                Object.assign({}, VALID_FAKE_ACCESS, {
                    login: 'authmethodnotimplemented',
                }),
                new TestSession()
            );
            checkError(result, AUTH_METHOD_NYI);
        });

        it(`call "${textCmd}" command, the user has to input extra data should raise "BROWSER_QUESTION"`, async () => {
            let sessionManager = new TestSession();

            let result = await callWoobBefore(
                command,
                Object.assign({}, VALID_FAKE_ACCESS, { login: '2fa' }),
                sessionManager
            );

            should.exist(result.success);
            should.exist(result.success.kind);
            result.success.kind.should.equal('user_action');
            should.exist(result.success.fields);
            result.success.fields.should.instanceof(Array);

            // And re-calling with the same session and fields should be
            // sufficient to launch the sync.
            let woobOptions = {
                ...defaultOptions(),
                userActionFields: {
                    code: '1337',
                },
            };

            let woobResponse = await callWoob(
                command,
                woobOptions,
                sessionManager,
                Object.assign({}, VALID_FAKE_ACCESS, { login: '2fa' })
            );

            should.exist(woobResponse);
            should.exist(woobResponse.kind);
            woobResponse.kind.should.equal('values');
            should.exist(woobResponse.values);
        });
    });
}

// Here everything starts.
describe('Testing kresus/woob integration', function () {
    // These tests can be long
    this.slow(4000);
    this.timeout(10000);

    describe('with woob not installed.', () => {
        it('call "test" should raise "WOOB_NOT_INSTALLED" error, if woob is not globally installed. WARNING: if this test fails, make sure Woob is not installed globally before opening an issue.', async () => {
            applyTestConfig();
            // Simulate the non installation of woob.
            process.kresus.woobDir = '/dev/null';
            let result = await callWoobBefore(CallWoobCommand.Test);
            checkError(result, WOOB_NOT_INSTALLED);
        });
    });

    describe('with woob installed', () => {
        beforeEach(function () {
            if (!process.env.KRESUS_WOOB_DIR) {
                this.skip();
            }
        });

        describe('Defect situations', () => {
            describe('call an unknown command', () => {
                it('should raise "INVALID_PARAMETERS" error', async () => {
                    applyTestConfig();
                    let result = await callWoobBefore('unknown-command');
                    checkError(result, INVALID_PARAMETERS);
                });
            });

            makeDefectSituation(CallWoobCommand.Transactions);
            makeDefectSituation(CallWoobCommand.Accounts);
        });

        describe('Normal uses', () => {
            it('call test should not throw and return nothing', async () => {
                let { error, success } = await callWoobBefore(CallWoobCommand.Test);
                should.not.exist(error);
                should.exist(success);
            });

            it('call version should not raise and return a non empty string', async () => {
                let { error, success } = await callWoobBefore(CallWoobCommand.Version);
                should.not.exist(error);
                should.exist(success);
                should.exist(success.values);
                success.values.should.instanceof(String);
                success.values.length.should.be.aboveOrEqual(1);
            });

            it('call "transactions" should not raise and should return an array of transaction-like shaped objects', async () => {
                let { error, success } = await callWoobBefore(
                    CallWoobCommand.Transactions,
                    VALID_FAKE_ACCESS,
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

            it('call "transactions" with a password containing special characters should not raise and should return an array of transaction-like shaped objects', async () => {
                let { error, success } = await callWoobBefore(
                    CallWoobCommand.Transactions,
                    Object.assign({}, VALID_FAKE_ACCESS, {
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

            it('call "transactions" with a password containing only spaces should not raise and should return an array of transaction-like shaped objects', async () => {
                let { error, success } = await callWoobBefore(
                    CallWoobCommand.Transactions,
                    Object.assign({}, VALID_FAKE_ACCESS, {
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
                let { error, success } = await callWoobBefore(
                    CallWoobCommand.Accounts,
                    VALID_FAKE_ACCESS,
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
                await callWoobBefore(
                    CallWoobCommand.Accounts,
                    Object.assign({}, VALID_FAKE_ACCESS, {
                        id: 'accessId',
                        login: 'session',
                        password: 'password',
                    }),
                    session
                );
                session.map.has('accessId').should.equal(true);
                should.deepEqual(session.map.get('accessId'), {
                    backends: { fakewoobbank: { browser_state: { password: 'password' } } },
                });
            });

            it('call "transactions" on an account which supports session saving should add session information to the SessionMap', async () => {
                session.map.has('accessId').should.equal(false);
                await callWoobBefore(
                    CallWoobCommand.Transactions,
                    Object.assign({}, VALID_FAKE_ACCESS, {
                        id: 'accessId',
                        login: 'session',
                        password: 'password2',
                    }),
                    session
                );
                session.map.has('accessId').should.equal(true);
                should.deepEqual(session.map.get('accessId'), {
                    backends: { fakewoobbank: { browser_state: { password: 'password2' } } },
                });
            });
        });
    });
});
