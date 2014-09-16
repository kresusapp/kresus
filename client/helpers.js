/*
 * HELPERS
 */

const DEBUG = true;
const ASSERTS = true;

exports.debug = function debug() {
    DEBUG && console.log.apply(console, arguments);
};

var assert = exports.assert = function(x, wat) {
    if (!x) {
        ASSERTS && alert('assertion error: ' + (wat?wat+'\n':'') + new Error().stack);
        return false;
    }
    return true;
};

exports.has = function has(obj, prop) {
    return assert(obj.hasOwnProperty(prop));
}
