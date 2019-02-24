"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _helpers = require("../helpers");

var _diffList = _interopRequireDefault(require("./diff-list"));

var _manual = require("./sources/manual");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function isPerfectMatch(known, provided) {
  (0, _helpers.assert)(known.bank === provided.bank, 'data inconsistency');
  let newTitle = known.title.replace(/ /g, '').toLowerCase();
  let oldTitle = provided.title.replace(/ /g, '').toLowerCase();
  return oldTitle === newTitle && provided.accountNumber === known.accountNumber && (!provided.iban && !known.iban || provided.iban === known.iban) && provided.currency === known.currency && provided.type === known.type;
}

const HEURISTICS = {
  SAME_TITLE: 5,
  SAME_ACCOUNT_NUMBER: 5,
  SAME_IBAN: 1,
  SAME_CURRENCY: 1,
  SAME_TYPE: 1
}; // The minimum similarity to consider two accounts are the same.

const MIN_SIMILARITY = HEURISTICS.SAME_IBAN + HEURISTICS.SAME_CURRENCY + HEURISTICS.SAME_TYPE + 1;

function computePairScore(known, provided) {
  // Normalize data.
  let oldTitle = provided.title.replace(/ /g, '').toLowerCase();
  let newTitle = known.title.replace(/ /g, '').toLowerCase();
  let titleScore = 0; // The manual bank accounts titles might change when the locale changes. Suppose the title
  // is identical if the access is the same and rely on the account number.

  if (oldTitle === newTitle || known.bank === provided.bank && known.bankAccess === provided.bankAccess && known.bank === _manual.SOURCE_NAME) {
    titleScore = HEURISTICS.SAME_TITLE;
  }

  let accountNumberScore = known.accountNumber === provided.accountNumber ? HEURISTICS.SAME_ACCOUNT_NUMBER : 0;
  let ibanScore = known.iban === provided.iban ? HEURISTICS.SAME_IBAN : 0;
  let currencyScore = known.currency === provided.currency ? HEURISTICS.SAME_CURRENCY : 0;
  let typeScore = known.type === provided.type ? HEURISTICS.SAME_TYPE : 0;
  return titleScore + accountNumberScore + ibanScore + currencyScore + typeScore;
}

const diffAccount = (0, _diffList.default)(isPerfectMatch, computePairScore, MIN_SIMILARITY);
var _default = diffAccount;
exports.default = _default;