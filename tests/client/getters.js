import should from 'should';

import { get } from '../../client/store';
import DefaultSettings from '../../shared/default-settings';

function makeStateInitialAccountId(defaultId, accesses, accounts) {
    return {
        banks: {
            accountsMap: accounts.reduce((map, account) => {
                map[account.id] = account;
                return map;
            }, {}),
            accessIds: accesses.map(access => access.id),
            accessesMap: accesses.reduce((map, access) => {
                map[access.id] = access;
                return map;
            }, {}),
            defaultAccountId: defaultId
        }
    };
}

describe('client getters', () => {
    describe("'initialAccountId' should return", () => {
        it('the defaultAccountId if it is set', () => {
            get.initialAccountId(makeStateInitialAccountId('defaultId', [], [])).should.equal(
                'defaultId'
            );
        });
        it('the first account id of the first access in the list of accessIds if no defaultAccountId is set', () => {
            let accesses = [
                { id: 'idAccess', accountIds: ['id', 'id1'] },
                { id: 'idAccess1', accounts: ['id2'] }
            ];
            let accounts = [
                { id: 'id', accessId: 'idAccess' },
                { id: 'id1', accessId: 'idAccess' },
                { id: 'id2', accessId: 'idAccess1' }
            ];
            get.initialAccountId(makeStateInitialAccountId('', accesses, accounts)).should.equal(
                'id'
            );
        });
        it('The DefaultSetting for "defaultAccountId", if no defaultAccountId is set and there is no access and no account', () => {
            get.initialAccountId(makeStateInitialAccountId('', [], [])).should.equal(
                DefaultSettings.get('default-account-id')
            );
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
                        makeStateInitialAccountId('', [], [{ id: 'id', accessId: 'id2' }]),
                        'id'
                    ),
                    null
                );
                should.equal(
                    get.accessByAccountId(
                        makeStateInitialAccountId(
                            '',
                            [{ id: 'id3' }],
                            [{ id: 'id', accessId: 'id2' }]
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
                { id: 'id', accessId: 'idAccess' },
                { id: 'id1', accessId: 'idAccess' },
                { id: 'id2', accessId: 'idAccess1' }
            ];
            // Trying different cases, to ensure there is no edge case
            get.accessByAccountId(
                makeStateInitialAccountId('', accesses, accounts),
                'id'
            ).id.should.equal('idAccess');
            get.accessByAccountId(
                makeStateInitialAccountId('', accesses, accounts),
                'id1'
            ).id.should.equal('idAccess');
            get.accessByAccountId(
                makeStateInitialAccountId('', accesses, accounts),
                'id2'
            ).id.should.equal('idAccess1');
        });
    });
});
