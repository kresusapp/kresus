"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = runDataMigrations;
const __1 = require("..");
const remove_migrated_from_cozydb_1 = require("./remove-migrated-from-cozydb");
const remove_woob_nss_setting_1 = require("./remove-woob-nss-setting");
const MIGRATIONS = [remove_migrated_from_cozydb_1.run, remove_woob_nss_setting_1.run];
async function runDataMigrations(userId) {
    const manager = (0, __1.getManager)();
    for (const migration of MIGRATIONS) {
        await migration(userId, manager);
    }
}
