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
function allByYearMonth()          { emit([doc.year, doc.month], doc); }
function byCategoryAndYearAndMonth()    { emit([doc.categoryId, doc.year, doc.month], doc); }
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

    accounts: {
        all: cozydb.defaultRequests.all,
        allByAccountIds,
        allByBankAccess,
        allByBank
    },

    alerts: {
        all: cozydb.defaultRequests.all,
        allByBankAccount,
        allReportsByFrequency,
        allByBankAccountAndType
    },

    operation: {
        all: cozydb.defaultRequests.all,
        allByBankAccount,
        allByBankAccountAndDate,
        allByCategory,
        allWithOperationTypesId
    },

    category: {
        all: cozydb.defaultRequests.all
    },

    budget: {
        all: cozydb.defaultRequests.all,
        allByCategory,
        allByYearMonth,
        byCategoryAndYearAndMonth
    },

    config: {
        all: cozydb.defaultRequests.all,
        byName: allByName
    },

    'deprecated-operationtype': {
        all: cozydb.defaultRequests.all,
        byWeboobValue: allByWeboobValue
    }
};
