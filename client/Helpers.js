/*
 * HELPERS
 */

const DEBUG = true;
const ASSERTS = true;

var debug = exports.debug = function() {
    DEBUG && console.log.apply(console, arguments);
};

var assert = exports.assert = function(x, wat) {
    if (!x) {
        var text = 'Assertion error: ' + (wat?wat:'') + '\n' + new Error().stack;
        ASSERTS && alert(text);
        console.log(text);
        return false;
    }
    return true;
};

var maybeHas = exports.maybeHas = function(obj, prop) {
    return obj.hasOwnProperty(prop);
}

exports.has = function has(obj, prop) {
    return assert(maybeHas(obj, prop), 'object should have property ' + prop);
}

exports.xhrError = function xhrError(xhr, textStatus, err) {
    alert('xhr error: ' + textStatus + '\n' + err);
}

exports.NONE_CATEGORY_ID = '-1';
exports.NONE_CATEGORY_TITLE = 'None';

