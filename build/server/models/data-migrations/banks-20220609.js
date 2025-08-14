"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBanks = updateBanks;
const helpers_1 = require("../../helpers");
const log = (0, helpers_1.makeLogger)('models/data-migrations');
async function updateBanks() {
    // Do not use transactions, as this code might be called from migrations which are already
    // happening in a transaction.
    log.info('Running data migration on banks (2022-06-09)');
    log.info('Migration is obsolete, property was removed from model.');
    log.info('Finished running data migration on banks (2022-06-09)');
}
