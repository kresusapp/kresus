/* eslint no-console: 0 */
/* eslint @typescript-eslint/no-var-requires: 0 */

import { SharedTransaction } from './types';

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

export function maybeHas(obj: object, prop: string): boolean {
    return obj && obj.hasOwnProperty(prop);
}

function unwrap<T>(x: T | undefined): T {
    if (typeof x === 'undefined') {
        throw new Error('Expected variable to be defined');
    }
    return x;
}

// Generates a translation function based on a locale file.
const makeTranslator = (localeFile: object) => {
    const polyglotInstance = new Polyglot({ allowMissing: true });
    polyglotInstance.extend(localeFile);
    return polyglotInstance.t.bind(polyglotInstance);
};

type LocaleComparator = (lhs: string, rhs: string) => number;

// Generates a locale comparator based on a locale.
const makeLocaleComparator = (locale: string): LocaleComparator => {
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

interface I18NObject {
    knownLocale: boolean;
    translate: (format: string, bindings?: object) => string;
    localeCompare: (lhs: string, rhs: string) => number;
}

// Global state for internationalization.
let I18N: I18NObject = {
    knownLocale: false,
    translate: makeTranslator(EN_LOCALE),
    localeCompare: makeLocaleComparator('en'),
};

// Sets up the given locale so localeComparator/translate can be used.
export function setupTranslator(locale: string) {
    let localeFile: object | null = null;
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

    if (localeFile === null) {
        // Can't happen, but typescript can't infer this.
        return;
    }

    moment.locale(checkedLocale);

    I18N = {
        knownLocale: checkedLocale === locale,
        translate: makeTranslator(localeFile),
        localeCompare: makeLocaleComparator(checkedLocale),
    };
}

// Compares two strings according to the locale's defined order. setupTranslator must have been
// called beforehands.
export function localeComparator(a: string, b: string) {
    return I18N.localeCompare(a, b);
}

// Translates a string into the given locale. setupTranslator must have been called beforehands.
export function translate(format: string, bindings: any = null) {
    const ret = I18N.translate(format, bindings);
    if (ret === '' && I18N.knownLocale) {
        console.log(`Missing translation key for "${format}"`);
        return format;
    }

    return ret;
}

// Example: Lun. 25
const toShortDayMonthString = (date: Date) => moment(date).format('ddd DD');

// Example: 02/25/2019
const toShortString = (date: Date) => moment(date).format('L');

// Example: February 25, 2019
const toDayString = (date: Date) => moment(date).format('LL');

// Example: Monday, February 25, 2019 10:04 PM
const toLongString = (date: Date) => moment(date).format('LLLL');

// Example: 5 minutes ago
const fromNow = (date: Date) => moment(date).calendar();

export const formatDate = {
    toShortDayMonthString,
    toShortString,
    toDayString,
    toLongString,
    fromNow,
};

export const currency = {
    isKnown: (c?: string | null) =>
        typeof c !== 'undefined' && c !== null && typeof findCurrency(c) !== 'undefined',
    symbolFor: (c: string) => {
        if (!currency.isKnown(c)) {
            throw new Error(`Unknown currency: ${c}`);
        }
        return findCurrency(c).symbol;
    },
    makeFormat: (c: string) => {
        if (!currency.isKnown(c)) {
            throw new Error(`Unknown currency: ${c}`);
        }
        const { decimalDigits } = findCurrency(c);
        return (amount: number) => {
            const am = Math.abs(amount) < Math.pow(10, -decimalDigits - 2) ? 0 : amount;
            return currencyFormatter(am, { code: c });
        };
    },
};

export const UNKNOWN_OPERATION_TYPE = 'type.unknown';
export const UNKNOWN_ACCOUNT_TYPE = 'account-type.unknown';

export const MIN_WEBOOB_VERSION = '2.0';
export const UNKNOWN_WEBOOB_VERSION = null;

// At least 8 chars, including one lowercase, one uppercase and one digit.
const PASSPHRASE_VALIDATION_REGEXP = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;

export function validatePassword(password: string) {
    return PASSPHRASE_VALIDATION_REGEXP.test(password);
}

export const DEFERRED_CARD_TYPE = unwrap(
    OPERATION_TYPES.find(type => type.name === 'type.deferred_card')
);
export const TRANSACTION_CARD_TYPE = unwrap(
    OPERATION_TYPES.find(type => type.name === 'type.card')
);
export const INTERNAL_TRANSFER_TYPE = unwrap(
    OPERATION_TYPES.find(type => type.name === 'type.internal_transfer')
);
const SUMMARY_CARD_TYPE = unwrap(OPERATION_TYPES.find(type => type.name === 'type.card_summary'));
const ACCOUNT_TYPE_CARD = unwrap(ACCOUNT_TYPES.find(type => type.name === 'account-type.card'));

export const shouldIncludeInBalance = (
    op: SharedTransaction,
    balanceDate: Date,
    accountType: string
) => {
    const opDebitMoment = moment(op.debitDate || op.date);
    return (
        opDebitMoment.isSameOrBefore(balanceDate, 'day') &&
        (op.type !== DEFERRED_CARD_TYPE.name || accountType === ACCOUNT_TYPE_CARD.name)
    );
};

export const shouldIncludeInOutstandingSum = (op: SharedTransaction) => {
    const opDebitMoment = moment(op.debitDate || op.date);
    const today = new Date();
    return opDebitMoment.isAfter(today, 'day') && op.type !== SUMMARY_CARD_TYPE.name;
};

export const FETCH_STATUS_SUCCESS = 'OK';

// A wrap function, which catches the error and calls the passed error
// callback when applied to async functions.
//
// ```
// const failsafeFunction = wrapCatchError(error => console.error(error))(faillibleFunction);
// // Doesn't throw but logs the error to the console.
// await failsafeFunction(someArgs);
// ```
export function wrapCatchError(onError: (caughtError: Error) => void) {
    return function (oldFunc: (...unusedArgs: any[]) => Promise<void>) {
        return async function (...args: any[]): Promise<void> {
            try {
                await oldFunc(...args);
            } catch (error) {
                onError(error);
            }
        };
    };
}
