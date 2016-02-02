'use strict';

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.makeLogger = makeLogger;
exports.sendErr = sendErr;
exports.asyncErr = asyncErr;
exports.promisify = promisify;
exports.promisifyModel = promisifyModel;

var _printit = require('printit');

var _printit2 = _interopRequireDefault(_printit);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function makeLogger(prefix) {
    return (0, _printit2.default)({
        prefix: prefix,
        date: true
    });
}

var log = makeLogger('helpers');

function sendErr(res, context) {
    var statusCode = arguments.length <= 2 || arguments[2] === undefined ? 500 : arguments[2];
    var userMessage = arguments.length <= 3 || arguments[3] === undefined ? 'Internal server error.' : arguments[3];
    var code = arguments[4];

    log.error('Error: ' + context + ' - ' + userMessage);
    res.status(statusCode).send({
        code: code,
        message: userMessage
    });
    return false;
}

function asyncErr(res, err, context) {
    var logMessage = context + ': ' + err.toString();

    var statusCode = err.status;
    if (!statusCode) {
        log.warn('no status in asyncErr');
        statusCode = 500;
    }

    var errorMessage = err.message;
    if (!errorMessage) {
        log.warn('no error message in asyncErr');
        errorMessage = 'Internal server error';
    }

    var errorCode = err.code;

    var userMessage = (context ? context + ': ' : '') + errorMessage;
    return sendErr(res, logMessage, statusCode, userMessage, errorCode);
}

// Transforms a function of the form (arg1, arg2, ..., argN, callback) into a
// Promise-based function (arg1, arg2, ..., argN) that will resolve with the
// results of the callback if there's no error, or reject if there's any error.
// XXX How to make sure the function hasn't been passed to promisify once
// already?
function promisify(func) {
    return function () {
        var _this = this;

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        // Note: "this" is extracted from this scope.
        return new _promise2.default(function (accept, reject) {
            // Add the callback function to the list of args
            args.push(function (err) {
                for (var _len2 = arguments.length, rest = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
                    rest[_key2 - 1] = arguments[_key2];
                }

                if (typeof err !== 'undefined' && err !== null) {
                    reject(err);
                    return;
                }

                if (rest.length === 1) accept(rest[0]);else accept.apply(undefined, rest);
            });
            // Call the callback-based function
            func.apply(_this, args);
        });
    };
}

// Promisifies a few cozy-db methods by default
function promisifyModel(model) {

    var statics = ['exists', 'find', 'create', 'save', 'updateAttributes', 'destroy', 'all'];

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = (0, _getIterator3.default)(statics), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var name = _step.value;

            var former = model[name];
            model[name] = promisify(former.bind(model));
        }
    } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
            }
        } finally {
            if (_didIteratorError) {
                throw _iteratorError;
            }
        }
    }

    var methods = ['save', 'updateAttributes', 'destroy'];

    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
        for (var _iterator2 = (0, _getIterator3.default)(methods), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var name = _step2.value;

            var former = model.prototype[name];
            model.prototype[name] = promisify(former);
        }
    } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion2 && _iterator2.return) {
                _iterator2.return();
            }
        } finally {
            if (_didIteratorError2) {
                throw _iteratorError2;
            }
        }
    }

    return model;
}