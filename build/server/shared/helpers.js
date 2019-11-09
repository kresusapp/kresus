"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.maybeHas = maybeHas;
exports.setupTranslator = setupTranslator;
exports.translate = translate;
exports.validatePassword = validatePassword;
exports.FETCH_STATUS_SUCCESS = exports.shouldIncludeInOutstandingSum = exports.shouldIncludeInBalance = exports.MIN_WEBOOB_VERSION = exports.UNKNOWN_ACCOUNT_TYPE = exports.UNKNOWN_OPERATION_TYPE = exports.currency = exports.localeComparator = exports.formatDate = void 0;

var _nodePolyglot = _interopRequireDefault(require("node-polyglot"));

var _currencyFormatter = require("currency-formatter");

var _moment = _interopRequireDefault(require("moment"));

var _accountTypes = _interopRequireDefault(require("./account-types.json"));

var _operationTypes = _interopRequireDefault(require("./operation-types.json"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint no-console: 0 */
// Locales
// It is necessary to load the locale files statically,
// otherwise the files are not included in the client
const FR_LOCALE = require('./locales/fr.json');

const EN_LOCALE = require('./locales/en.json');

function maybeHas(obj, prop) {
  return obj && obj.hasOwnProperty(prop);
}

let appLocale = null;
let translator = null;
let alertMissing = null;

function setupTranslator(locale) {
  let p = new _nodePolyglot.default({
    allowMissing: true
  });
  let found = true;
  let checkedLocale = locale;

  switch (checkedLocale) {
    case 'fr':
      p.extend(FR_LOCALE);
      break;

    case 'en':
      p.extend(EN_LOCALE);
      break;

    default:
      console.log("Didn't find locale", checkedLocale, 'using en-us instead.');
      checkedLocale = 'en';
      found = false;
      p.extend(EN_LOCALE);
      break;
  }

  translator = p.t.bind(p);
  appLocale = checkedLocale;
  alertMissing = found;

  _moment.default.locale(checkedLocale);
} // Example: 02/25/2019


const toShortString = date => (0, _moment.default)(date).format('L'); // Example: February 25, 2019


const toDayString = date => (0, _moment.default)(date).format('LL'); // Example: Monday, February 25, 2019 10:04 PM


const toLongString = date => (0, _moment.default)(date).format('LLLL'); // Example: 5 minutes ago


const fromNow = date => (0, _moment.default)(date).calendar();

const formatDate = {
  toShortString,
  toDayString,
  toLongString,
  fromNow
};
exports.formatDate = formatDate;

function translate(format, bindings = {}) {
  let augmentedBindings = bindings;
  augmentedBindings._ = '';

  if (!translator) {
    console.log('Translator not set up! This probably means the initial /all ' + 'request failed; assuming "en" to help debugging.');
    setupTranslator('en');
  }

  let ret = translator(format, augmentedBindings);

  if (ret === '' && alertMissing) {
    console.log(`Missing translation key for "${format}"`);
    return format;
  }

  return ret;
}

const localeComparator = function () {
  if (typeof Intl !== 'undefined' && typeof Intl.Collator !== 'undefined') {
    let cache = new Map();
    return function (a, b) {
      if (!cache.has(appLocale)) {
        cache.set(appLocale, new Intl.Collator(appLocale, {
          sensitivity: 'base'
        }));
      }

      return cache.get(appLocale).compare(a, b);
    };
  }

  if (typeof String.prototype.localeCompare === 'function') {
    return function (a, b) {
      return a.localeCompare(b, appLocale, {
        sensitivity: 'base'
      });
    };
  }

  return function (a, b) {
    let af = a.toLowerCase();
    let bf = b.toLowerCase();

    if (af < bf) {
      return -1;
    }

    if (af > bf) {
      return 1;
    }

    return 0;
  };
}();

exports.localeComparator = localeComparator;
const currency = {
  isKnown: c => typeof (0, _currencyFormatter.findCurrency)(c) !== 'undefined',
  symbolFor: c => {
    if (!currency.isKnown(c)) {
      throw new Error(`Unknown currency: ${c}`);
    }

    return (0, _currencyFormatter.findCurrency)(c).symbol;
  },
  makeFormat: c => {
    if (!currency.isKnown(c)) {
      throw new Error(`Unknown currency: ${c}`);
    }

    let _findCurrency = (0, _currencyFormatter.findCurrency)(c),
        decimalDigits = _findCurrency.decimalDigits;

    return amount => {
      let am = Math.abs(amount) < Math.pow(10, -decimalDigits - 2) ? 0 : amount;
      return (0, _currencyFormatter.format)(am, {
        code: c
      });
    };
  }
};
exports.currency = currency;
const UNKNOWN_OPERATION_TYPE = 'type.unknown';
exports.UNKNOWN_OPERATION_TYPE = UNKNOWN_OPERATION_TYPE;
const UNKNOWN_ACCOUNT_TYPE = 'account-type.unknown';
exports.UNKNOWN_ACCOUNT_TYPE = UNKNOWN_ACCOUNT_TYPE;
const MIN_WEBOOB_VERSION = '1.5'; // At least 8 chars, including one lowercase, one uppercase and one digit.

exports.MIN_WEBOOB_VERSION = MIN_WEBOOB_VERSION;
const PASSPHRASE_VALIDATION_REGEXP = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;

function validatePassword(password) {
  return PASSPHRASE_VALIDATION_REGEXP.test(password);
}

const DEFERRED_CARD_TYPE = _operationTypes.default.find(type => type.name === 'type.deferred_card');

const SUMMARY_CARD_TYPE = _operationTypes.default.find(type => type.name === 'type.card_summary');

const ACCOUNT_TYPE_CARD = _accountTypes.default.find(type => type.name === 'account-type.card');

const shouldIncludeInBalance = (op, balanceDate, accountType) => {
  let opDebitMoment = (0, _moment.default)(op.debitDate || op.date);
  return opDebitMoment.isSameOrBefore(balanceDate, 'day') && (op.type !== DEFERRED_CARD_TYPE.name || accountType === ACCOUNT_TYPE_CARD.name);
};

exports.shouldIncludeInBalance = shouldIncludeInBalance;

const shouldIncludeInOutstandingSum = op => {
  let opDebitMoment = (0, _moment.default)(op.debitDate || op.date);
  let today = (0, _moment.default)();
  return opDebitMoment.isAfter(today, 'day') && op.type !== SUMMARY_CARD_TYPE.name;
};

exports.shouldIncludeInOutstandingSum = shouldIncludeInOutstandingSum;
const FETCH_STATUS_SUCCESS = 'OK';
exports.FETCH_STATUS_SUCCESS = FETCH_STATUS_SUCCESS;