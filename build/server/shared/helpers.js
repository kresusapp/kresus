"use strict";
/* eslint no-console: 0 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Locales
// It is necessary to load the locale files statically,
// otherwise the files are not included in the client
const FR_LOCALE = require('./locales/fr.json');
const EN_LOCALE = require('./locales/en.json');
const node_polyglot_1 = __importDefault(require("node-polyglot"));
const currency_formatter_1 = require("currency-formatter");
const moment_1 = __importDefault(require("moment"));
const account_types_json_1 = __importDefault(require("./account-types.json"));
const operation_types_json_1 = __importDefault(require("./operation-types.json"));
function maybeHas(obj, prop) {
    return obj && obj.hasOwnProperty(prop);
}
exports.maybeHas = maybeHas;
function unwrap(x) {
    if (typeof x === 'undefined') {
        throw new Error('Expected variable to be defined');
    }
    return x;
}
// Generates a translation function based on a locale file.
const makeTranslator = localeFile => {
    let polyglotInstance = new node_polyglot_1.default({ allowMissing: true });
    polyglotInstance.extend(localeFile);
    return polyglotInstance.t.bind(polyglotInstance);
};
// Generates a locale comparator based on a locale.
const makeLocaleComparator = locale => {
    if (typeof Intl !== 'undefined' && typeof Intl.Collator !== 'undefined') {
        return new Intl.Collator(locale, { sensitivity: 'base' }).compare;
    }
    if (typeof String.prototype.localeCompare === 'function') {
        return function (a, b) {
            return a.localeCompare(b, locale, { sensitivity: 'base' });
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
};
// Global state for internationalization.
/**
    @type {{
        knownLocale: boolean,
        translate: Function,
        localeCompare: Function
    }}
*/
let I18N = {
    knownLocale: false,
    translate: makeTranslator(EN_LOCALE),
    localeCompare: makeLocaleComparator('en')
};
// Sets up the given locale so localeComparator/translate can be used.
function setupTranslator(locale) {
    let localeFile = null;
    let checkedLocale = locale;
    switch (checkedLocale) {
        case 'fr':
            localeFile = FR_LOCALE;
            break;
        case 'en':
            localeFile = EN_LOCALE;
            break;
        default:
            console.log("Didn't find locale", checkedLocale, 'using en-us instead.');
            localeFile = EN_LOCALE;
            checkedLocale = 'en';
            break;
    }
    moment_1.default.locale(checkedLocale);
    I18N = {
        knownLocale: checkedLocale === locale,
        translate: makeTranslator(localeFile),
        localeCompare: makeLocaleComparator(checkedLocale)
    };
}
exports.setupTranslator = setupTranslator;
// Compares two strings according to the locale's defined order. setupTranslator must have been
// called beforehands.
function localeComparator(...rest) {
    return I18N.localeCompare(...rest);
}
exports.localeComparator = localeComparator;
// Translates a string into the given locale. setupTranslator must have been called beforehands.
function translate(format, bindings = {}) {
    let augmentedBindings = bindings;
    augmentedBindings._ = '';
    let ret = I18N.translate(format, augmentedBindings);
    if (ret === '' && I18N.knownLocale) {
        console.log(`Missing translation key for "${format}"`);
        return format;
    }
    return ret;
}
exports.translate = translate;
// Example: 02/25/2019
const toShortString = date => moment_1.default(date).format('L');
// Example: February 25, 2019
const toDayString = date => moment_1.default(date).format('LL');
// Example: Monday, February 25, 2019 10:04 PM
const toLongString = date => moment_1.default(date).format('LLLL');
// Example: 5 minutes ago
const fromNow = date => moment_1.default(date).calendar();
exports.formatDate = {
    toShortString,
    toDayString,
    toLongString,
    fromNow
};
exports.currency = {
    isKnown: c => typeof currency_formatter_1.findCurrency(c) !== 'undefined',
    symbolFor: c => {
        if (!exports.currency.isKnown(c)) {
            throw new Error(`Unknown currency: ${c}`);
        }
        return currency_formatter_1.findCurrency(c).symbol;
    },
    makeFormat: c => {
        if (!exports.currency.isKnown(c)) {
            throw new Error(`Unknown currency: ${c}`);
        }
        let { decimalDigits } = currency_formatter_1.findCurrency(c);
        return amount => {
            let am = Math.abs(amount) < Math.pow(10, -decimalDigits - 2) ? 0 : amount;
            return currency_formatter_1.format(am, { code: c });
        };
    }
};
exports.UNKNOWN_OPERATION_TYPE = 'type.unknown';
exports.UNKNOWN_ACCOUNT_TYPE = 'account-type.unknown';
exports.MIN_WEBOOB_VERSION = '2.0';
exports.UNKNOWN_WEBOOB_VERSION = null;
// At least 8 chars, including one lowercase, one uppercase and one digit.
const PASSPHRASE_VALIDATION_REGEXP = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
function validatePassword(password) {
    return PASSPHRASE_VALIDATION_REGEXP.test(password);
}
exports.validatePassword = validatePassword;
exports.DEFERRED_CARD_TYPE = unwrap(operation_types_json_1.default.find(type => type.name === 'type.deferred_card'));
exports.TRANSACTION_CARD_TYPE = unwrap(operation_types_json_1.default.find(type => type.name === 'type.card'));
exports.INTERNAL_TRANSFER_TYPE = unwrap(operation_types_json_1.default.find(type => type.name === 'type.internal_transfer'));
const SUMMARY_CARD_TYPE = unwrap(operation_types_json_1.default.find(type => type.name === 'type.card_summary'));
const ACCOUNT_TYPE_CARD = unwrap(account_types_json_1.default.find(type => type.name === 'account-type.card'));
exports.shouldIncludeInBalance = (op, balanceDate, accountType) => {
    let opDebitMoment = moment_1.default(op.debitDate || op.date);
    return (opDebitMoment.isSameOrBefore(balanceDate, 'day') &&
        (op.type !== exports.DEFERRED_CARD_TYPE.name || accountType === ACCOUNT_TYPE_CARD.name));
};
exports.shouldIncludeInOutstandingSum = op => {
    let opDebitMoment = moment_1.default(op.debitDate || op.date);
    const today = new Date();
    return opDebitMoment.isAfter(today, 'day') && op.type !== SUMMARY_CARD_TYPE.name;
};
exports.FETCH_STATUS_SUCCESS = 'OK';
