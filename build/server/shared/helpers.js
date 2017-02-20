'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.UNKNOWN_OPERATION_TYPE = exports.currency = exports.localeComparator = undefined;

var _map = require('babel-runtime/core-js/map');

var _map2 = _interopRequireDefault(_map);

exports.assert = assert;
exports.maybeHas = maybeHas;
exports.assertHas = assertHas;
exports.NYI = NYI;
exports.setupTranslator = setupTranslator;
exports.translate = translate;

var _nodePolyglot = require('node-polyglot');

var _nodePolyglot2 = _interopRequireDefault(_nodePolyglot);

var _currencyFormatter = require('currency-formatter');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint no-console: 0 */

// Locales
var FR_LOCALE = require('./locales/fr');
var EN_LOCALE = require('./locales/en');

var ASSERTS = true;

function assert(x, wat) {
    if (!x) {
        var text = 'Assertion error: ' + (wat ? wat : '') + '\n' + new Error().stack;
        if (ASSERTS) {
            if (window && window.alert) {
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
    switch (locale) {
        case 'fr':
            p.extend(FR_LOCALE);
            break;
        case 'en':
            p.extend(EN_LOCALE);
            break;
        default:
            console.log("Didn't find locale", locale, 'using en-us instead.');
            found = false;
            p.extend(EN_LOCALE);
            break;
    }

    translator = p.t.bind(p);
    appLocale = locale;
    alertMissing = found;
}

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
        var cache = new _map2.default();
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