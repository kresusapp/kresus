"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBanks = void 0;
/* eslint new-cap: ["error", { "capIsNewExceptions": ["In"] }]*/
const typeorm_1 = require("typeorm");
const __1 = require("../");
const helpers_1 = require("../../helpers");
const log = helpers_1.makeLogger('models/data-migrations');
async function updateBanks(userId, manager) {
    // Do not use transactions, as this code might be called from migrations which are already
    // happening in a transaction.
    log.info('Running data migration on banks (2020-04-14)');
    // Remove access fields from boursorama, cmmc, ganassurances.
    const userCondition = {};
    if (userId !== null) {
        userCondition.userId = userId;
    }
    const accesses = await manager.find(__1.Access, {
        select: ['id'],
        where: {
            vendorId: typeorm_1.In(['boursorama', 'cmmc', 'ganassurances']),
            ...userCondition,
        },
    });
    if (accesses.length > 0) {
        await manager.delete(__1.AccessField, {
            accessId: typeorm_1.In(accesses.map(acc => acc.id)),
            ...userCondition,
        });
        // Migrate cmmc to creditmutuel.
        await manager.update(__1.Access, {
            vendorId: 'cmmc',
            ...userCondition,
        }, { vendorId: 'creditmutuel' });
    }
    log.info('Finished running data migration on banks (2020-04-14)');
}
exports.updateBanks = updateBanks;
