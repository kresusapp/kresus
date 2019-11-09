"use strict";

var cozydb = _interopRequireWildcard(require("cozydb"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/* eslint-disable */
function allByAccessId() {
  emit(doc.accessId, doc);
}

;

function allByAccessIdAndName() {
  emit([doc.accessId, doc.name], doc);
}

;

function allByKey() {
  emit(doc.key, doc);
}

function allByVendorId() {
  emit(doc.vendorId, doc);
}

function allByBankAccount() {
  emit(doc.accountId, doc);
}

function allByAccountIds() {
  emit(doc.id, doc);
}

function allByCategory() {
  emit(doc.categoryId, doc);
}

function allByWeboobValue() {
  emit(doc.weboobvalue, doc);
}

function allReportsByFrequency() {
  emit([doc.type, doc.frequency], doc);
}

function allByBankAccountAndType() {
  emit([doc.accountId, doc.type], doc);
}

function allByBankAccountAndDate() {
  emit([doc.accountId, new Date(doc.date).toISOString().replace(/T.*$/, 'T00:00:00.000Z')], doc);
}

function allWithOperationTypesId() {
  if (doc.hasOwnProperty('operationTypeID')) {
    emit(doc._id, doc);
  }
}

function allByYearMonth() {
  emit([doc.year, doc.month], doc);
}

function byCategoryAndYearAndMonth() {
  emit([doc.categoryId, doc.year, doc.month], doc);
}
/* eslint-enable */
// Loaded by cozydb, which doesn't support babel default export;


module.exports = {
  'access-fields': {
    all: cozydb.defaultRequests.all,
    allByAccessId,
    allByAccessIdAndName
  },
  accesses: {
    all: cozydb.defaultRequests.all,
    allByVendorId
  },
  accounts: {
    all: cozydb.defaultRequests.all,
    allByAccountIds,
    allByAccessId,
    allByVendorId
  },
  alerts: {
    all: cozydb.defaultRequests.all,
    allByBankAccount,
    allReportsByFrequency,
    allByBankAccountAndType
  },
  budgets: {
    all: cozydb.defaultRequests.all,
    allByCategory,
    allByYearMonth,
    byCategoryAndYearAndMonth
  },
  categories: {
    all: cozydb.defaultRequests.all
  },
  settings: {
    all: cozydb.defaultRequests.all,
    byKey: allByKey
  },
  transactions: {
    all: cozydb.defaultRequests.all,
    allByBankAccount,
    allByBankAccountAndDate,
    allByCategory,
    allWithOperationTypesId
  },
  'deprecated-operationtype': {
    all: cozydb.defaultRequests.all,
    byWeboobValue: allByWeboobValue
  },
  'deprecated-bank': {
    all: cozydb.defaultRequests.all
  }
};