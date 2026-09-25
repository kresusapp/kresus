import assert from 'node:assert';

import { QueryFailedError } from 'typeorm';
import { Setting } from '../../server/models';

const DUPLICATE_KEY = 'test-duplicate-setting';

describe('Settings model API', () => {
    let USER_ID = null;
    before(async () => {
        // applyConfig must have already been called.
        USER_ID = process.kresus.defaultUser.id;
    });

    after(async () => {
        const all = await Setting.all(USER_ID);
        for (const setting of all) {
            if (setting.key === DUPLICATE_KEY) {
                await Setting.destroy(USER_ID, setting.id);
            }
        }
    });

    describe('Duplicates management', () => {
        it('creating the same setting twice should raise', async () => {
            await Setting.create(USER_ID, { key: DUPLICATE_KEY, value: 'whatever' });
            await assert.rejects(
                Setting.create(USER_ID, { key: DUPLICATE_KEY, value: 'whatever else' }),
                QueryFailedError
            );
        });
    });
});
