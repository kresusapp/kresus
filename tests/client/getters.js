import should from 'should';

import { get } from '../../client/store';

function makeStateInitialAccountId(defaultId, accesses, accounts) {
    return {
        banks: {
            accountMap: accounts.reduce((map, account) => {
                map[account.id] = account;
                return map;
            }, {}),
            accessIds: accesses.map(access => access.id),
            accessMap: accesses.reduce((map, access) => {
                map[access.id] = access;
                return map;
            }, {}),
            defaultAccountId: defaultId,
        },
    };
}

describe('client getters', () => {
    describe("'accessByAccountId'", () => {
        describe('should throw', () => {
            it('if the accountId is unknown', () => {
                should.throws(() =>
                    get.accessByAccountId(makeStateInitialAccountId(null, [], []), 'id')
                );
                should.throws(() =>
                    get.accessByAccountId(
                        makeStateInitialAccountId(null, [], [{ id: 'id' }]),
                        'id1'
                    )
                );
            });

            it('if the accountId is known but not the accessId', () => {
                should.throws(() =>
                    get.accessByAccountId(
                        makeStateInitialAccountId(null, [], [{ id: 'id', accessId: 'id2' }]),
                        'id'
                    )
                );
                should.throws(() =>
                    get.accessByAccountId(
                        makeStateInitialAccountId(
                            null,
                            [{ id: 'id3' }],
                            [{ id: 'id', accessId: 'id2' }]
                        ),
                        'id'
                    )
                );
            });
        });
        it('should return the appropriate access if the accountId and related accessId are known', () => {
            let accesses = [{ id: 'idAccess' }, { id: 'idAccess1' }];
            let accounts = [
                { id: 'id', accessId: 'idAccess' },
                { id: 'id1', accessId: 'idAccess' },
                { id: 'id2', accessId: 'idAccess1' },
            ];
            // Trying different cases, to ensure there is no edge case
            get.accessByAccountId(
                makeStateInitialAccountId(null, accesses, accounts),
                'id'
            ).id.should.equal('idAccess');
            get.accessByAccountId(
                makeStateInitialAccountId(null, accesses, accounts),
                'id1'
            ).id.should.equal('idAccess');
            get.accessByAccountId(
                makeStateInitialAccountId(null, accesses, accounts),
                'id2'
            ).id.should.equal('idAccess1');
        });
    });
});
