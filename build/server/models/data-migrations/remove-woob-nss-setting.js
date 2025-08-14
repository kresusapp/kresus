"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = run;
const __1 = require("../");
const helpers_1 = require("../../helpers");
const log = (0, helpers_1.makeLogger)('models/data-migrations');
async function run(userId, manager) {
    log.info('Running data migration: remove unused woob-use-nss setting');
    const userCondition = {};
    if (userId !== null) {
        userCondition.userId = userId;
    }
    await manager.delete(__1.Setting, { key: 'woob-use-nss', ...userCondition });
    log.info('Finished data migration: remove unused woob-use-nss setting');
}
