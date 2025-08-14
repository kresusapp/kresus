"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBanks = updateBanks;
/* eslint new-cap: ["error", { "capIsNewExceptions": ["In"] }]*/
const typeorm_1 = require("typeorm");
const __1 = require("../");
const helpers_1 = require("../../helpers");
const log = (0, helpers_1.makeLogger)('models/data-migrations');
async function updateBanks(userId, manager) {
    // Do not use transactions, as this code might be called from migrations which are already
    // happening in a transaction.
    log.info('Running data migration on banks (2024-05-02)');
    // Remove access fields from banquepopulaire, as they've changed.
    const userCondition = {};
    if (userId !== null) {
        userCondition.userId = userId;
    }
    const accesses = await manager.find(__1.Access, {
        select: ['id'],
        where: {
            vendorId: 'banquepopulaire',
            ...userCondition,
        },
    });
    if (accesses.length > 0) {
        await manager.delete(__1.AccessField, {
            accessId: (0, typeorm_1.In)(accesses.map(acc => acc.id)),
            ...userCondition,
        });
        // Also clear the password to force the user to update.
        await manager.update(__1.Access, {
            id: (0, typeorm_1.In)(accesses.map(acc => acc.id)),
            ...userCondition,
        }, { password: null });
    }
    log.info('Finished running data migration on banks (2024-05-02)');
}
