"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUser = createUser;
exports.deleteUser = deleteUser;
const helpers_1 = require("./helpers");
const models_1 = require("./models");
const log = (0, helpers_1.makeLogger)('cli');
async function createUser(login, isAdmin = false) {
    try {
        log.info(`Creating user with login ${login}: setting up database.`);
        await (0, models_1.setupOrm)();
        log.info(`Database set up; creating user (admin: ${isAdmin})...`);
        // Let's avoid a dangerous migration to add a unique key on the login and just check if a
        // user already exists with that login.
        const existingUser = await models_1.User.findByLogin(login);
        if (existingUser) {
            throw new Error('A user already exists with that login!');
        }
        const user = await models_1.User.create({ login, isAdmin });
        const id = user.id;
        log.info(`User ${login} created with success! id=${id}`);
        return user.id;
    }
    catch (err) {
        throw new Error(`Couldn't create user ${login}: ${err.message}
${err.stack}`);
    }
}
async function deleteUser(login) {
    try {
        log.info(`Deleting user with login ${login}: setting up database.`);
        await (0, models_1.setupOrm)();
        log.info(`Database set up; deleting user...`);
        const user = await models_1.User.findByLogin(login);
        if (!user) {
            throw new Error('No user with this login');
        }
        await models_1.User.destroy(user.id);
        log.info(`User ${login} deleted with success!`);
    }
    catch (err) {
        throw new Error(`Couldn't delete user ${login}: ${err.message} ${err.stack}`);
    }
}
