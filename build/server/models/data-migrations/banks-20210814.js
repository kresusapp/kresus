"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBanks = void 0;
const __1 = require("../");
const helpers_1 = require("../../helpers");
const log = (0, helpers_1.makeLogger)('models/data-migrations');
async function updateBanks(userId, manager) {
    // Do not use transactions, as this code might be called from migrations which are already
    // happening in a transaction.
    log.info('Running data migration on banks (2021-08-14)');
    // Remove access fields from boursorama, cmmc, ganassurances.
    const userCondition = {};
    if (userId !== null) {
        userCondition.userId = userId;
    }
    // Rename bnporc to bnp.
    log.info('> Renaming bnporc to bnp...');
    await manager.update(__1.Access, {
        vendorId: 'bnporc',
        ...userCondition,
    }, { vendorId: 'bnp' });
    log.info('Finished running data migration on banks (2021-08-14)');
}
exports.updateBanks = updateBanks;
