"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUser = void 0;
const helpers_1 = require("./helpers");
const models_1 = require("./models");
const log = (0, helpers_1.makeLogger)('cli');
async function createUser(login) {
    try {
        log.info(`Creating user with login ${login}: setting up database.`);
        await (0, models_1.setupOrm)();
        log.info('Database set up; creating user...');
        const user = await models_1.User.create({ login });
        const id = user.id;
        log.info(`User ${login} created with success! id=${id}`);
    }
    catch (err) {
        log.error(`Couldn't create user ${login}: ${err.message}
${err.stack}`);
    }
}
exports.createUser = createUser;
