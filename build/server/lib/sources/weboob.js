'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.updateWeboobModules = exports.fetchTransactions = exports.fetchAccounts = exports.getVersion = exports.testInstall = exports.SOURCE_NAME = undefined;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var testInstall = exports.testInstall = function () {
    var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        _context.prev = 0;
                        _context.next = 3;
                        return callWeboob('test');

                    case 3:
                        return _context.abrupt('return', true);

                    case 6:
                        _context.prev = 6;
                        _context.t0 = _context['catch'](0);

                        log.error('When testing install: ' + _context.t0);
                        return _context.abrupt('return', false);

                    case 10:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this, [[0, 6]]);
    }));

    return function testInstall() {
        return _ref.apply(this, arguments);
    };
}();

var getVersion = exports.getVersion = function () {
    var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2() {
        return _regenerator2.default.wrap(function _callee2$(_context2) {
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

// FIXME The import of Config is deferred because Config imports this file for
// testInstall.


var testInstallAndFetch = function () {
    var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(command, access) {
        var extendedCommand;
        return _regenerator2.default.wrap(function _callee3$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        Config = Config || require('../../models/config');

                        extendedCommand = command;
                        _context3.next = 4;
                        return Config.findOrCreateDefaultBooleanValue('weboob-enable-debug');

                    case 4:
                        if (!_context3.sent) {
                            _context3.next = 6;
                            break;
                        }

                        extendedCommand = 'debug-' + command;

                    case 6:
                        _context3.next = 8;
                        return testInstall();

                    case 8:
                        if (!_context3.sent) {
                            _context3.next = 12;
                            break;
                        }

                        _context3.next = 11;
                        return callWeboob(extendedCommand, access);

                    case 11:
                        return _context3.abrupt('return', _context3.sent);

                    case 12:
                        throw new _helpers.KError("Weboob doesn't seem to be installed, skipping fetch.");

                    case 13:
                    case 'end':
                        return _context3.stop();
                }
            }
        }, _callee3, this);
    }));

    return function testInstallAndFetch(_x, _x2) {
        return _ref3.apply(this, arguments);
    };
}();

var fetchAccounts = exports.fetchAccounts = function () {
    var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4(access) {
        return _regenerator2.default.wrap(function _callee4$(_context4) {
            while (1) {
                switch (_context4.prev = _context4.next) {
                    case 0:
                        _context4.next = 2;
                        return testInstallAndFetch('accounts', access);

                    case 2:
                        return _context4.abrupt('return', _context4.sent);

                    case 3:
                    case 'end':
                        return _context4.stop();
                }
            }
        }, _callee4, this);
    }));

    return function fetchAccounts(_x3) {
        return _ref4.apply(this, arguments);
    };
}();

var fetchTransactions = exports.fetchTransactions = function () {
    var _ref5 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee5(access) {
        return _regenerator2.default.wrap(function _callee5$(_context5) {
            while (1) {
                switch (_context5.prev = _context5.next) {
                    case 0:
                        _context5.next = 2;
                        return testInstallAndFetch('transactions', access);

                    case 2:
                        return _context5.abrupt('return', _context5.sent);

                    case 3:
                    case 'end':
                        return _context5.stop();
                }
            }
        }, _callee5, this);
    }));

    return function fetchTransactions(_x4) {
        return _ref5.apply(this, arguments);
    };
}();

var updateWeboobModules = exports.updateWeboobModules = function () {
    var _ref6 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee6() {
        return _regenerator2.default.wrap(function _callee6$(_context6) {
            while (1) {
                switch (_context6.prev = _context6.next) {
                    case 0:
                        _context6.prev = 0;
                        _context6.next = 3;
                        return callWeboob('update');

                    case 3:
                        return _context6.abrupt('return', true);

                    case 6:
                        _context6.prev = 6;
                        _context6.t0 = _context6['catch'](0);
                        return _context6.abrupt('return', false);

                    case 9:
                    case 'end':
                        return _context6.stop();
                }
            }
        }, _callee6, this, [[0, 6]]);
    }));

    return function updateWeboobModules() {
        return _ref6.apply(this, arguments);
    };
}();

var _child_process = require('child_process');

var _path = require('path');

var path = _interopRequireWildcard(_path);

var _helpers = require('../../helpers');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var log = (0, _helpers.makeLogger)('sources/weboob'); // This module retrieves real values from the weboob backend, by using the given
// bankuuid / login / password (maybe customFields) combination.
var SOURCE_NAME = exports.SOURCE_NAME = 'weboob';

// Possible commands include:
// - test: test whether weboob is accessible from the current kresus user.
// - version: get weboob's version number.
// - update: updates weboob modules.
// All the four following commands require $bank $login $password $customFields:
// - accounts
// - transactions
// - debug-accounts
// - debug-transactions
function callWeboob(command, access) {
    return new _promise2.default(function (accept, reject) {
        log.info('Calling weboob: command ' + command + '...');

        var serverRoot = path.join(__filename, '..', '..', '..');

        // Set up the environment.
        var env = {};
        if (process.env.KRESUS_WEBOOB_DIR) env.WEBOOB_DIR = process.env.KRESUS_WEBOOB_DIR;

        // Variables for PyExecJS, necessary for the Paypal module.
        env.PATH = process.env.PATH;
        env.EXECJS_RUNTIME = process.env.EXECJS_RUNTIME || 'Node';

        var script = (0, _child_process.spawn)('./weboob/main.py', [], { cwd: serverRoot, env: env });

        script.stdin.write(command + '\n');

        if (command.indexOf('accounts') !== -1 || command.indexOf('transactions') !== -1) {
            var bankuuid = access.bank,
                login = access.login,
                password = access.password,
                customFields = access.customFields;

            script.stdin.write(bankuuid + '\n');
            script.stdin.write(login + '\n');
            script.stdin.write(password + '\n');
            if (typeof customFields !== 'undefined') script.stdin.write(customFields + '\n');
        }

        script.stdin.end();

        var stdout = '';
        script.stdout.on('data', function (data) {
            stdout += data.toString();
        });

        var stderr = void 0;
        script.stderr.on('data', function (data) {
            stderr = stderr || '';
            stderr += data.toString();
        });

        script.on('close', function (code) {

            log.info('exited with code ' + code);

            if (stderr && stderr.trim().length) {
                log.info('stderr: ' + stderr);
            }

            if (code !== 0) {
                log.info('Command left with non-zero code.');
                reject(new _helpers.KError('Weboob failure: ' + stderr));
                return;
            }

            if (command === 'test' || command === 'update') {
                accept();
                return;
            }

            var parseJsonError = null;
            try {
                stdout = JSON.parse(stdout);
            } catch (e) {
                parseJsonError = e.stack;
            }

            if (parseJsonError || typeof stdout.error_code !== 'undefined') {
                log.warn('Weboob error, stderr: ' + stderr);
                var error = new _helpers.KError('Error when parsing weboob json:\n- stdout: ' + (typeof stdout === 'string' ? stdout : (0, _stringify2.default)(stdout)) + '\n- stderr: ' + stderr + '\n- JSON error: ' + parseJsonError + ',\n- error_code: ' + stdout.error_code, 500, stdout.error_code);
                reject(error);
                return;
            }

            log.info('OK: weboob exited normally with non-empty JSON content.');
            accept(stdout.values);
        });
    });
}

var Config = null;