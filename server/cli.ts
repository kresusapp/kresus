import { makeLogger } from './helpers';

import { setupOrm, User } from './models';

const log = makeLogger('cli');

export async function createUser(login: string, isAdmin = false) {
    try {
        log.info(`Creating user with login ${login}: setting up database.`);
        await setupOrm();
        log.info(`Database set up; creating user (admin: ${isAdmin})...`);
        const user = await User.create({ login, isAdmin });
        const id = user.id;
        log.info(`User ${login} created with success! id=${id}`);
    } catch (err) {
        log.error(`Couldn't create user ${login}: ${err.message}
${err.stack}`);
    }
}
