import should from 'should';
import semver from 'semver';

import { get } from '../client/store';
import { MIN_WEBOOB_VERSION, normalizeVersion, checkWeboobMinimalVersion } from '../server/helpers';
import {
    addOperation,
    removeOperation,
    updateOperation,
    operationById,
    operationsByAccountId,
    accountById
} from '../client/store/banks';

import DefaultSettings from '../shared/default-settings';

function makeStateInitialAccountId(defaultId, accesses, accounts) {
    return {
        banks: {
            accounts,
            accesses,
            defaultAccountId: defaultId
        }
    };
}

describe('getters', () => {
    describe("'isWeboobInstalled'", () => {
        describe('should return false when', () => {
            it("'weboob-version' < MIN_WEBOOB_VERSION", () => {
                let version = '0.0.1';
                checkWeboobMinimalVersion(version).should.equal(false);
            });

            it("'weboob-version' === 0.h", () => {
                let version = '0.h';
                checkWeboobMinimalVersion(version).should.equal(false);
            });
        });

        describe('should return true when', () => {
            it("'weboob-version' === MIN_WEBOOB_VERSION", () => {
                let version = MIN_WEBOOB_VERSION;
                checkWeboobMinimalVersion(version).should.equal(true);
            });

            it("'weboob-version' > MIN_WEBOOB_VERSION", () => {
                let version = semver.inc(normalizeVersion(MIN_WEBOOB_VERSION), 'minor');
                checkWeboobMinimalVersion(version).should.equal(true);
            });
        });
    });

    describe("'initialAccountId' should return", () => {
        it('the defaultAccountId if it is set', () => {
            get
                .initialAccountId(makeStateInitialAccountId('defaultId', [], []))
                .should.equal('defaultId');
        });
        it('the first account id in the list if no defaultAccountId is set', () => {
            let accesses = [{ id: 'idAccess' }, { id: 'idAccess1' }];
            let accounts = [
                { id: 'id', bankAccess: 'idAccess' },
                { id: 'id1', bankAccess: 'idAccess' },
                { id: 'id2', bankAccess: 'idAccess1' }
            ];
            get
                .initialAccountId(makeStateInitialAccountId('', accesses, accounts))
                .should.equal('id');
        });
        it('The DefaultSetting for "defaultAccountId", if no defaultAccountId is set and there is no access and no account', () => {
            get
                .initialAccountId(makeStateInitialAccountId('', [], []))
                .should.equal(DefaultSettings.get('defaultAccountId'));
        });
    });

    describe("'accessByAccountId'", () => {
        describe('should return null', () => {
            it('if the accountId is unknown', () => {
                should.equal(
                    get.accessByAccountId(makeStateInitialAccountId('', [], []), 'id'),
                    null
                );
                should.equal(
                    get.accessByAccountId(makeStateInitialAccountId('', [], [{ id: 'id' }]), 'id1'),
                    null
                );
            });

            it('if the accountId is known but not the accessId', () => {
                should.equal(
                    get.accessByAccountId(
                        makeStateInitialAccountId('', [], [{ id: 'id', bankAccess: 'id2' }]),
                        'id'
                    ),
                    null
                );
                should.equal(
                    get.accessByAccountId(
                        makeStateInitialAccountId(
                            '',
                            [{ id: 'id3' }],
                            [{ id: 'id', bankAccess: 'id2' }]
                        ),
                        'id'
                    ),
                    null
                );
            });
        });
        it('should return the appropriate access if the accountId and related accessId are known', () => {
            let accesses = [{ id: 'idAccess' }, { id: 'idAccess1' }];
            let accounts = [
                { id: 'id', bankAccess: 'idAccess' },
                { id: 'id1', bankAccess: 'idAccess' },
                { id: 'id2', bankAccess: 'idAccess1' }
            ];
            // Trying different cases, to ensure there is no edge case
            get
                .accessByAccountId(makeStateInitialAccountId('', accesses, accounts), 'id')
                .id.should.equal('idAccess');
            get
                .accessByAccountId(makeStateInitialAccountId('', accesses, accounts), 'id1')
                .id.should.equal('idAccess');
            get
                .accessByAccountId(makeStateInitialAccountId('', accesses, accounts), 'id2')
                .id.should.equal('idAccess1');
        });
    });
});

function makeStore() {
    return {
        accountsMap: {
            '1': {
                id: '1',
                accountNumber: 'Number1',
                operations: ['2', '1'],
                balance: 3000,
                initialAmount: 2850
            }
        },
        operationsMap: {
            '1': {
                date: new Date('01/01/02'),
                label: 'LABEL',
                bankAccount: 'Number1',
                amount: 50
            },
            '2': {
                date: new Date('02/01/02'),
                label: 'LABEL',
                amount: 100
            }
        }
    };
}
describe('addOperation', () => {
    describe('defect situations', () => {
        it('if the operation has no id, the heper should raise', () => {
            (function() {
                addOperation(makeStore(), { date: new Date('03/01/02'), label: 'LABEL' });
            }.should.throw());
        });
        it('if the operation is not attached to an existing account', () => {
            (function() {
                addOperation(makeStore(), {
                    date: new Date('03/01/02'),
                    title: 'LABEL',
                    id: '1',
                    bankAccount: 'Number2',
                    amount: 1.5,
                    raw: 'raw'
                });
            }.should.throw());
        });
    });
    describe('normal situation', () => {
        it('the operation should be in the store and the array of operation ids attached to the account is sorted', () => {
            let newStore = addOperation(makeStore(), {
                date: new Date('03/01/02'),
                title: 'LABEL',
                id: '3',
                bankAccount: 'Number1',
                amount: 1.5,
                raw: 'raw'
            });
            should.exist(operationById(newStore, '3'));
            // The operation id is the first in the list.
            operationsByAccountId(newStore, '1')[0].should.equal('3');
            newStore = addOperation(makeStore(), {
                date: new Date('03/01/01'),
                title: 'LABEL',
                id: '3',
                bankAccount: 'Number1',
                amount: 1.5,
                raw: 'raw'
            });
            should.exist(operationById(newStore, '3'));
            operationsByAccountId(newStore, '1')[2].should.equal('3');
            accountById(newStore, '1').balance.should.equal(3001.5);
        });
    });
});
describe('removeOperation', () => {
    describe('normal situation', () => {
        it('the operation shoud be deleted from the operation map and the array of operation ids attached to the account', () => {
            let newState = removeOperation(makeStore(), '1');
            should.equal(operationById(newState, '1'), null);
            operationsByAccountId(newState, '1').should.not.containDeep('1');
            accountById(newState, '1').balance.should.equal(2950);
        });
    });
});
describe('updateOperation', () => {
    describe('defect situation', () => {
        it('should raise if we try to update an unknown operation', () => {
            (function() {
                updateOperation(makeStore(), '0', { update: 'update' });
            }.should.throw());
        });
    });
    describe('normal situation', () => {
        it('the update should be applied', () => {
            let newState = updateOperation(makeStore(), '1', { label: 'LABEL 2' });
            let op = operationById(newState, '1');
            op.label.should.equal('LABEL 2');
        });
    });
});
