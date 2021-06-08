"use strict";
/* eslint no-console: 0 */
/* eslint @typescript-eslint/no-var-requires: 0 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FETCH_STATUS_SUCCESS = exports.shouldIncludeInOutstandingSum = exports.shouldIncludeInBalance = exports.INTERNAL_TRANSFER_TYPE = exports.TRANSACTION_CARD_TYPE = exports.DEFERRED_CARD_TYPE = exports.validatePassword = exports.UNKNOWN_WOOB_VERSION = exports.MIN_WOOB_VERSION = exports.UNKNOWN_ACCOUNT_TYPE = exports.UNKNOWN_OPERATION_TYPE = exports.currency = exports.formatDate = exports.translate = exports.localeComparator = exports.setupTranslator = exports.maybeHas = void 0;
// Locales
// It is necessary to load the locale files statically,
// otherwise the files are not included in the client
const FR_LOCALE = require('./locales/fr.json');
const EN_LOCALE = require('./locales/en.json');
const ES_LOCALE = require('./locales/es.json');
const TR_LOCALE = require('./locales/tr.json');
const node_polyglot_1 = __importDefault(require("node-polyglot"));
const currency_formatter_1 = require("currency-formatter");
const moment_1 = __importDefault(require("moment"));
const account_types_json_1 = __importDefault(require("./account-types.json"));
const operation_types_json_1 = __importDefault(require("./operation-types.json"));
// eslint-disable-next-line @typescript-eslint/ban-types
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
let defaultEnglishTranslator = null;
// Generates a translation function based on a locale file.
const makeTranslator = (locale, localeFile) => {
    const polyglotInstance = new node_polyglot_1.default({
        locale,
        allowMissing: true,
        onMissingKey: (key, options, missingForLocale) => {
            if (missingForLocale === 'en') {
                console.error(`Missing English translation for key ${key}, something is wrong.`);
                return key;
            }
            if (defaultEnglishTranslator === null) {
                throw new Error('default english cant be null');
            }
            return defaultEnglishTranslator(key, options);
        },
    });
    polyglotInstance.extend(localeFile);
    return polyglotInstance.t.bind(polyglotInstance);
};
defaultEnglishTranslator = makeTranslator('en', EN_LOCALE);
// Generates a locale comparator based on a locale.
const makeLocaleComparator = (locale) => {
    if (typeof Intl !== 'undefined' && typeof Intl.Collator !== 'undefined') {
        return new Intl.Collator(locale, { sensitivity: 'base' }).compare;
    }
    if (typeof String.prototype.localeCompare === 'function') {
        return (a, b) => {
            return a.localeCompare(b, locale, { sensitivity: 'base' });
        };
    }
    return (a, b) => {
        const af = a.toLowerCase();
        const bf = b.toLowerCase();
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
let I18N = {
    knownLocale: false,
    translate: makeTranslator('en', EN_LOCALE),
    localeCompare: makeLocaleComparator('en'),
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
        case 'es':
            localeFile = ES_LOCALE;
            break;
        case 'tr':
            localeFile = TR_LOCALE;
            break;
        default:
            console.log("Didn't find locale", checkedLocale, 'using en-us instead.');
            localeFile = EN_LOCALE;
            checkedLocale = 'en';
            break;
    }
    if (localeFile === null) {
        // Can't happen, but typescript can't infer this.
        return;
    }
    moment_1.default.locale(checkedLocale);
    I18N = {
        knownLocale: checkedLocale === locale,
        translate: makeTranslator(locale, localeFile),
        localeCompare: makeLocaleComparator(checkedLocale),
    };
}
exports.setupTranslator = setupTranslator;
// Compares two strings according to the locale's defined order. setupTranslator must have been
// called beforehands.
function localeComparator(a, b) {
    return I18N.localeCompare(a, b);
}
exports.localeComparator = localeComparator;
// Translates a string into the given locale. setupTranslator must have been called beforehands.
function translate(format, bindings = null) {
    return I18N.translate(format, bindings);
}
exports.translate = translate;
// Example: Lun. 25
const toShortDayMonthString = (date) => moment_1.default(date).format('ddd DD');
// Example: 02/25/2019
const toShortString = (date) => moment_1.default(date).format('L');
// Example: February 25, 2019
const toDayString = (date) => moment_1.default(date).format('LL');
// Example: Monday, February 25, 2019 10:04 PM
const toLongString = (date) => moment_1.default(date).format('LLLL');
// Example: 5 minutes ago
const fromNow = (date) => moment_1.default(date).calendar();
exports.formatDate = {
    toShortDayMonthString,
    toShortString,
    toDayString,
    toLongString,
    fromNow,
};
exports.currency = {
    isKnown: (c) => typeof c !== 'undefined' && c !== null && typeof currency_formatter_1.findCurrency(c) !== 'undefined',
    symbolFor: (c) => {
        if (!exports.currency.isKnown(c)) {
            throw new Error(`Unknown currency: ${c}`);
        }
        return currency_formatter_1.findCurrency(c).symbol;
    },
    makeFormat: (c) => {
        if (!exports.currency.isKnown(c)) {
            throw new Error(`Unknown currency: ${c}`);
        }
        const { decimalDigits } = currency_formatter_1.findCurrency(c);
        return (amount) => {
            const am = Math.abs(amount) < Math.pow(10, -decimalDigits - 2) ? 0 : amount;
            return currency_formatter_1.format(am, { code: c });
        };
    },
};
exports.UNKNOWN_OPERATION_TYPE = 'type.unknown';
exports.UNKNOWN_ACCOUNT_TYPE = 'account-type.unknown';
exports.MIN_WOOB_VERSION = '3.0';
exports.UNKNOWN_WOOB_VERSION = null;
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
    const opDebitMoment = moment_1.default(op.debitDate || op.date);
    return (opDebitMoment.isSameOrBefore(balanceDate, 'day') &&
        (op.type !== exports.DEFERRED_CARD_TYPE.name || accountType === ACCOUNT_TYPE_CARD.name));
};
exports.shouldIncludeInOutstandingSum = (op) => {
    const opDebitMoment = moment_1.default(op.debitDate || op.date);
    const today = new Date();
    return opDebitMoment.isAfter(today, 'day') && op.type !== SUMMARY_CARD_TYPE.name;
};
exports.FETCH_STATUS_SUCCESS = 'OK';
