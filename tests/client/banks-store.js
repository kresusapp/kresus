import should from 'should';
import deepcopy from 'lodash.clonedeep';

import {
    accessById,
    accountById,
    getAccessIds,
    transactionIdsByAccountId,
    transactionById,
    testing,
} from '../../client/store/banks';
import { setupTranslator } from '../../client/helpers';

import banks from '../../shared/banks.json';

// Store adapters.
const makeAdapter = func => {
    return (state, ...rest) => {
        let mut = deepcopy(state);
        func(mut, ...rest);
        return mut;
    };
};

const addAccesses = makeAdapter(testing.addAccesses);
const removeAccess = makeAdapter(testing.removeAccess);
const addAccounts = makeAdapter(testing.addAccounts);
const removeAccount = makeAdapter(testing.removeAccount);
const addTransactions = makeAdapter(testing.addTransactions);
const removeTransaction = makeAdapter(testing.removeTransaction);
// End of store adapters.

const dummyState = {
    accessIds: [],
    accessMap: {},
    accountMap: {},
    transactionMap: {},
    alerts: [],
    banks,
    defaultCurrency: 'EUR',
    defaultAccountId: null,
};

const dummyAccess = {
    id: 1,
    vendorId: 'manual',
    enabled: true,
    login: 'login',
    label: 'Fake label',
    customFields: [],
};

const dummyAccount = {
    id: 1,
    accessId: 1,
    vendorAccountId: '#1',
    lastCheckDate: new Date(),
    initialBalance: 1000,
    balance: 1337,
    label: 'My Account',
};

const dummyAccount2 = {
    id: 2,
    accessId: 1,
    vendorAccountId: '#2',
    lastCheckDate: new Date(),
    initialBalance: 500,
    balance: 1234,
    label: 'My Other Account',
};

const dummyTransaction = {
    id: 1,
    accountId: dummyAccount.id,
    amount: 500,
    type: 'type.unknown',
    rawLabel: 'Dummy transaction',
    label: 'Dummy Transaction',
    date: new Date(),
};

const dummyTransaction2 = {
    id: 2,
    accountId: dummyAccount2.id,
    amount: 1000,
    type: 'type.unknown',
    rawLabel: 'Dummy transaction 2',
    label: 'Dummy Transaction 2',
    date: new Date(),
};

function checkTransaction(transactionFromStore, referenceTransaction) {
    should(transactionFromStore).not.be.null();
    transactionFromStore.should.not.equal(referenceTransaction);
    transactionFromStore.amount.should.equal(referenceTransaction.amount);
    transactionFromStore.type.should.equal(referenceTransaction.type);
    transactionFromStore.label.should.equal(referenceTransaction.label);
    transactionFromStore.id.should.equal(referenceTransaction.id);
    transactionFromStore.date.toString().should.equal(referenceTransaction.date.toString());
}

describe('Transaction management', () => {
    const state = {
        accessIds: [1],
        accessMap: {
            1: {
                ...dummyAccess,
                accountIds: [1],
            },
        },
        accountMap: {
            1: {
                ...dummyAccount,
                transactionIds: [],
            },
        },
        transactionMap: {},
        banks,
        defaultCurrency: 'EUR',
        defaultAccountId: null,
        alerts: [],
    };

    describe('Add transaction', () => {
        let newState = addTransactions(state, [dummyTransaction]);
        let transaction = transactionById(newState, dummyTransaction.id);

        it('The transaction should be added to the store', () => {
            checkTransaction(transaction, dummyTransaction);
        });
        let opIds = transactionIdsByAccountId(newState, dummyAccount.id);
        let account = accountById(newState, dummyAccount.id);

        it('The transaction should be added to the accounts transactions and the balance should not be updated', () => {
            opIds.should.containEql(dummyTransaction.id);
            account.initialBalance.should.equal(dummyAccount.initialBalance);
            account.balance.should.equal(dummyAccount.balance);
        });
    });

    describe('Add multiple transactions to the same account', () => {
        const anotherTransaction = {
            id: 2,
            accountId: dummyAccount.id,
            amount: 1000,
            type: 'type.unknown',
            rawLabel: 'Dummy transaction 2',
            label: 'Dummy Transaction 2',
            date: new Date(),
        };

        let newState = addTransactions(state, [dummyTransaction, anotherTransaction]);
        let transaction1 = transactionById(newState, dummyTransaction.id);
        let transaction2 = transactionById(newState, anotherTransaction.id);
        it('The transactions should be added to the store', () => {
            checkTransaction(transaction1, dummyTransaction);
            checkTransaction(transaction2, anotherTransaction);
        });

        let opIds = transactionIdsByAccountId(newState, dummyAccount.id);
        let account = accountById(newState, dummyAccount.id);
        it('The transaction should be added to the accounts transactions and the balance should not be updated', () => {
            opIds.should.containEql(dummyTransaction.id);
            opIds.should.containEql(anotherTransaction.id);
            account.balance.should.equal(dummyAccount.balance);
            account.initialBalance.should.equal(dummyAccount.initialBalance);
        });
    });

    describe('Add multiple transactions to different accounts', () => {
        const state2 = Object.assign(state, {
            accountMap: {
                1: {
                    ...dummyAccount,
                    balance: dummyAccount.balance,
                    initialBalance: dummyAccount.initialBalance,
                    transactionIds: [],
                },
                2: {
                    ...dummyAccount2,
                    balance: dummyAccount2.balance,
                    initialBalance: dummyAccount2.initialBalance,
                    transactionIds: [],
                },
            },
        });

        let newState = addTransactions(state2, [dummyTransaction, dummyTransaction2]);
        let transaction1 = transactionById(newState, dummyTransaction.id);
        let transaction2 = transactionById(newState, dummyTransaction2.id);
        it('The transactions should be added to the store', () => {
            checkTransaction(transaction1, dummyTransaction);
            checkTransaction(transaction2, dummyTransaction2);
        });

        let opIds = transactionIdsByAccountId(newState, dummyAccount.id);
        let account = accountById(newState, dummyAccount.id);
        let opIds2 = transactionIdsByAccountId(newState, dummyAccount2.id);
        let account2 = accountById(newState, dummyAccount2.id);
        it('The transaction should be added to the accounts transactions and the balance should not be updated', () => {
            opIds.should.containEql(dummyTransaction.id);
            account.balance.should.equal(dummyAccount.balance);
            account.initialBalance.should.equal(dummyAccount.initialBalance);
            opIds2.should.containEql(dummyTransaction2.id);
            account2.balance.should.equal(dummyAccount2.balance);
            account2.initialBalance.should.equal(dummyAccount2.initialBalance);
        });
    });

    describe('Delete transaction', () => {
        let newState = addTransactions(state, [dummyTransaction]);
        let transaction = transactionById(newState, dummyTransaction.id);
        it('The transaction should be deleted and be removed of the list of transactions of the according account and the balance should not be updated', () => {
            // First ensure the transaction exists and is in the transaction list.
            should(transaction).not.be.null();

            newState = removeTransaction(newState, dummyTransaction.id);
            // Check transactions map.
            should.throws(() => {
                transactionById(newState, dummyTransaction.id);
            });

            // Check balance.
            let account = accountById(newState, dummyAccount.id);
            account.initialBalance.should.equal(account.initialBalance);
            account.balance.should.equal(account.balance);
        });
    });
});

describe('Account management', () => {
    const state = {
        accessIds: [1],
        accessMap: {
            1: {
                id: 1,
                vendorId: 'manual',
                enabled: true,
                login: 'login',
                customFields: [],
                accountIds: [],
            },
        },
        transactionMap: {},
        accountMap: {},
        banks,
        alerts: [],
        defaultCurrency: 'EUR',
        defaultAccountId: null,
    };

    describe('Account creation', () => {
        describe('single account addition', () => {
            let newState = addAccounts(state, [dummyAccount], [dummyTransaction]);
            let account = accountById(newState, dummyAccount.id);
            it('The account should be in the store', () => {
                account.id.should.equal(dummyAccount.id);
                account.initialBalance.should.equal(dummyAccount.initialBalance);
                account.balance.should.equal(dummyAccount.balance);
                // No attached transaction
                account.accessId.should.equal(dummyAccount.accessId);
            });

            it("The account should be added to its access's account's list", () => {
                let access = accessById(newState, dummyAccount.accessId);
                access.accountIds.should.containEql(dummyAccount.id);
            });

            it("The transaction should be added to the account's transactions list", () => {
                let transaction = transactionById(newState, dummyTransaction.id);
                checkTransaction(transaction, dummyTransaction);
            });
        });

        describe('multiple account addition', () => {
            // Setting the translator is necessary to allow account sorting.
            setupTranslator('en');
            let newState = addAccounts(
                state,
                [dummyAccount, dummyAccount2],
                [dummyTransaction, dummyTransaction2]
            );
            let account = accountById(newState, dummyAccount.id);
            let account2 = accountById(newState, dummyAccount2.id);
            it('Both accounts should be in the store', () => {
                should(account).not.be.null();
                account.label.should.equal(dummyAccount.label);
                should(account2).not.be.null();
                account2.label.should.equal(dummyAccount2.label);
            });

            it("Both accounts should be in their access's list", () => {
                let access = accessById(newState, dummyAccount.accessId);
                access.accountIds.should.containEql(dummyAccount.id);
                access.accountIds.should.containEql(dummyAccount2.id);
            });

            it('The transaction ids should be in the transactionId list of the appropriate account', () => {
                let opIds = transactionIdsByAccountId(newState, dummyAccount.id);
                opIds.should.containEql(dummyTransaction.id);
                let opIds2 = transactionIdsByAccountId(newState, dummyAccount2.id);
                opIds2.should.containEql(dummyTransaction2.id);
            });

            it("The transactions should be added to the appropriate account's transactions list", () => {
                let transaction = transactionById(newState, dummyTransaction.id);
                checkTransaction(transaction, dummyTransaction);

                let transaction2 = transactionById(newState, dummyTransaction2.id);
                checkTransaction(transaction2, dummyTransaction2);
            });
        });
    });

    describe('Account deletion', () => {
        describe('Delete the last account of an access', () => {
            let newState = addAccounts(state, [dummyAccount], []);
            let account = accountById(newState, dummyAccount.id);
            let access = accessById(newState, dummyAccount.accessId);

            it('The account should be deleted from the store', () => {
                // First ensure the account is correctly added in the store
                account.id.should.equal(dummyAccount.id);
                access.accountIds.should.containEql(dummyAccount.id);
                newState = removeAccount(newState, dummyAccount.id);
                should.throws(() => {
                    accountById(newState, dummyAccount.id);
                });
            });

            it('The access to which the account was attached is removed from the store, as there is no more account attached to it', () => {
                should.throws(() => {
                    accessById(newState, dummyAccount.accessId);
                });
            });
        });

        describe('Deleting an account from an access, should not delete the access (and the remaining accounts), if the access has more than 1 account', () => {
            // Setting the translator is necessary to allow account sorting.
            setupTranslator('en');
            let newState = addAccounts(state, [dummyAccount, dummyAccount2], []);
            let account = accountById(newState, dummyAccount.id);
            let account2 = accountById(newState, dummyAccount2.id);
            it('The account should be removed from the store, and its access should still be in the store, ', () => {
                should(account).not.be.null();
                account.label.should.equal(dummyAccount.label);
                should(account2).not.be.null();
                account2.label.should.equal(dummyAccount2.label);
                newState = removeAccount(newState, dummyAccount.id);
                should.throws(() => {
                    accountById(newState, dummyAccount.id);
                });

                let access = accessById(newState, dummyAccount.accessId);
                should(access).not.be.null();
                access.accountIds.should.not.containEql(dummyAccount.id);
                access.accountIds.should.containEql(dummyAccount2.id);
            });
        });

        describe('Deleting an account also deletes all the attached transactions', () => {
            let newState = addAccounts(state, [dummyAccount], []);
            newState = addTransactions(newState, [dummyTransaction]);

            // First ensure the transaction is in the store.
            let transaction = transactionById(newState, dummyTransaction.id);
            should(transaction).not.be.null();

            // Remove the account (and thus the transactions).
            newState = removeAccount(newState, dummyAccount.id);

            // Now check the transaction is deleted.
            should.throws(() => {
                transactionById(newState, dummyTransaction.id);
            });
        });

        describe('Adding an already existing account should update it in the store', () => {
            let newState = addAccounts(state, [dummyAccount, dummyAccount2], [dummyTransaction]);

            // Check the accounts are in the store.
            let readDummyAccount = accountById(newState, dummyAccount.id);
            should(readDummyAccount).not.be.null();
            readDummyAccount.transactionIds.length.should.equal(1);
            readDummyAccount.transactionIds.should.containDeep([dummyTransaction.id]);

            let readDummyAccount2 = accountById(newState, dummyAccount2.id);
            should(readDummyAccount2).not.be.null();
            readDummyAccount2.transactionIds.length.should.equal(0);

            // Update the store with an updated account.
            let newDummyAccount = {
                ...dummyAccount,
                customLabel: 'new label',
                initialBalance: 200,
            };
            let newDummyTransaction = { ...dummyTransaction, id: 3, amount: -500 };

            newState = addAccounts(newState, [newDummyAccount], [newDummyTransaction]);

            // Ensure the "added again" account is updated, and the other is not changed.
            let updatedAccount = accountById(newState, dummyAccount.id);

            updatedAccount.should.not.deepEqual(readDummyAccount);
            updatedAccount.customLabel.should.equal(newDummyAccount.customLabel);
            updatedAccount.transactionIds.length.should.equal(2);
            updatedAccount.transactionIds.should.containDeep([
                newDummyTransaction.id,
                dummyTransaction.id,
            ]);
            updatedAccount.initialBalance.should.equal(newDummyAccount.initialBalance);

            // The balance should not change.
            updatedAccount.balance.should.equal(newDummyAccount.balance);

            accountById(newState, dummyAccount2.id).should.deepEqual(readDummyAccount2);
        });
    });
});

describe('Access management', () => {
    describe('Access creation', () => {
        it('the access should be added to the store', () => {
            let newState = addAccesses(dummyState, [dummyAccess], [], []);
            getAccessIds(newState).should.containEql(dummyAccess.id);
            let access = accessById(newState, dummyAccess.id);
            should.deepEqual(access.customFields, []);
            should.deepEqual(access.accountIds, []);
            should.equal(access.id, dummyAccess.id);
            should.equal(access.vendorId, dummyAccess.vendorId);
            should.equal(access.enabled, dummyAccess.enabled);
            should.equal(access.login, dummyAccess.login);
        });
    });

    describe('Access deletion', () => {
        it('The access should be deleted from the store', () => {
            // First we create an access.
            let newState = addAccesses(dummyState, [dummyAccess], [dummyAccount], []);
            let access = accessById(newState, dummyAccess.id);
            getAccessIds(newState).should.containEql(dummyAccess.id);
            should.equal(access.id, dummyAccess.id);

            newState = removeAccess(newState, dummyAccess.id);
            // Ensure the access is deleted.
            should.throws(() => accessById(newState, dummyAccess.id));
            getAccessIds(newState).should.not.containEql(dummyAccess.id);
        });

        it('All attached accounts should be deleted from the store', () => {
            let newState = addAccesses(dummyState, [dummyAccess], [], []);
            newState = addAccounts(newState, [dummyAccount], []);
            should(accountById(newState, dummyAccount.id)).not.be.null();

            newState = removeAccess(newState, dummyAccess.id);
            should.throws(() => accountById(newState, dummyAccount.id));
            getAccessIds(newState).should.not.containEql(dummyAccess.id);
        });
    });
    describe('Access update', () => {
        it('The access should be updated in the store', () => {
            // First we create an access.
            let newState = addAccesses(dummyState, [dummyAccess], [], []);
            let access = accessById(newState, dummyAccess.id);
            getAccessIds(newState).should.containEql(dummyAccess.id);
            should.equal(access.id, dummyAccess.id);
        });
    });
});
