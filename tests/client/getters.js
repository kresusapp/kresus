import assert from 'node:assert';

import { accessByAccountId } from '../../client/store/banks';

function makeStateInitialAccountId(defaultId, accesses, accounts) {
    return {
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
    };
}

describe('client getters', () => {
    describe("'accessByAccountId'", () => {
        describe('should throw', () => {
            it('if the accountId is unknown', () => {
                assert.throws(() =>
                    accessByAccountId(makeStateInitialAccountId(null, [], []), 'id')
                );
                assert.throws(() =>
                    accessByAccountId(makeStateInitialAccountId(null, [], [{ id: 'id' }]), 'id1')
                );
            });

            it('if the accountId is known but not the accessId', () => {
                assert.throws(() =>
                    accessByAccountId(
                        makeStateInitialAccountId(null, [], [{ id: 'id', accessId: 'id2' }]),
                        'id'
                    )
                );
                assert.throws(() =>
                    accessByAccountId(
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
            assert.strictEqual(
                accessByAccountId(makeStateInitialAccountId(null, accesses, accounts), 'id').id,
                'idAccess'
            );
            assert.strictEqual(
                accessByAccountId(makeStateInitialAccountId(null, accesses, accounts), 'id1').id,
                'idAccess'
            );
            assert.strictEqual(
                accessByAccountId(makeStateInitialAccountId(null, accesses, accounts), 'id2').id,
                'idAccess1'
            );
        });
    });
});
