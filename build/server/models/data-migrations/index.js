"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
const banks_20200414_1 = require("./banks-20200414");
const banks_20210526_1 = require("./banks-20210526");
const banks_20210814_1 = require("./banks-20210814");
const banks_20220609_1 = require("./banks-20220609");
const banks_20240502_1 = require("./banks-20240502");
const set_default_balance_1 = require("./set-default-balance");
const remove_migrated_from_cozydb_1 = require("./remove-migrated-from-cozydb");
const remove_woob_nss_setting_1 = require("./remove-woob-nss-setting");
const MIGRATIONS = [
    banks_20200414_1.updateBanks,
    remove_migrated_from_cozydb_1.run,
    banks_20210526_1.updateBanks,
    banks_20210814_1.updateBanks,
    set_default_balance_1.setDefaultRealBalance,
    banks_20220609_1.updateBanks,
    remove_woob_nss_setting_1.run,
    banks_20240502_1.updateBanks,
];
async function runDataMigrations(userId) {
    const manager = (0, __1.getManager)();
    for (const migration of MIGRATIONS) {
        await migration(userId, manager);
    }
}
exports.default = runDataMigrations;
