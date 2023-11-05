/* eslint no-console: 0 */
/* eslint @typescript-eslint/no-var-requires: 0 */

import { SharedTransaction } from '../types';

// Locales
// It is necessary to load the locale files statically,
// otherwise the files are not included in the client
//
// /!\ Add locale imports to dependencies too:
// - for moment, in client/main.tsx
// - for flatpickr, in client/components/ui/flatpicker.ts

import FR_LOCALE from '../locales/fr.json';
import EN_LOCALE from '../locales/en.json';
import ES_LOCALE from '../locales/es.json';
import TR_LOCALE from '../locales/tr.json';

import Polyglot from 'node-polyglot';
import { format as currencyFormatter, findCurrency } from 'currency-formatter';

import moment from 'moment';

import ACCOUNT_TYPES from '../account-types.json';
import TRANSACTION_TYPESES from '../../shared/transaction-types.json';
import { endOfMonth } from './dates';

// eslint-disable-next-line @typescript-eslint/ban-types
export function maybeHas(obj: object, prop: string): boolean {
    return obj && obj.hasOwnProperty(prop);
}

function unwrap<T>(x: T | undefined): T {
    if (typeof x === 'undefined') {
        throw new Error('Expected variable to be defined');
    }
    return x;
}

let defaultEnglishTranslator:
    | ((key: string, options: Polyglot.InterpolationOptions) => string)
    | null = null;

// Generates a translation function based on a locale file.
const makeTranslator = (locale: string, localeFile: Record<string, unknown>) => {
    const polyglotInstance = new Polyglot({
        locale,
        allowMissing: true,
        onMissingKey: (
            key: string,
            options: Polyglot.InterpolationOptions,
            missingForLocale: string
        ) => {
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

export interface I18NObject {
    localeId: string;
    isKnownLocale: boolean;
    translate: (format: string, bindings?: Record<string, unknown>) => string;
    localeCompare: (lhs: string, rhs: string) => number;
}

export function getDefaultEnglishTranslator(): I18NObject {
    return {
        localeId: 'en',
        isKnownLocale: false,
        translate: makeTranslator('en', EN_LOCALE),
        localeCompare: makeLocaleComparator('en'),
    };
}

// Sets up the given locale so localeComparator/translate can be used.
export function setupTranslator(locale: string): I18NObject {
    let localeFile: Record<string, unknown> | null = null;
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
        throw new Error("typescript can't infer this won't be null");
    }

    return {
        localeId: checkedLocale,
        isKnownLocale: checkedLocale === locale,
        translate: makeTranslator(locale, localeFile),
        localeCompare: makeLocaleComparator(checkedLocale),
    };
}

// Compares two strings according to the locale's defined order. setupTranslator must have been
// called beforehands.
export function localeComparator(i18n: I18NObject, a: string, b: string) {
    return i18n.localeCompare(a, b);
}

// Translates a string into the given locale. setupTranslator must have been called beforehands.
export function translate(i18n: I18NObject, format: string, bindings: any = null) {
    return i18n.translate(format, bindings);
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

export const formatDate = (locale: string) => {
    moment.locale(locale);
    return {
        toShortDayMonthString,
        toShortString,
        toDayString,
        toLongString,
        fromNow,
    };
};

export const currency = {
    isKnown: (c?: string | null) =>
        typeof c !== 'undefined' && c !== null && typeof findCurrency(c) !== 'undefined',
    symbolFor: (c: string) => {
        const found = findCurrency(c);
        if (typeof found === 'undefined') {
            throw new Error(`Unknown currency: ${c}`);
        }
        return found.symbol;
    },
    makeFormat: (c: string) => {
        const found = findCurrency(c);
        if (typeof found === 'undefined') {
            throw new Error(`Unknown currency: ${c}`);
        }
        const { decimalDigits } = found;
        return (amount: number) => {
            const am = Math.abs(amount) < Math.pow(10, -decimalDigits - 2) ? 0 : amount;
            return currencyFormatter(am, { code: c });
        };
    },
};

export const UNKNOWN_TRANSACTION_TYPE = 'type.unknown';
export const UNKNOWN_ACCOUNT_TYPE = 'account-type.unknown';

export const MIN_WOOB_VERSION = '3.5';
export const UNKNOWN_WOOB_VERSION = null;

// At least 8 chars, including one lowercase, one uppercase and one digit.
const PASSPHRASE_VALIDATION_REGEXP = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;

export function validatePassword(password: string) {
    return PASSPHRASE_VALIDATION_REGEXP.test(password);
}

export const DEFERRED_CARD_TYPE = unwrap(
    TRANSACTION_TYPESES.find(type => type.name === 'type.deferred_card')
);
export const TRANSACTION_CARD_TYPE = unwrap(
    TRANSACTION_TYPESES.find(type => type.name === 'type.card')
);
export const INTERNAL_TRANSFER_TYPE = unwrap(
    TRANSACTION_TYPESES.find(type => type.name === 'type.internal_transfer')
);
const SUMMARY_CARD_TYPE = unwrap(
    TRANSACTION_TYPESES.find(type => type.name === 'type.card_summary')
);
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

export const shouldIncludeInOutstandingSum = (
    op: SharedTransaction,
    limitToCurrentMonth: boolean
) => {
    const opDebitMoment = moment(op.debitDate || op.date);
    const today = new Date();
    return (
        opDebitMoment.isAfter(today, 'day') &&
        (!limitToCurrentMonth || !opDebitMoment.isAfter(endOfMonth(today), 'day')) &&
        op.type !== SUMMARY_CARD_TYPE.name
    );
};

export const FETCH_STATUS_SUCCESS = 'OK';
