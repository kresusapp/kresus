"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const banks_20200414_1 = require("./banks-20200414");
async function runDataMigrations(userId) {
    const manager = typeorm_1.getManager();
    const migrations = [banks_20200414_1.updateBanks];
    for (const migration of migrations) {
        await migration(userId, manager);
    }
}
exports.default = runDataMigrations;
