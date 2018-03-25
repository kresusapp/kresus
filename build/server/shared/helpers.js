'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.MIN_WEBOOB_VERSION = exports.UNKNOWN_OPERATION_TYPE = exports.currency = exports.localeComparator = exports.formatDate = undefined;
exports.assert = assert;
exports.maybeHas = maybeHas;
exports.assertHas = assertHas;
exports.NYI = NYI;
exports.setupTranslator = setupTranslator;
exports.translate = translate;

var _nodePolyglot = require('node-polyglot');

var _nodePolyglot2 = _interopRequireDefault(_nodePolyglot);

var _currencyFormatter = require('currency-formatter');

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint no-console: 0 */

// Locales
// It is necessary to load the locale files statically,
// otherwise the files are not included in the client
const FR_LOCALE = require('./locales/fr.json');
const EN_LOCALE = require('./locales/en.json');

const ASSERTS = true;

function assert(x, wat) {
    if (!x) {
        let text = `Assertion error: ${wat ? wat : ''}\n${new Error().stack}`;
        if (ASSERTS) {
            if (typeof window !== 'undefined' && typeof window.alert !== 'undefined') {
                alert(text);
            }
            console.error(text);
        }
        return false;
    }
    return true;
}

function maybeHas(obj, prop) {
    return obj && obj.hasOwnProperty(prop);
}

function assertHas(obj, prop, errorMsg) {
    return assert(maybeHas(obj, prop), errorMsg || `object should have property ${prop}`);
}

function NYI() {
    throw 'Not yet implemented';
}

let appLocale = null;
let translator = null;
let alertMissing = null;

function setupTranslator(locale) {
    let p = new _nodePolyglot2.default({ allowMissing: true });

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

    _moment2.default.locale(checkedLocale);
}

const toShortString = date => (0, _moment2.default)(date).format('L');
const toLongString = date => (0, _moment2.default)(date).format('LLLL');
const fromNow = date => (0, _moment2.default)(date).calendar();

const formatDate = exports.formatDate = {
    toShortString,
    toLongString,
    fromNow
};

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

const localeComparator = exports.localeComparator = function () {
    if (typeof Intl !== 'undefined' && typeof Intl.Collator !== 'undefined') {
        let cache = new Map();
        return function (a, b) {
            if (!cache.has(appLocale)) {
                cache.set(appLocale, new Intl.Collator(appLocale, { sensitivity: 'base' }));
            }
            return cache.get(appLocale).compare(a, b);
        };
    }

    if (typeof String.prototype.localeCompare === 'function') {
        return function (a, b) {
            return a.localeCompare(b, appLocale, { sensitivity: 'base' });
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

const currency = exports.currency = {
    isKnown: c => typeof (0, _currencyFormatter.findCurrency)(c) !== 'undefined',
    symbolFor: c => (0, _currencyFormatter.findCurrency)(c).symbol,
    makeFormat: c => amount => (0, _currencyFormatter.format)(amount, { code: c })
};

const UNKNOWN_OPERATION_TYPE = exports.UNKNOWN_OPERATION_TYPE = 'type.unknown';

const MIN_WEBOOB_VERSION = exports.MIN_WEBOOB_VERSION = '1.3';