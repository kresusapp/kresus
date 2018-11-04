import * as cozydb from 'cozydb';

/* eslint-disable */
function allByName()               { emit(doc.name, doc); }
function allByBank()               { emit(doc.bank, doc); }
function allByBankAccess()         { emit(doc.bankAccess, doc); }
function allByBankAccount()        { emit(doc.accountId, doc); }
function allByAccountIds()         { emit(doc.id, doc); }
function allByCategory()           { emit(doc.categoryId, doc); }
function allByWeboobValue()        { emit(doc.weboobvalue, doc); }
function allReportsByFrequency()   { emit([doc.type, doc.frequency], doc); }
function allByBankAccountAndType() { emit([doc.accountId, doc.type], doc); }
function allByBankAccountAndDate() { emit([doc.accountId, new Date(doc.date).toISOString().replace(/T.*$/, 'T00:00:00.000Z')], doc); }
function allWithOperationTypesId() { if (doc.hasOwnProperty('operationTypeID')) { emit(doc._id, doc); } }
/* eslint-enable */

// Loaded by cozydb, which doesn't support babel default export;
module.exports = {
    bank: {
        all: cozydb.defaultRequests.all
    },

    accesses: {
        all: cozydb.defaultRequests.all,
        allByBank
    },

    account: {
        all: cozydb.defaultRequests.all,
        allByAccountIds,
        allByBankAccess,
        allByBank
    },

    operation: {
        all: cozydb.defaultRequests.all,
        allByBankAccount,
        allByBankAccountAndDate,
        allByCategory,
        allWithOperationTypesId
    },

    alert: {
        all: cozydb.defaultRequests.all,
        allByBankAccount,
        allReportsByFrequency,
        allByBankAccountAndType
    },

    category: {
        all: cozydb.defaultRequests.all
    },

    config: {
        all: cozydb.defaultRequests.all,
        byName: allByName
    },

    operationtype: {
        all: cozydb.defaultRequests.all,
        byWeboobValue: allByWeboobValue
    }
};
