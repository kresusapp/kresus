"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const banks_20200414_1 = require("./banks-20200414");
const banks_20210526_1 = require("./banks-20210526");
const banks_20210814_1 = require("./banks-20210814");
const banks_20220609_1 = require("./banks-20220609");
const set_default_balance_1 = require("./set-default-balance");
const remove_migrated_from_cozydb_1 = require("./remove-migrated-from-cozydb");
const MIGRATIONS = [
    banks_20200414_1.updateBanks,
    remove_migrated_from_cozydb_1.run,
    banks_20210526_1.updateBanks,
    banks_20210814_1.updateBanks,
    set_default_balance_1.setDefaultRealBalance,
    banks_20220609_1.updateBanks,
];
async function runDataMigrations(userId) {
    const manager = (0, typeorm_1.getManager)();
    for (const migration of MIGRATIONS) {
        await migration(userId, manager);
    }
}
exports.default = runDataMigrations;
