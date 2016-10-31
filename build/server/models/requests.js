'use strict';

var _cozydb = require('cozydb');

var americano = _interopRequireWildcard(_cozydb);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

/* eslint-disable */
function allByName() {
    emit(doc.name, doc);
}
function allByBank() {
    emit(doc.bank, doc);
}
function allByBankAccess() {
    emit(doc.bankAccess, doc);
}
function allByBankAccount() {
    emit(doc.bankAccount, doc);
}
function allByAccountNumber() {
    emit(doc.accountNumber, doc);
}
function allByCategory() {
    emit(doc.categoryId, doc);
}
function allByWeboobValue() {
    emit(doc.weboobvalue, doc);
}
function byUuid() {
    emit(doc.uuid, doc);
}
function allReportsByFrequency() {
    emit([doc.type, doc.frequency], doc);
}
function allByBankAccountAndType() {
    emit([doc.bankAccount, doc.type], doc);
}
function allByBankAccountAndDate() {
    emit([doc.bankAccount, doc.date], doc);
}
function allAccessesLike() {
    emit([doc.bank, doc.login, doc.password], doc);
}
function allAccountsLike() {
    emit([doc.bank, doc.accountNumber], doc);
}
function allOperationsLike() {
    emit([doc.bankAccount, doc.date, doc.amount.toFixed(2), doc.raw], doc);
}
function allWithOperationTypesId() {
    if (doc.hasOwnProperty('operationTypeID')) {
        emit(doc._id, doc);
    }
}
/* eslint-enable */

// Loaded by americano, which doesn't support babel default export;
module.exports = {
    bank: {
        all: americano.defaultRequests.all,
        byUuid: byUuid
    },

    access: {
        all: americano.defaultRequests.all,
        allByBank: allByBank,
        allLike: allAccessesLike
    },

    account: {
        all: americano.defaultRequests.all,
        allByAccountNumber: allByAccountNumber,
        allByBankAccess: allByBankAccess,
        allByBank: allByBank,
        allLike: allAccountsLike
    },

    operation: {
        all: americano.defaultRequests.all,
        allByBankAccount: allByBankAccount,
        allByBankAccountAndDate: allByBankAccountAndDate,
        allByCategory: allByCategory,
        allLike: allOperationsLike,
        allWithOperationTypesId: allWithOperationTypesId
    },

    alert: {
        all: americano.defaultRequests.all,
        allByBankAccount: allByBankAccount,
        allReportsByFrequency: allReportsByFrequency,
        allByBankAccountAndType: allByBankAccountAndType
    },

    category: {
        all: americano.defaultRequests.all
    },

    config: {
        all: americano.defaultRequests.all,
        byName: allByName
    },

    operationtype: {
        all: americano.defaultRequests.all,
        byWeboobValue: allByWeboobValue
    }
};