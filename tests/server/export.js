// There's a bug between eslint and prettier with spacing around async arrow
// functions, so we need to explicitly use async functions instead.
/* eslint-disable prefer-arrow-callback */
import should from 'should';

import { Access, User } from '../../server/models';
import { testing, importData } from '../../server/controllers/all';

const { getAllData: exportData } = testing;

async function cleanAll(userId) {
    await Access.destroyAll(userId);
}

let USER_ID = null;
before(async () => {
    // Reload the USER_ID from the database, since process.kresus.user.id which
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
});

describe('export', () => {
    before(async function() {
        await cleanAll(USER_ID);
    });

    const world = {
        accesses: [
            {
                id: 0,
                vendorId: 'manual',
                login: 'whatever-manual-acc--does-not-care',
                password: 'strongestpassindaworld',
                session: '{}'
            }
        ]
    };

    it('should run the import properly', async function() {
        await importData(USER_ID, world);

        const accesses = await Access.all(USER_ID);
        accesses.length.should.equal(world.accesses.length);
        accesses[0].password.should.equal(world.accesses[0].password);
        accesses[0].session.should.equal(world.accesses[0].session);
    });

    it('should not export access password/session unless asked', async function() {
        const { accesses } = await exportData(USER_ID);
        accesses.length.should.equal(world.accesses.length);
        for (const access of accesses) {
            should.not.exist(access.password);
            should.not.exist(access.session);
        }
    });

    it('should export access password/session if asked', async function() {
        const { accesses } = await exportData(USER_ID, { isExport: true, cleanPassword: false });
        accesses.length.should.equal(world.accesses.length);
        accesses[0].password.should.equal(world.accesses[0].password);
        accesses[0].session.should.equal(world.accesses[0].session);
    });

    it('should not return sessions if not an export (API call)', async function() {
        const { accesses } = await exportData(USER_ID, { isExport: false, cleanPassword: false });
        accesses.length.should.equal(world.accesses.length);
        for (const access of accesses) {
            should.not.exist(access.session);
        }
    });
});
