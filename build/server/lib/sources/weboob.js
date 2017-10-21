'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.updateWeboobModules = exports.fetchOperations = exports.fetchAccounts = exports.getVersion = exports.testInstall = exports.SOURCE_NAME = undefined;

var testInstall = exports.testInstall = function () {
    var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        _context.prev = 0;

                        log.info('Checking that weboob is installed and can actually be called…');
                        _context.next = 4;
                        return callWeboob('test');

                    case 4:
                        return _context.abrupt('return', true);

                    case 7:
                        _context.prev = 7;
                        _context.t0 = _context['catch'](0);

                        log.error('When testing install: ' + _context.t0);
                        _config2.default.invalidateWeboobVersionCache();
                        return _context.abrupt('return', false);

                    case 12:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this, [[0, 7]]);
    }));

    return function testInstall() {
        return _ref.apply(this, arguments);
    };
}();

var getVersion = exports.getVersion = function () {
    var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2() {
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        _context2.prev = 0;
                        _context2.next = 3;
                        return callWeboob('version');

                    case 3:
                        return _context2.abrupt('return', _context2.sent);

                    case 6:
                        _context2.prev = 6;
                        _context2.t0 = _context2['catch'](0);

                        log.error('When getting Weboob version: ' + _context2.t0);
                        return _context2.abrupt('return', '?');

                    case 10:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, this, [[0, 6]]);
    }));

    return function getVersion() {
        return _ref2.apply(this, arguments);
    };
}();

var _fetchHelper = function () {
    var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(command, access) {
        var isDebugEnabled;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        _context3.prev = 0;
                        _context3.next = 3;
                        return _config2.default.findOrCreateDefaultBooleanValue('weboob-enable-debug');

                    case 3:
                        isDebugEnabled = _context3.sent;
                        _context3.next = 6;
                        return callWeboob(command, access, isDebugEnabled);

                    case 6:
                        return _context3.abrupt('return', _context3.sent);

                    case 9:
                        _context3.prev = 9;
                        _context3.t0 = _context3['catch'](0);
                        _context3.next = 13;
                        return testInstall();

                    case 13:
                        if (_context3.sent) {
                            _context3.next = 15;
                            break;
                        }

                        throw new _helpers.KError("Weboob doesn't seem to be installed, skipping fetch.", 500, _errors.WEBOOB_NOT_INSTALLED);

                    case 15:
                        log.info('Got error while fetching ' + command + ': ' + _context3.t0.error_code + '.');
                        throw _context3.t0;

                    case 17:
                    case 'end':
                        return _context3.stop();
                }
            }
        }, _callee3, this, [[0, 9]]);
    }));

    return function _fetchHelper(_x2, _x3) {
        return _ref3.apply(this, arguments);
    };
}();

var fetchAccounts = exports.fetchAccounts = function () {
    var _ref4 = _asyncToGenerator(regeneratorRuntime.mark(function _callee4(access) {
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
            while (1) {
                switch (_context4.prev = _context4.next) {
                    case 0:
                        _context4.next = 2;
                        return _fetchHelper('accounts', access);

                    case 2:
                        return _context4.abrupt('return', _context4.sent);

                    case 3:
                    case 'end':
                        return _context4.stop();
                }
            }
        }, _callee4, this);
    }));

    return function fetchAccounts(_x4) {
        return _ref4.apply(this, arguments);
    };
}();

var fetchOperations = exports.fetchOperations = function () {
    var _ref5 = _asyncToGenerator(regeneratorRuntime.mark(function _callee5(access) {
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
            while (1) {
                switch (_context5.prev = _context5.next) {
                    case 0:
                        _context5.next = 2;
                        return _fetchHelper('operations', access);

                    case 2:
                        return _context5.abrupt('return', _context5.sent);

                    case 3:
                    case 'end':
                        return _context5.stop();
                }
            }
        }, _callee5, this);
    }));

    return function fetchOperations(_x5) {
        return _ref5.apply(this, arguments);
    };
}();

// Can throw.


var updateWeboobModules = exports.updateWeboobModules = function () {
    var _ref6 = _asyncToGenerator(regeneratorRuntime.mark(function _callee6() {
        return regeneratorRuntime.wrap(function _callee6$(_context6) {
            while (1) {
                switch (_context6.prev = _context6.next) {
                    case 0:
                        _context6.next = 2;
                        return callWeboob('update');

                    case 2:
                    case 'end':
                        return _context6.stop();
                }
            }
        }, _callee6, this);
    }));

    return function updateWeboobModules() {
        return _ref6.apply(this, arguments);
    };
}();

var _child_process = require('child_process');

var _path = require('path');

var path = _interopRequireWildcard(_path);

var _helpers = require('../../helpers');

var _errors = require('../../shared/errors.json');

var _config = require('../../models/config');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } // This module retrieves real values from the weboob backend, by using the given
// bankuuid / login / password (maybe customFields) combination.


var log = (0, _helpers.makeLogger)('sources/weboob');

var SOURCE_NAME = exports.SOURCE_NAME = 'weboob';

// Possible commands include:
// - test: test whether weboob is accessible from the current kresus user.
// - version: get weboob's version number.
// - update: updates weboob modules.
// All the following commands require $bank $login $password $customFields:
// - accounts
// - operations
// To enable Weboob debug, one should pass an extra `--debug` argument.
function callWeboob(command, access) {
    var debug = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

    return new Promise(function (accept, reject) {
        log.info('Calling weboob: command ' + command + '...');

        // Set up the environment:
        // We need to copy the whole `process.env` to ensure we don't break any
        // user setup, such as virtualenvs.

        var env = Object.assign({}, process.env);
        if (process.kresus.weboobDir) env.WEBOOB_DIR = process.kresus.weboobDir;
        if (process.kresus.dataDir) env.KRESUS_DIR = process.kresus.dataDir;
        if (process.kresus.weboobSourcesList) env.WEBOOB_SOURCES_LIST = process.kresus.weboobSourcesList;

        // Variable for PyExecJS, necessary for the Paypal module.
        env.EXECJS_RUNTIME = 'Node';

        var pythonExec = process.kresus.pythonExec;
        var script = (0, _child_process.spawn)(pythonExec, [path.join(path.dirname(__filename), '..', '..', 'weboob/main.py')], { env: env });

        var weboobArgs = [command];

        if (debug) {
            weboobArgs.push('--debug');
        }

        if (command === 'accounts' || command === 'operations') {
            weboobArgs.push(access.bank, access.login, access.password);
            if (typeof access.customFields !== 'undefined') {
                // We have to escape quotes in the customFields JSON to prevent
                // them from being interpreted as shell quotes.
                weboobArgs.push('\'' + access.customFields + '\'');
            }
        }

        var stdin = weboobArgs.join(' ');
        script.stdin.write(stdin + '\n');
        script.stdin.end();

        var stdout = '';
        script.stdout.on('data', function (data) {
            stdout += data.toString();
        });

        var stderr = '';
        script.stderr.on('data', function (data) {
            stderr += data.toString();
        });

        script.on('close', function (code) {
            log.info('exited with code ' + code + '.');

            if (stderr.trim().length) {
                // Log anything that went to stderr.
                log.warn('stderr: ' + stderr);
            }

            // Parse JSON response
            // Any error (be it a crash of the Python script or a legit error
            // from Weboob) will result in a non-zero error code. Hence, we
            // should first try to parse stdout as JSON, to retrieve an
            // eventual legit error, and THEN check the return code.
            try {
                stdout = JSON.parse(stdout);
            } catch (e) {
                // We got an invalid JSON response, there is a real and
                // important error.
                if (code !== 0) {
                    // If code is non-zero, treat as stderr, that is a crash of
                    // the Python script.
                    return reject(new _helpers.KError('Process exited with non-zero error code ' + code + '. Unknown error. Stderr was ' + stderr, 500));
                }
                // Else, treat it as invalid JSON
                // This should never happen, it would be a programming error.
                return reject(new _helpers.KError('Invalid JSON response: ' + e.message + '.', 500));
            }

            // If valid JSON output, check for an error within JSON
            if (typeof stdout.error_code !== 'undefined') {
                log.info('JSON error payload.');

                var httpErrorCode = void 0;
                if (stdout.error_code === _errors.WEBOOB_NOT_INSTALLED || stdout.error_code === _errors.GENERIC_EXCEPTION || stdout.error_code === _errors.INTERNAL_ERROR) {
                    // 500 for errors related to the server internals / server config
                    httpErrorCode = 500;
                } else if (stdout.error_code === _errors.EXPIRED_PASSWORD || stdout.error_code === _errors.INVALID_PASSWORD) {
                    // 401 (Unauthorized) if there is an issue with the credentials
                    httpErrorCode = 401;
                } else {
                    // In general, return a 400 (Bad Request)
                    httpErrorCode = 400;
                }

                return reject(new _helpers.KError(stdout.error_message, httpErrorCode, stdout.error_code, stdout.error_short));
            }

            log.info('OK: weboob exited normally with non-empty JSON content.');
            accept(stdout.values);
        });
    });
}