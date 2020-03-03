/* eslint no-console: 0 */

// Locales
// It is necessary to load the locale files statically,
// otherwise the files are not included in the client
const FR_LOCALE = require('./locales/fr.json');
const EN_LOCALE = require('./locales/en.json');

import Polyglot from 'node-polyglot';
import { format as currencyFormatter, findCurrency } from 'currency-formatter';
import moment from 'moment';

import ACCOUNT_TYPES from './account-types.json';
import OPERATION_TYPES from './operation-types.json';

export function maybeHas(obj, prop) {
    return obj && obj.hasOwnProperty(prop);
}

function unwrap(x) {
    if (typeof x === 'undefined') {
        throw new Error('Expected variable to be defined');
    }
    return x;
}

// Generates a translation function based on a locale file.
const makeTranslator = localeFile => {
    let polyglotInstance = new Polyglot({ allowMissing: true });
    polyglotInstance.extend(localeFile);
    return polyglotInstance.t.bind(polyglotInstance);
};

// Generates a locale comparator based on a locale.
const makeLocaleComparator = locale => {
    if (typeof Intl !== 'undefined' && typeof Intl.Collator !== 'undefined') {
        return new Intl.Collator(locale, { sensitivity: 'base' }).compare;
    }

    if (typeof String.prototype.localeCompare === 'function') {
        return function(a, b) {
            return a.localeCompare(b, locale, { sensitivity: 'base' });
        };
    }

    return function(a, b) {
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
export function setupTranslator(locale) {
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

    moment.locale(checkedLocale);

    I18N = {
        knownLocale: checkedLocale === locale,
        translate: makeTranslator(localeFile),
        localeCompare: makeLocaleComparator(checkedLocale)
    };
}

// Compares two strings according to the locale's defined order. setupTranslator must have been
// called beforehands.
export function localeComparator(...rest) {
    return I18N.localeCompare(...rest);
}

// Translates a string into the given locale. setupTranslator must have been called beforehands.
export function translate(format, bindings = {}) {
    let augmentedBindings = bindings;
    augmentedBindings._ = '';

    let ret = I18N.translate(format, augmentedBindings);
    if (ret === '' && I18N.knownLocale) {
        console.log(`Missing translation key for "${format}"`);
        return format;
    }

    return ret;
}

// Example: 02/25/2019
const toShortString = date => moment(date).format('L');

// Example: February 25, 2019
const toDayString = date => moment(date).format('LL');

// Example: Monday, February 25, 2019 10:04 PM
const toLongString = date => moment(date).format('LLLL');

// Example: 5 minutes ago
const fromNow = date => moment(date).calendar();

export const formatDate = {
    toShortString,
    toDayString,
    toLongString,
    fromNow
};

export const currency = {
    isKnown: c => typeof findCurrency(c) !== 'undefined',
    symbolFor: c => {
        if (!currency.isKnown(c)) {
            throw new Error(`Unknown currency: ${c}`);
        }
        return findCurrency(c).symbol;
    },
    makeFormat: c => {
        if (!currency.isKnown(c)) {
            throw new Error(`Unknown currency: ${c}`);
        }
        let { decimalDigits } = findCurrency(c);
        return amount => {
            let am = Math.abs(amount) < Math.pow(10, -decimalDigits - 2) ? 0 : amount;
            return currencyFormatter(am, { code: c });
        };
    }
};

export const UNKNOWN_OPERATION_TYPE = 'type.unknown';
export const UNKNOWN_ACCOUNT_TYPE = 'account-type.unknown';

export const MIN_WEBOOB_VERSION = '1.5';
export const UNKNOWN_WEBOOB_VERSION = null;

// At least 8 chars, including one lowercase, one uppercase and one digit.
const PASSPHRASE_VALIDATION_REGEXP = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;

export function validatePassword(password) {
    return PASSPHRASE_VALIDATION_REGEXP.test(password);
}

const DEFERRED_CARD_TYPE = unwrap(OPERATION_TYPES.find(type => type.name === 'type.deferred_card'));
const SUMMARY_CARD_TYPE = unwrap(OPERATION_TYPES.find(type => type.name === 'type.card_summary'));
const ACCOUNT_TYPE_CARD = unwrap(ACCOUNT_TYPES.find(type => type.name === 'account-type.card'));

export const shouldIncludeInBalance = (op, balanceDate, accountType) => {
    let opDebitMoment = moment(op.debitDate || op.date);
    return (
        opDebitMoment.isSameOrBefore(balanceDate, 'day') &&
        (op.type !== DEFERRED_CARD_TYPE.name || accountType === ACCOUNT_TYPE_CARD.name)
    );
};

export const shouldIncludeInOutstandingSum = op => {
    let opDebitMoment = moment(op.debitDate || op.date);
    let today = moment();
    return opDebitMoment.isAfter(today, 'day') && op.type !== SUMMARY_CARD_TYPE.name;
};

export const FETCH_STATUS_SUCCESS = 'OK';
