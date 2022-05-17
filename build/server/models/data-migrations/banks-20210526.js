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
    log.info('Running data migration on banks (2021-05-26)');
    // Remove access fields from boursorama, cmmc, ganassurances.
    const userCondition = {};
    if (userId !== null) {
        userCondition.userId = userId;
    }
    // Remove the `auth_type` access field in both creditcooperatif and
    // btpbanque, which is now optional and whose set of possible value have
    // been updated.
    log.info('> Removing auth_type on creditcooperatif/btpbanque...');
    let accesses = await manager.find(__1.Access, {
        select: ['id'],
        where: {
            vendorId: (0, typeorm_1.In)(['creditcooperatif', 'btpbanque']),
            ...userCondition,
        },
    });
    if (accesses.length > 0) {
        await manager.delete(__1.AccessField, {
            accessId: (0, typeorm_1.In)(accesses.map(acc => acc.id)),
            name: 'auth_type',
            ...userCondition,
        });
    }
    // Remove the "website" field from the bred module; it's now unused.
    log.info('> Removing website on bred...');
    accesses = await manager.find(__1.Access, {
        select: ['id'],
        where: {
            vendorId: 'bred',
            ...userCondition,
        },
    });
    if (accesses.length > 0) {
        await manager.delete(__1.AccessField, {
            accessId: (0, typeorm_1.In)(accesses.map(acc => acc.id)),
            name: 'website',
            ...userCondition,
        });
    }
    log.info('Finished running data migration on banks (2021-05-26)');
}
exports.updateBanks = updateBanks;
