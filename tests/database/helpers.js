import assert from 'node:assert';

import { Access } from '../../server/models';
import { bulkDelete } from '../../server/models/helpers';

describe('Models helpers', () => {
    let USER_ID = null;
    before(() => {
        // applyConfig must have already been called.
        USER_ID = process.kresus.defaultUser.id;
    });

    describe('bulkDelete should delete as expected', () => {
        before(async () => {
            await Access.destroyAll(USER_ID);
        });

        it('The entities should be removed from the database', async () => {
            // This should work for any repository but let's test the Access repository at least.
            const dummyAccessData = {
                login: 'login',
                password: 'password',
                vendorId: 'gnagnagna',
            };

            const accessesIds = [];

            // This should work for thousands of entities but let's test with 2 to avoid bloating
            // the tests.
            let access = await Access.create(USER_ID, dummyAccessData);
            accessesIds.push(access.id);

            access = await Access.create(USER_ID, dummyAccessData);
            accessesIds.push(access.id);

            let allAccesses = await Access.all(USER_ID);
            assert.strictEqual(allAccesses.length, accessesIds.length);

            await bulkDelete(Access.repo(), accessesIds);
            allAccesses = await Access.all(USER_ID);
            assert.strictEqual(allAccesses.length, 0);
        });
    });
});
