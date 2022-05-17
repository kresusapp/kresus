"use strict";
/* eslint no-console: 0 */
/* eslint @typescript-eslint/no-var-requires: 0 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FETCH_STATUS_SUCCESS = exports.shouldIncludeInOutstandingSum = exports.shouldIncludeInBalance = exports.INTERNAL_TRANSFER_TYPE = exports.TRANSACTION_CARD_TYPE = exports.DEFERRED_CARD_TYPE = exports.validatePassword = exports.UNKNOWN_WOOB_VERSION = exports.MIN_WOOB_VERSION = exports.UNKNOWN_ACCOUNT_TYPE = exports.UNKNOWN_OPERATION_TYPE = exports.currency = exports.formatDate = exports.translate = exports.localeComparator = exports.setupTranslator = exports.getDefaultEnglishTranslator = exports.maybeHas = void 0;
// Locales
// It is necessary to load the locale files statically,
// otherwise the files are not included in the client
//
// /!\ Add locale imports to dependencies too:
// - for moment, in client/main.tsx
// - for flatpickr, in client/components/ui/flatpicker.ts
const fr_json_1 = __importDefault(require("../locales/fr.json"));
const en_json_1 = __importDefault(require("../locales/en.json"));
const es_json_1 = __importDefault(require("../locales/es.json"));
const tr_json_1 = __importDefault(require("../locales/tr.json"));
const node_polyglot_1 = __importDefault(require("node-polyglot"));
const currency_formatter_1 = require("currency-formatter");
const moment_1 = __importDefault(require("moment"));
const account_types_json_1 = __importDefault(require("../account-types.json"));
const operation_types_json_1 = __importDefault(require("../operation-types.json"));
const dates_1 = require("./dates");
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
defaultEnglishTranslator = makeTranslator('en', en_json_1.default);
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
function getDefaultEnglishTranslator() {
    return {
        localeId: 'en',
        isKnownLocale: false,
        translate: makeTranslator('en', en_json_1.default),
        localeCompare: makeLocaleComparator('en'),
    };
}
exports.getDefaultEnglishTranslator = getDefaultEnglishTranslator;
// Sets up the given locale so localeComparator/translate can be used.
function setupTranslator(locale) {
    let localeFile = null;
    let checkedLocale = locale;
    switch (checkedLocale) {
        case 'fr':
            localeFile = fr_json_1.default;
            break;
        case 'en':
            localeFile = en_json_1.default;
            break;
        case 'es':
            localeFile = es_json_1.default;
            break;
        case 'tr':
            localeFile = tr_json_1.default;
            break;
        default:
            console.log("Didn't find locale", checkedLocale, 'using en-us instead.');
            localeFile = en_json_1.default;
            checkedLocale = 'en';
            break;
    }
    if (localeFile === null) {
        throw new Error("typescript can't infer this won't be null");
    }
    return {
        localeId: checkedLocale,
        isKnownLocale: checkedLocale === locale,
        translate: makeTranslator(locale, localeFile),
        localeCompare: makeLocaleComparator(checkedLocale),
    };
}
exports.setupTranslator = setupTranslator;
// Compares two strings according to the locale's defined order. setupTranslator must have been
// called beforehands.
function localeComparator(i18n, a, b) {
    return i18n.localeCompare(a, b);
}
exports.localeComparator = localeComparator;
// Translates a string into the given locale. setupTranslator must have been called beforehands.
function translate(i18n, format, bindings = null) {
    return i18n.translate(format, bindings);
}
exports.translate = translate;
// Example: Lun. 25
const toShortDayMonthString = (date) => (0, moment_1.default)(date).format('ddd DD');
// Example: 02/25/2019
const toShortString = (date) => (0, moment_1.default)(date).format('L');
// Example: February 25, 2019
const toDayString = (date) => (0, moment_1.default)(date).format('LL');
// Example: Monday, February 25, 2019 10:04 PM
const toLongString = (date) => (0, moment_1.default)(date).format('LLLL');
// Example: 5 minutes ago
const fromNow = (date) => (0, moment_1.default)(date).calendar();
const formatDate = (locale) => {
    moment_1.default.locale(locale);
    return {
        toShortDayMonthString,
        toShortString,
        toDayString,
        toLongString,
        fromNow,
    };
};
exports.formatDate = formatDate;
exports.currency = {
    isKnown: (c) => typeof c !== 'undefined' && c !== null && typeof (0, currency_formatter_1.findCurrency)(c) !== 'undefined',
    symbolFor: (c) => {
        const found = (0, currency_formatter_1.findCurrency)(c);
        if (typeof found === 'undefined') {
            throw new Error(`Unknown currency: ${c}`);
        }
        return found.symbol;
    },
    makeFormat: (c) => {
        const found = (0, currency_formatter_1.findCurrency)(c);
        if (typeof found === 'undefined') {
            throw new Error(`Unknown currency: ${c}`);
        }
        const { decimalDigits } = found;
        return (amount) => {
            const am = Math.abs(amount) < Math.pow(10, -decimalDigits - 2) ? 0 : amount;
            return (0, currency_formatter_1.format)(am, { code: c });
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
const shouldIncludeInBalance = (op, balanceDate, accountType) => {
    const opDebitMoment = (0, moment_1.default)(op.debitDate || op.date);
    return (opDebitMoment.isSameOrBefore(balanceDate, 'day') &&
        (op.type !== exports.DEFERRED_CARD_TYPE.name || accountType === ACCOUNT_TYPE_CARD.name));
};
exports.shouldIncludeInBalance = shouldIncludeInBalance;
const shouldIncludeInOutstandingSum = (op, limitToCurrentMonth) => {
    const opDebitMoment = (0, moment_1.default)(op.debitDate || op.date);
    const today = new Date();
    return (opDebitMoment.isAfter(today, 'day') &&
        (!limitToCurrentMonth || !opDebitMoment.isAfter((0, dates_1.endOfMonth)(today), 'day')) &&
        op.type !== SUMMARY_CARD_TYPE.name);
};
exports.shouldIncludeInOutstandingSum = shouldIncludeInOutstandingSum;
exports.FETCH_STATUS_SUCCESS = 'OK';
