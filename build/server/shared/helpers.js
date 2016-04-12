'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.assert = assert;
exports.maybeHas = maybeHas;
exports.has = has;
exports.NYI = NYI;
exports.setupTranslator = setupTranslator;
exports.translate = translate;

var _nodePolyglot = require('node-polyglot');

var _nodePolyglot2 = _interopRequireDefault(_nodePolyglot);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint no-console: 0 */

// Locales
// Force importing locales here, so that the module system loads them ahead
// of time.
var localesPath = './locales/';

require('./locales/fr');
require('./locales/en');

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

function has(obj, prop, wat) {
    return assert(maybeHas(obj, prop), wat || 'object should have property ' + prop);
}

function NYI() {
    throw 'Not yet implemented';
}

var translator = null;
var alertMissing = null;
function setupTranslator(locale) {
    var p = new _nodePolyglot2.default({ allowMissing: true });
    var found = false;
    try {
        p.extend(require(localesPath + locale));
        found = true;
    } catch (e) {
        // Default locale is 'en', so the error shouldn't be shown in this
        // case.
        if (locale !== 'en') {
            console.log(e);
            p.extend(require(localesPath + 'en'));
        }
    }
    translator = p.t.bind(p);
    alertMissing = found;
}

function translate(format) {
    var bindings = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    var augmentedBindings = bindings;
    augmentedBindings._ = '';

    var ret = translator(format, augmentedBindings);
    if (ret === '' && alertMissing) {
        console.log('Missing translation key for "' + format + '"');
        return format;
    }

    return ret;
}