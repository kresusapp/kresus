import { makeLogger } from './helpers';

import { setupOrm } from './models';
import Users from './models/users';

let log = makeLogger('cli');

export async function createUser(login) {
    try {
        log.info(`Creating user with login ${login}: setting up database.`);
        await setupOrm();
        log.info('Database set up; creating user...');
        let user = await Users.create({ login });
        let id = user.id;
        log.info(`User ${login} created with success! id=${id}`);
    } catch (err) {
        log.error(`Couldn't create user ${login}: ${err.message}
${err.stack}`);
    }
}
