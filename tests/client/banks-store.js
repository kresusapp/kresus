import should from 'should';

import { get } from '../../client/store';
import { testing } from '../../client/store/banks';
import { setupTranslator } from '../../client/helpers';

import banks from '../../shared/banks.json';

const {
    addAccesses,
    removeAccess,
    updateAccessFields,
    addAccounts,
    removeAccount,
    updateAccountFields,
    addOperations,
    removeOperation,
    updateOperationFields
} = testing;

const dummyState = {
    accessIds: [],
    accessesMap: {},
    alerts: [],
    banks,
    constants: {
        defaultCurrency: 'EUR'
    }
};

const dummyAccess = {
    id: '1',
    vendorId: 'manual',
    enabled: true,
    login: 'login',
    customFields: []
};

const dummyAccount = {
    id: 'account1',
    accessId: '1',
    vendorAccountId: '#1',
    lastCheckDate: new Date(),
    initialBalance: 1000,
    label: 'My Account',
    vendorId: 'manual'
};

const dummyAccount2 = {
    id: 'account2',
    accessId: '1',
    vendorAccountId: '#2',
    lastCheckDate: new Date(),
    initialBalance: 500,
    label: 'My Other Account',
    vendorId: 'manual'
};

const dummyOperation = {
    id: 'operation1',
    accountId: dummyAccount.id,
    amount: 500,
    type: 'type.unknown',
    rawLabel: 'Dummy operation',
    label: 'Dummy Op.',
    date: new Date()
};

const dummyOperation2 = {
    id: 'operation2',
    accountId: dummyAccount2.id,
    amount: 1000,
    type: 'type.unknown',
    rawLabel: 'Dummy operation 2',
    label: 'Dummy Op. 2',
    date: new Date()
};

function checkOperation(operationFromStore, referenceOperation) {
    operationFromStore.should.not.equal(null);
    operationFromStore.should.not.equal(referenceOperation);
    operationFromStore.amount.should.equal(referenceOperation.amount);
    operationFromStore.type.should.equal(referenceOperation.type);
    operationFromStore.label.should.equal(referenceOperation.label);
    operationFromStore.id.should.equal(referenceOperation.id);
    operationFromStore.date.toString().should.equal(referenceOperation.date.toString());
}

describe('Operation management', () => {
    const state = {
        accessIds: ['1'],
        accessesMap: {
            '1': {
                ...dummyAccess,
                accountIds: ['account1']
            }
        },
        accountsMap: {
            account1: {
                ...dummyAccount,
                balance: dummyAccount.initialBalance,
                operationIds: []
            }
        },
        banks,
        constants: {
            defaultCurrency: 'EUR'
        },
        alerts: []
    };

    describe('Add operation', () => {
        let newState = addOperations(state, dummyOperation);
        let operation = get.operationById({ banks: newState }, dummyOperation.id);

        it('The operation should be added to the store', () => {
            checkOperation(operation, dummyOperation);
        });
        let opIds = get.operationIdsByAccountId({ banks: newState }, dummyAccount.id);
        let account = get.accountById({ banks: newState }, dummyAccount.id);

        it('The operation should be added to the accounts operations and the balance should be updated', () => {
            opIds.should.containEql(dummyOperation.id);
            account.balance.should.equal(dummyAccount.initialBalance + dummyOperation.amount);
        });
    });

    describe('Add multiple operations to the same account', () => {
        const anotherOp = {
            id: 'operation2',
            accountId: dummyAccount.id,
            amount: 1000,
            type: 'type.unknown',
            rawLabel: 'Dummy operation 2',
            label: 'Dummy Op. 2',
            date: new Date()
        };

        let newState = addOperations(state, [dummyOperation, anotherOp]);
        let operation1 = get.operationById({ banks: newState }, dummyOperation.id);
        let operation2 = get.operationById({ banks: newState }, anotherOp.id);
        it('The operations should be added to the store', () => {
            checkOperation(operation1, dummyOperation);
            checkOperation(operation2, anotherOp);
        });

        let opIds = get.operationIdsByAccountId({ banks: newState }, dummyAccount.id);
        let account = get.accountById({ banks: newState }, dummyAccount.id);
        it('The operation should be added to the accounts operations and the balance should be updated', () => {
            opIds.should.containEql(dummyOperation.id);
            opIds.should.containEql(anotherOp.id);
            account.balance.should.equal(
                dummyAccount.initialBalance + dummyOperation.amount + anotherOp.amount
            );
        });
    });

    describe('Add multiple operations to different accounts', () => {
        const state2 = Object.assign(state, {
            accountsMap: {
                account2: {
                    ...dummyAccount2,
                    balance: dummyAccount2.initialBalance,
                    operationIds: []
                },
                account1: {
                    ...dummyAccount,
                    balance: dummyAccount.initialBalance,
                    operationIds: []
                }
            }
        });

        let newState = addOperations(state2, [dummyOperation, dummyOperation2]);
        let operation1 = get.operationById({ banks: newState }, dummyOperation.id);
        let operation2 = get.operationById({ banks: newState }, dummyOperation2.id);
        it('The operations should be added to the store', () => {
            checkOperation(operation1, dummyOperation);
            checkOperation(operation2, dummyOperation2);
        });

        let opIds = get.operationIdsByAccountId({ banks: newState }, dummyAccount.id);
        let account = get.accountById({ banks: newState }, dummyAccount.id);
        let opIds2 = get.operationIdsByAccountId({ banks: newState }, dummyAccount2.id);
        let account2 = get.accountById({ banks: newState }, dummyAccount2.id);
        it('The operation should be added to the accounts operations and the balance should be updated', () => {
            opIds.should.containEql(dummyOperation.id);
            account.balance.should.equal(dummyAccount.initialBalance + dummyOperation.amount);
            opIds2.should.containEql(dummyOperation2.id);
            account2.balance.should.equal(dummyAccount2.initialBalance + dummyOperation2.amount);
        });
    });

    describe('Update operation', () => {
        let newState = addOperations(state, dummyOperation);
        let operation = get.operationById({ banks: newState }, dummyOperation.id);
        it('The operation should be updated', () => {
            // First ensure the operation exists
            operation.should.not.equal(null);
            newState = updateOperationFields(newState, dummyOperation.id, {
                type: 'type.card'
            });
            operation = get.operationById({ banks: newState }, dummyOperation.id);
            operation.type.should.not.equal(dummyOperation.type);
            operation.type.should.equal('type.card');
            newState = updateOperationFields(newState, dummyOperation.id, {
                customLabel: 'Custom Label'
            });

            operation = get.operationById({ banks: newState }, dummyOperation.id);
            operation.customLabel.should.equal('Custom Label');
        });
    });

    describe('Delete operation', () => {
        let newState = addOperations(state, dummyOperation);
        let operation = get.operationById({ banks: newState }, dummyOperation.id);
        it('The operation should be deleted and be removed of the list of operations of the according account and the balance should be updated', () => {
            // First ensure the operation exists and is in the operation list.
            operation.should.not.equal(null);
            let accountIds = get.operationIdsByAccountIds({ banks: newState }, dummyAccount.id);
            accountIds.should.containEql(dummyOperation.id);

            newState = removeOperation(newState, dummyOperation.id);
            // Check operations map.
            operation = get.operationById({ banks: newState }, dummyOperation.id);
            should.equal(operation, null);
            // Check account's operation list.
            accountIds = get.operationIdsByAccountIds({ banks: newState }, dummyAccount.id);
            accountIds.should.not.containEql(dummyOperation.id);

            // Check balance.
            let account = get.accountById({ banks: newState }, dummyAccount.id);
            account.balance.should.equal(account.initialBalance);
        });
    });
});

describe('Account management', () => {
    const state = {
        accessIds: ['1'],
        accessesMap: {
            '1': {
                id: '1',
                vendorId: 'manual',
                enabled: true,
                login: 'login',
                customFields: [],
                accountIds: []
            }
        },
        accountsMap: {},
        banks,
        alerts: [],
        constants: {
            defaultCurrency: 'EUR'
        }
    };

    describe('Account creation', () => {
        describe('single account addition', () => {
            let newState = addAccounts(state, [dummyAccount], [dummyOperation]);
            let account = get.accountById({ banks: newState }, dummyAccount.id);
            it('The account should be in the store', () => {
                account.id.should.equal(dummyAccount.id);
                account.initialBalance.should.equal(dummyAccount.initialBalance);
                // No attached operation
                account.accessId.should.equal(dummyAccount.accessId);
            });

            it('The account balance should be the initialBalance + the operation balance', () => {
                account.balance.should.equal(dummyAccount.initialBalance + dummyOperation.amount);
            });

            it("The account should be added to its access's account's list", () => {
                let access = get.accessById({ banks: newState }, dummyAccount.accessId);
                access.accountIds.should.containEql(dummyAccount.id);
            });

            it("The operation should be added to the account's operations list", () => {
                let operation = get.operationById({ banks: newState }, dummyOperation.id);
                checkOperation(operation, dummyOperation);
            });
        });

        describe('multiple account addition', () => {
            // Setting the translator is necessary to allow account sorting.
            setupTranslator('en');
            let newState = addAccounts(
                state,
                [dummyAccount, dummyAccount2],
                [dummyOperation, dummyOperation2]
            );
            let account = get.accountById({ banks: newState }, dummyAccount.id);
            let account2 = get.accountById({ banks: newState }, dummyAccount2.id);
            it('Both accounts should be in the store', () => {
                account.should.not.equal(null);
                account.label.should.equal(dummyAccount.label);
                account2.should.not.equal(null);
                account2.label.should.equal(dummyAccount2.label);
            });

            it("Both accounts should be in their access's list", () => {
                let access = get.accessById({ banks: newState }, dummyAccount.accessId);
                access.accountIds.should.containEql(dummyAccount.id);
                access.accountIds.should.containEql(dummyAccount2.id);
            });

            it('The operation ids should be in the operationId list of the appropriate account', () => {
                let opIds = get.operationIdsByAccountId({ banks: newState }, dummyAccount.id);
                opIds.should.containEql(dummyOperation.id);
                let opIds2 = get.operationIdsByAccountId({ banks: newState }, dummyAccount2.id);
                opIds2.should.containEql(dummyOperation2.id);
            });

            it("The operations should be added to the appropriate account's operations list", () => {
                let operation = get.operationById({ banks: newState }, dummyOperation.id);
                checkOperation(operation, dummyOperation);

                let operation2 = get.operationById({ banks: newState }, dummyOperation2.id);
                checkOperation(operation2, dummyOperation2);
            });
        });
    });

    describe('Account deletion', () => {
        describe('Delete the last account of an access', () => {
            let newState = addAccounts(state, dummyAccount, []);
            let account = get.accountById({ banks: newState }, dummyAccount.id);
            let access = get.accessById({ banks: newState }, dummyAccount.accessId);

            it('The account should be deleted from the store', () => {
                // First ensure the account is correctly added in the store
                account.id.should.equal(dummyAccount.id);
                access.accountIds.should.containEql(dummyAccount.id);
                newState = removeAccount(newState, dummyAccount.id);
                account = get.accountById({ banks: newState }, dummyAccount.id);
                should.equal(account, null);
            });

            it('The access to which the account was attached is removed from the store, as there is no more account attached to it', () => {
                access = get.accessById({ banks: newState }, dummyAccount.accessId);
                should.equal(access, null);
            });
        });

        describe('Deleting an account from an access, should not delete the access (and the remaining accounts), if the access has more than 1 account', () => {
            // Setting the translator is necessary to allow account sorting.
            setupTranslator('en');
            let newState = addAccounts(state, [dummyAccount, dummyAccount2], []);
            let account = get.accountById({ banks: newState }, dummyAccount.id);
            let account2 = get.accountById({ banks: newState }, dummyAccount2.id);
            it('The account should be removed from the store, and its access should still be in the store, ', () => {
                account.should.not.equal(null);
                account.label.should.equal(dummyAccount.label);
                account2.should.not.equal(null);
                account2.label.should.equal(dummyAccount2.label);
                newState = removeAccount(newState, dummyAccount.id);
                account = get.accountById({ banks: newState }, dummyAccount.id);
                should.equal(account, null);

                let access = get.accessById({ banks: newState }, dummyAccount.accessId);
                access.should.not.equal(null);
                access.accountIds.should.not.containEql(dummyAccount.id);
                access.accountIds.should.containEql(dummyAccount2.id);
            });
        });

        describe('Deleting an account also deletes all the attached operations', () => {
            let newState = addAccounts(state, dummyAccount, []);
            newState = addOperations(newState, dummyOperation);
            let operation = get.operationById({ banks: newState }, dummyOperation.id);
            // First ensure the operation is in the store.
            operation.should.not.equal(null);

            newState = removeAccount(newState, dummyAccount.id);

            // Now check the operation is deleted.
            operation = get.operationById({ banks: newState }, dummyOperation.id);
            should.equal(operation, null);
        });

        describe('Adding an already exising account should update it in the store', () => {
            let newState = addAccounts(state, [dummyAccount, dummyAccount2], [dummyOperation]);

            // Check the accounts are in the store.
            let readDummyAccount = get.accountById({ banks: newState }, dummyAccount.id);
            readDummyAccount.should.not.equal(null);
            readDummyAccount.operationIds.length.should.equal(1);
            readDummyAccount.operationIds.should.containDeep([dummyOperation.id]);

            let readDummyAccount2 = get.accountById({ banks: newState }, dummyAccount2.id);
            readDummyAccount2.should.not.equal(null);
            readDummyAccount2.operationIds.length.should.equal(0);

            // Update the store with an updated account.
            let newDummyAccount = {
                ...dummyAccount,
                customLabel: 'new label',
                initialBalance: 200
            };
            let newDummyOperation = { ...dummyOperation, id: 'operation3', amount: -500 };
            newState = addAccounts(newState, newDummyAccount, [newDummyOperation]);

            // Ensure the "added again" account is updated, and the other is not changed.
            let updatedAccount = get.accountById({ banks: newState }, dummyAccount.id);

            updatedAccount.should.not.deepEqual(readDummyAccount);
            updatedAccount.customLabel.should.equal(newDummyAccount.customLabel);
            updatedAccount.operationIds.length.should.equal(2);
            updatedAccount.operationIds.should.containDeep([
                newDummyOperation.id,
                dummyOperation.id
            ]);
            updatedAccount.balance.should.equal(
                newDummyAccount.initialBalance + newDummyOperation.amount + dummyOperation.amount
            );

            get.accountById({ banks: newState }, dummyAccount2.id).should.deepEqual(
                readDummyAccount2
            );
        });
    });

    describe('Account update', () => {
        it('The account should be updated', () => {
            let newState = addAccounts(state, dummyAccount, []);
            let account = get.accountById({ banks: newState }, dummyAccount.id);
            account.should.not.equal(null);
            newState = updateAccountFields(newState, dummyAccount.id, { initialBalance: 0 });
            account = get.accountById({ banks: newState }, dummyAccount.id);
            account.initialBalance.should.equal(0);
        });
    });
});

describe('Access management', () => {
    describe('Access creation', () => {
        it('the access should be added to the store', () => {
            let newState = addAccesses(dummyState, [dummyAccess], [], []);
            get.accessIds({ banks: newState }).should.containEql(dummyAccess.id);
            let access = get.accessById({ banks: newState }, dummyAccess.id);
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
            let newState = addAccesses(dummyState, [dummyAccess], [], []);
            let access = get.accessById({ banks: newState }, dummyAccess.id);
            get.accessIds({ banks: newState }).should.containEql(dummyAccess.id);
            should.equal(access.id, dummyAccess.id);

            newState = removeAccess(newState, dummyAccess.id);
            // Ensure the access is deleted.
            should.equal(get.accessById({ banks: newState }, dummyAccess.id), null);
            get.accessIds({ banks: newState }).should.not.containEql(dummyAccess.id);
        });

        it('All attached accounts should be deleted from the store', () => {
            let newState = addAccesses(dummyState, [dummyAccess], [], []);
            newState = addAccounts(newState, dummyAccount, []);
            get.accountById({ banks: newState }, dummyAccount.id).should.not.equal(null);

            newState = removeAccess(newState, dummyAccess.id);
            should.equal(get.accountById({ banks: newState }, dummyAccount.id), null);
            get.accessIds({ banks: newState }).should.not.containEql(dummyAccess.id);
        });
    });
    describe('Access update', () => {
        it('The access should be updated in the store', () => {
            // First we create an access.
            let newState = addAccesses(dummyState, [dummyAccess], [], []);
            let access = get.accessById({ banks: newState }, dummyAccess.id);
            get.accessIds({ banks: newState }).should.containEql(dummyAccess.id);
            should.equal(access.id, dummyAccess.id);

            newState = updateAccessFields(newState, dummyAccess.id, { login: 'newlogin' });
            access = get.accessById({ banks: newState }, dummyAccess.id);
            access.login.should.equal('newlogin');
        });
    });
});
