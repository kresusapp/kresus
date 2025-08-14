import { makeLogger } from './helpers';

import { setupOrm, User } from './models';

const log = makeLogger('cli');

export async function createUser(login: string, isAdmin = false) {
    try {
        log.info(`Creating user with login ${login}: setting up database.`);
        await setupOrm();
        log.info(`Database set up; creating user (admin: ${isAdmin})...`);

        // Let's avoid a dangerous migration to add a unique key on the login and just check if a
        // user already exists with that login.
        const existingUser = await User.findByLogin(login);
        if (existingUser) {
            throw new Error('A user already exists with that login!');
        }

        const user = await User.create({ login, isAdmin });
        const id = user.id;
        log.info(`User ${login} created with success! id=${id}`);
        return user.id;
    } catch (err) {
        throw new Error(`Couldn't create user ${login}: ${err.message}
${err.stack}`);
    }
}

export async function deleteUser(login: string) {
    try {
        log.info(`Deleting user with login ${login}: setting up database.`);
        await setupOrm();
        log.info(`Database set up; deleting user...`);
        const user = await User.findByLogin(login);
        if (!user) {
            throw new Error('No user with this login');
        }

        await User.destroy(user.id);
        log.info(`User ${login} deleted with success!`);
    } catch (err) {
        throw new Error(`Couldn't delete user ${login}: ${err.message} ${err.stack}`);
    }
}
