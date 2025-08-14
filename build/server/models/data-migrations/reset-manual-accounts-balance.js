"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetManualBankAccountsBalance = resetManualBankAccountsBalance;
/* eslint new-cap: ["error", { "capIsNewExceptions": ["In"] }]*/
const typeorm_1 = require("typeorm");
const __1 = require("..");
const helpers_1 = require("../../helpers");
const log = (0, helpers_1.makeLogger)('models/data-migrations');
async function resetManualBankAccountsBalance(userId, manager) {
    // Do not use transactions, as this code might be called from migrations which are already
    // happening in a transaction.
    log.info('Running data migration on manual bank (resetting balance)');
    // Reset the manual accounts balance to NULL so that the balance is computed from the
    // transactions.
    const userCondition = {};
    if (userId !== null) {
        userCondition.userId = userId;
    }
    const accesses = await manager.find(__1.Access, {
        select: ['id'],
        where: {
            vendorId: (0, typeorm_1.In)(['manual', 'demo']),
            ...userCondition,
        },
    });
    if (accesses.length > 0) {
        const accessesIds = accesses.map(acc => acc.id);
        await manager.update(__1.Account, {
            accessId: (0, typeorm_1.In)(accessesIds),
        }, { balance: null });
    }
    log.info('Finished running data migration on manual bank (resetting balance)');
}
