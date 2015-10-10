import {module as americano} from '../db';

// Note: because of a bug in cozy-db-pouchdb, the functions *must* be anonymous.
// See also https://github.com/cozy/cozy-db/issues/33 .
let allByName               = function(doc) { emit(doc.name, doc); }
let allByBank               = function(doc) { emit(doc.bank, doc); }
let allByBankAccess         = function(doc) { emit(doc.bankAccess, doc); }
let allByBankAccount        = function(doc) { emit(doc.bankAccount, doc); }
let allByCategory           = function(doc) { emit(doc.categoryId, doc); }
let allByWeboobValue        = function(doc) { emit(doc.weboobvalue, doc); }
let byUuid                  = function(doc) { emit(doc.uuid, doc); }
let allReportsByFrequency   = function(doc) { emit([doc.type, doc.frequency], doc); }
let allByBankAccountAndType = function(doc) { emit([doc.bankAccount, doc.type], doc); }
let allByBankAccountAndDate = function(doc) { emit([doc.bankAccount, doc.date], doc); }
let allAccessesLike         = function(doc) { emit([doc.bank, doc.login, doc.password], doc); }
let allAccountsLike         = function(doc) { emit([doc.bank, doc.accountNumber], doc); }
let allOperationsLike       = function(doc) { emit([doc.bankAccount, doc.date, doc.amount.toFixed(2), doc.raw], doc); }

let getBanksWithAccounts = {
    map(doc) {
        emit(doc.bank, 1);
    },
    reduce(keys, values, rereduce) {
        return 1;
    }
};

export default {
    bank: {
        all: americano.defaultRequests.all,
        byUuid,
    },

    access: {
        all: americano.defaultRequests.all,
        allByBank,
        allLike: allAccessesLike,
    },

    account: {
        all: americano.defaultRequests.all,
        allByBankAccess,
        allByBank,
        allLike: allAccountsLike,
        bankWithAccounts: getBanksWithAccounts
    },

    operation: {
        all: americano.defaultRequests.all,
        allByBankAccount,
        allByBankAccountAndDate,
        allByCategory,
        allLike: allOperationsLike
    },

    alert: {
        all: americano.defaultRequests.all,
        allByBankAccount,
        allReportsByFrequency,
        allByBankAccountAndType
    },

    category: {
        all: americano.defaultRequests.all,
    },

    kresusconfig: {
        all: americano.defaultRequests.all,
        byName: allByName
    },

    operationtype: {
        all: americano.defaultRequests.all,
        byWeboobValue: allByWeboobValue
    }
};
