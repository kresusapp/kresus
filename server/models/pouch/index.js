import Users from './users';

import { assert, makeLogger } from '../../helpers';

const log = makeLogger('models');

async function createDefaultUser() {
    let { login } = process.kresus.user;
    assert(login, 'There should be a default login set!');

    // Leave other fields empty for now.
    let email = '';
    let password = '';

    let user = await Users.exists({ login, email });
    if (!user) {
        user = await Users.create({ login, email, password });
    }

    process.kresus.user.id = user.id;
}

module.exports = async function init() {
    try {
        log.info('initializing models...');

        await createDefaultUser();

        log.info('done initializing models!');
    } catch (e) {
        log.error('during models initialization:', e);
    }
};
