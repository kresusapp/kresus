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

let appLocale = null;
let translator = null;
let alertMissing = null;

export function setupTranslator(locale) {
    let p = new Polyglot({ allowMissing: true });

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

    moment.locale(checkedLocale);
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

export function translate(format, bindings = {}) {
    let augmentedBindings = bindings;
    augmentedBindings._ = '';

    if (!translator) {
        console.log(
            'Translator not set up! This probably means the initial /all ' +
                'request failed; assuming "en" to help debugging.'
        );
        setupTranslator('en');
    }

    let ret = translator(format, augmentedBindings);
    if (ret === '' && alertMissing) {
        console.log(`Missing translation key for "${format}"`);
        return format;
    }

    return ret;
}

export const localeComparator = (function() {
    if (typeof Intl !== 'undefined' && typeof Intl.Collator !== 'undefined') {
        let cache = new Map();
        return function(a, b) {
            if (!cache.has(appLocale)) {
                cache.set(appLocale, new Intl.Collator(appLocale, { sensitivity: 'base' }));
            }
            return cache.get(appLocale).compare(a, b);
        };
    }

    if (typeof String.prototype.localeCompare === 'function') {
        return function(a, b) {
            return a.localeCompare(b, appLocale, { sensitivity: 'base' });
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
})();

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

// At least 8 chars, including one lowercase, one uppercase and one digit.
const PASSPHRASE_VALIDATION_REGEXP = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;

export function validatePassword(password) {
    return PASSPHRASE_VALIDATION_REGEXP.test(password);
}

const DEFERRED_CARD_TYPE = OPERATION_TYPES.find(type => type.name === 'type.deferred_card');
const SUMMARY_CARD_TYPE = OPERATION_TYPES.find(type => type.name === 'type.card_summary');
const ACCOUNT_TYPE_CARD = ACCOUNT_TYPES.find(type => type.name === 'account-type.card');

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
