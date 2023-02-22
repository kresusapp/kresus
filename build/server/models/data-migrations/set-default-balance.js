"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setDefaultRealBalance = void 0;
/* eslint new-cap: ["error", { "capIsNewExceptions": ["In", "Not"] }]*/
const typeorm_1 = require("typeorm");
const __1 = require("..");
const helpers_1 = require("../../helpers");
const log = (0, helpers_1.makeLogger)('models/data-migrations');
async function setDefaultRealBalance(userId, manager) {
    // Do not use transactions, as this code might be called from migrations which are already
    // happening in a transaction.
    log.info('Running data migration on banks (setting default real balance)');
    // Reset the disabled accounts balance to the initial balance + sum of transactions for accounts
    // disabled prior to the implementation of "real" balance.
    const userCondition = {};
    if (userId) {
        userCondition.userId = userId;
    }
    // Filter non-manual accesses.
    const accesses = await manager.find(__1.Access, {
        select: ['id'],
        where: {
            vendorId: (0, typeorm_1.Not)((0, typeorm_1.In)(['manual', 'demo', 'fakewoobbank'])),
            ...userCondition,
        },
    });
    if (accesses.length > 0) {
        const accessesIds = accesses.map(acc => acc.id);
        const accounts = await manager.find(__1.Account, {
            select: ['initialBalance', 'id', 'userId', 'type'],
            where: {
                accessId: (0, typeorm_1.In)(accessesIds),
                ...userCondition,
            },
        });
        // Set the real balance to the previously computed balance.
        // On next poll for enabled accounts this will be updated thanks to the balance given by the
        // provider. For disabled accounts this will remain as before the real balance
        // implementation.
        for (const acc of accounts) {
            const computedBalance = await acc.computeBalance(acc.initialBalance);
            await __1.Account.update(acc.userId, acc.id, { balance: computedBalance });
        }
    }
    log.info('Finished running data migration on disabled banks (resetting balance)');
}
exports.setDefaultRealBalance = setDefaultRealBalance;
