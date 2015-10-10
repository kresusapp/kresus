import * as americano from 'cozydb';

function allByName()               { emit(doc.name, doc); }
function allByBank()               { emit(doc.bank, doc); }
function allByBankAccess()         { emit(doc.bankAccess, doc); }
function allByBankAccount()        { emit(doc.bankAccount, doc); }
function allByCategory()           { emit(doc.categoryId, doc); }
function allByWeboobValue()        { emit(doc.weboobvalue, doc); }
function byUuid()                  { emit(doc.uuid, doc); }
function allReportsByFrequency()   { emit([doc.type, doc.frequency], doc); }
function allByBankAccountAndType() { emit([doc.bankAccount, doc.type], doc); }
function allByBankAccountAndDate() { emit([doc.bankAccount, doc.date], doc); }
function allAccessesLike()         { emit([doc.bank, doc.login, doc.password], doc); }
function allAccountsLike()         { emit([doc.bank, doc.accountNumber], doc); }
function allOperationsLike()       { emit([doc.bankAccount, doc.date, doc.amount.toFixed(2), doc.raw], doc); }

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
