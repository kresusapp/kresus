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
var FR_LOCALE = require('./locales/fr.json');
var EN_LOCALE = require('./locales/en.json');

var ASSERTS = true;

function assert(x, wat) {
    if (!x) {
        var text = 'Assertion error: ' + (wat ? wat : '') + '\n' + new Error().stack;
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
    return assert(maybeHas(obj, prop), errorMsg || 'object should have property ' + prop);
}

function NYI() {
    throw 'Not yet implemented';
}

var appLocale = null;
var translator = null;
var alertMissing = null;

function setupTranslator(locale) {
    var p = new _nodePolyglot2.default({ allowMissing: true });

    var found = true;
    var checkedLocale = locale;
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

var toShortString = function toShortString(date) {
    return (0, _moment2.default)(date).format('L');
};
var toLongString = function toLongString(date) {
    return (0, _moment2.default)(date).format('LLLL');
};
var fromNow = function fromNow(date) {
    return (0, _moment2.default)(date).calendar();
};

var formatDate = exports.formatDate = {
    toShortString: toShortString,
    toLongString: toLongString,
    fromNow: fromNow
};

function translate(format) {
    var bindings = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var augmentedBindings = bindings;
    augmentedBindings._ = '';

    var ret = translator(format, augmentedBindings);
    if (ret === '' && alertMissing) {
        console.log('Missing translation key for "' + format + '"');
        return format;
    }

    return ret;
}

var localeComparator = exports.localeComparator = function () {
    if (typeof Intl !== 'undefined' && typeof Intl.Collator !== 'undefined') {
        var cache = new Map();
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
        var af = a.toLowerCase();
        var bf = b.toLowerCase();
        if (af < bf) return -1;
        if (af > bf) return 1;
        return 0;
    };
}();

var currency = exports.currency = {
    isKnown: function isKnown(c) {
        return typeof (0, _currencyFormatter.findCurrency)(c) !== 'undefined';
    },
    symbolFor: function symbolFor(c) {
        return (0, _currencyFormatter.findCurrency)(c).symbol;
    },
    makeFormat: function makeFormat(c) {
        return function (amount) {
            return (0, _currencyFormatter.format)(amount, { code: c });
        };
    }
};

var UNKNOWN_OPERATION_TYPE = exports.UNKNOWN_OPERATION_TYPE = 'type.unknown';

var MIN_WEBOOB_VERSION = exports.MIN_WEBOOB_VERSION = '1.2';