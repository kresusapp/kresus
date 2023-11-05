"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBanks = void 0;
/* eslint new-cap: ["error", { "capIsNewExceptions": ["In"] }]*/
const typeorm_1 = require("typeorm");
const __1 = require("../");
const helpers_1 = require("../../helpers");
const log = (0, helpers_1.makeLogger)('models/data-migrations');
async function updateBanks(userId, manager) {
    // Do not use transactions, as this code might be called from migrations which are already
    // happening in a transaction.
    log.info('Running data migration on banks (2023-09-26)');
    const userCondition = {};
    if (userId !== null) {
        userCondition.userId = userId;
    }
    // Rename barclays to milleis.
    log.info('> Renaming barclays to milleis...');
    await manager.update(__1.Access, {
        vendorId: 'barclays',
        ...userCondition,
    }, { vendorId: 'milleis' });
    // Rename aviva to abeilleassurances.
    log.info('> Renaming aviva to abeilleassurances...');
    await manager.update(__1.Access, {
        vendorId: 'aviva',
        ...userCondition,
    }, { vendorId: 'abeilleassurances' });
    // Remove access fields from allianzbank and milleis.
    const accesses = await manager.find(__1.Access, {
        select: ['id'],
        where: {
            vendorId: (0, typeorm_1.In)(['allianzbanque', 'milleis']),
            ...userCondition,
        },
    });
    if (accesses.length > 0) {
        await manager.delete(__1.AccessField, {
            accessId: (0, typeorm_1.In)(accesses.map(acc => acc.id)),
            ...userCondition,
        });
    }
    log.info('Finished running data migration on banks (2023-09-26)');
}
exports.updateBanks = updateBanks;
