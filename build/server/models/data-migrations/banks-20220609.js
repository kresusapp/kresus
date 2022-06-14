"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBanks = void 0;
const __1 = require("../");
const helpers_1 = require("../../helpers");
const log = (0, helpers_1.makeLogger)('models/data-migrations');
async function updateBanks(userId, manager) {
    // Do not use transactions, as this code might be called from migrations which are already
    // happening in a transaction.
    log.info('Running data migration on banks (2022-06-09)');
    // Fix migrations banks-20200414 & banks-20210814 not renaming
    // the vendorId in Accounts too.
    const userCondition = {};
    if (userId !== null) {
        userCondition.userId = userId;
    }
    await manager.update(__1.Account, {
        vendorId: 'bnporc',
        ...userCondition,
    }, { vendorId: 'bnp' });
    await manager.update(__1.Account, {
        vendorId: 'cmmc',
        ...userCondition,
    }, { vendorId: 'creditmutuel' });
    log.info('Finished running data migration on banks (2022-06-09)');
}
exports.updateBanks = updateBanks;
