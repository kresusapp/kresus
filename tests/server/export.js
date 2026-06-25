import assert from 'node:assert';

import { Access, User } from '../../server/models';
import { testing, importData } from '../../server/controllers/all';

const { getAllData: exportData } = testing;

async function cleanAll(userId) {
    await Access.destroyAll(userId);
}

describe('export', () => {
    let USER_ID = null;
    before(async () => {
        // Reload the USER_ID from the database, since process.kresus.defaultUser.id which
        // might have been clobbered by another test.
        // TODO: this is bad for testing and we should fix this properly later.
        const users = await User.all();
        if (!users.length) {
            throw new Error('user should have been created!');
        }
        USER_ID = users[0].id;
        if (typeof USER_ID !== 'number') {
            throw new Error('missing user id in test.');
        }

        await cleanAll(USER_ID);
    });

    const world = {
        accesses: [
            {
                id: 0,
                vendorId: 'manual',
                session: '{}',
                // Should be migrated to fields, but legacy fields should be handled anyway.
                login: 'whatever-manual-acc--does-not-care',
                password: 'strongestpassindaworld',
            },
        ],
    };

    // Extract it now as the field will be removed on import during the migration to fields.
    const expectedPassword = world.accesses[0].password;

    it('should run the import properly', async () => {
        await importData(USER_ID, world);

        const accesses = await Access.all(USER_ID);
        assert.strictEqual(accesses.length, world.accesses.length);
        assert.strictEqual(accesses[0].password, world.accesses[0].password);
        assert.strictEqual(accesses[0].session, world.accesses[0].session);
        assert.ok(
            accesses[0].fields.some(f => f.name === 'password' && f.value === expectedPassword)
        );
    });

    it('should not export access password/session unless asked', async () => {
        const { accesses } = await exportData(USER_ID);
        assert.strictEqual(accesses.length, world.accesses.length);
        for (const access of accesses) {
            assert.ok(!('session' in access));
            assert.ok(!access.fields.some(f => f.name === 'password'));
        }
    });

    it('should export access password/session if asked', async () => {
        const { accesses } = await exportData(USER_ID, { isExport: true, cleanPassword: false });
        assert.strictEqual(accesses.length, world.accesses.length);
        assert.strictEqual(accesses[0].session, world.accesses[0].session);
        assert.ok(
            accesses[0].fields.some(f => f.name === 'password' && f.value === expectedPassword)
        );
    });

    it('should not return sessions if not an export (API call)', async () => {
        const { accesses } = await exportData(USER_ID, { isExport: false, cleanPassword: false });
        assert.strictEqual(accesses.length, world.accesses.length);
        for (const access of accesses) {
            assert.ok(!('session' in access));
        }
    });

    it('should not export userId', async () => {
        const { accesses } = await exportData(USER_ID, { isExport: true, cleanPassword: false });
        assert.strictEqual(accesses.length, world.accesses.length);
        assert.ok(!('userId' in accesses[0]));
    });
});
