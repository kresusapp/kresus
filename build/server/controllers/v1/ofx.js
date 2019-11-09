"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ofxToKresus = ofxToKresus;

var ofxConverter = _interopRequireWildcard(require("ofx"));

var _moment = _interopRequireDefault(require("moment"));

var _helpers = require("../../helpers");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const accountsTypesMap = {
  CHECKING: 'account-type.checking',
  SAVINGS: 'account-type.savings',
  CREDITLINE: 'account-type.loan',
  // line of credit
  MONEYMRKT: 'account-type.unknown',
  // money market
  CD: 'account-type.unknown' // certificate of deposit

};
const transactionsTypesMap = {
  CREDIT: 'type.card',
  DEBIT: 'type.card',
  INT: 'type.bankfee',
  // Interest earned or paid (depends on signage of amount)
  DIV: 'type.bankfee',
  // Dividend
  FEE: 'type.bankfee',
  SRVCHG: 'type.bankfee',
  DEP: 'type.cash_deposit',
  ATM: 'type.withdrawal',
  // ATM debit or credit (depends on signage of amount)
  POS: 'type.card',
  // Point of sale debit or credit (depends on signage of amount)
  XFER: 'type.transfer',
  CHECK: 'type.check',
  PAYMENT: 'type.card',
  CASH: 'type.withdrawal',
  // Actually an electronic payment
  DIRECTDEP: 'type.withdrawal',
  DIRECTDEBIT: 'type.cash_deposit',
  REPEATPMT: 'type.card',
  // Repeating payment/standing order
  OTHER: 'type.unknown',
  HOLD: 'type.unknown'
};

function ofxToKresus(ofx) {
  // See http://www.ofx.net/downloads/OFX%202.2.pdf.
  let data = null;

  try {
    data = ofxConverter.parse(ofx);
    data = data.OFX.BANKMSGSRSV1.STMTTRNRS;
  } catch (err) {
    throw new _helpers.KError('Invalid OFX file.');
  } // If there is only one account it is an object, else an array of object.


  if (!(data instanceof Array)) {
    data = [data];
  } else if (!data.length) {
    return null;
  }

  let accountId = 0;
  let accounts = [];
  let transactions = [];
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = data[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      let account = _step.value;
      account = account.STMTRS;

      if (!account) {
        throw new _helpers.KError('Cannot find state response message in OFX file.');
      }

      let currencyCode = account.CURDEF;

      if (!currencyCode) {
        throw new _helpers.KError('Cannot find currency code in OFX file.');
      }

      let accountInfo = account.BANKACCTFROM;
      let vendorAccountId = accountInfo.ACCTID;

      if (!vendorAccountId) {
        throw new _helpers.KError('Cannot find account id in OFX file.');
      }

      let accountType = accountsTypesMap[accountInfo.ACCTTYPE] || 'account-type.unknown';
      let balance = parseFloat(account.AVAILBAL.BALAMT) || 0;
      let accountTransactions = account.BANKTRANLIST.STMTTRN;

      if (!(accountTransactions instanceof Array)) {
        accountTransactions = [accountTransactions];
      }

      if (accountTransactions.length) {
        transactions = transactions.concat(accountTransactions // eslint-disable-next-line no-loop-func
        .map(transaction => {
          let debitDate = transaction.DTPOSTED;
          let realizationDate = transaction.DTUSER;

          if (!realizationDate) {
            realizationDate = debitDate;
          }

          return {
            accountId,
            date: (0, _moment.default)(realizationDate).toISOString(),
            debitDate: debitDate ? (0, _moment.default)(debitDate).toISOString() : null,
            rawLabel: transaction.NAME || transaction.MEMO,
            label: transaction.MEMO || transaction.NAME,
            amount: parseFloat(transaction.TRNAMT),
            type: transactionsTypesMap[transaction.TRNTYPE] || transactionsTypesMap.OTHER
          };
        }).filter(transaction => !isNaN(transaction.amount)));
        accounts.push({
          id: accountId,
          vendorId: 'manual',
          vendorAccountId,
          accessId: 0,
          type: accountType,
          initialBalance: balance,
          currency: currencyCode,
          label: `OFX imported account - ${accountInfo.ACCTTYPE}`
        });
      }

      ++accountId;
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return != null) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  return {
    accesses: [{
      id: 0,
      vendorId: 'manual',
      login: ''
    }],
    accounts,
    operations: transactions
  };
}