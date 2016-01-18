'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.init = exports.updateWeboobModules = exports.installOrUpdateWeboob = exports.testInstall = exports.SOURCE_NAME = undefined;
exports.fetchAccounts = fetchAccounts;
exports.fetchOperations = fetchOperations;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _child_process = require('child_process');

var _helpers = require('../../helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// This module retrieves real values from the weboob backend, by using the given
// bankuuid / login / password (maybe customFields) combination.

var log = (0, _helpers.makeLogger)('sources/weboob');

var SOURCE_NAME = exports.SOURCE_NAME = 'weboob';

var ErrorString = '\n\n!!! !!! !!! !!! !!! !!! !!! !!! !!! !!! !!! !!! !!! !!! !!! !!! !!! !!! !!! !!!\n[en] error when installing weboob: please contact a kresus maintainer on github\nor irc and keep the error message handy.\n[fr] installation de weboob: merci de contacter un mainteneur de kresus sur\ngithub ou irc en gardant le message à portée de main.\n!!! !!! !!! !!! !!! !!! !!! !!! !!! !!! !!! !!! !!! !!! !!! !!! !!! !!! !!! !!!\n\n';

var fetch = function fetch(process, access) {
    var bankuuid = access.bank;
    var login = access.login;
    var password = access.password;
    var customFields = access.customFields;

    return new _promise2.default(function (accept, reject) {

        log.info('Fetch started: running process ' + process + '...');
        var script = (0, _child_process.spawn)(process, []);

        script.stdin.write(bankuuid + '\n');
        script.stdin.write(login + '\n');
        script.stdin.write(password + '\n');

        if (typeof customFields !== 'undefined') script.stdin.write(customFields + '\n');

        script.stdin.end();

        var body = '';
        script.stdout.on('data', function (data) {
            body += data.toString();
        });

        var err = undefined;
        script.stderr.on('data', function (data) {
            err = err || '';
            err += data.toString();
        });

        script.on('close', function (code) {

            log.info('weboob exited with code ' + code);

            if (err) log.info('stderr: ' + err);

            if (!body.length) {
                reject('no bodyerror: ' + err);
                return;
            }

            try {
                body = JSON.parse(body);
            } catch (e) {
                reject('Error when parsing weboob json:\n- stdout: ' + body + '\n- stderr: ' + e);
                return;
            }

            if (typeof body.error_code !== 'undefined') {
                var error = {
                    code: body.error_code
                };
                error.message = body.error_content;
                log.warn('Weboob error, stderr: ' + err);
                reject(error);
                return;
            }

            log.info('OK: weboob exited normally with non-empty JSON content.');
            accept(body);
        });
    });
};

var testInstall = exports.testInstall = function testInstall() {
    return new _promise2.default(function (accept) {
        var script = (0, _child_process.spawn)('./weboob/scripts/test.sh');

        var stdout = '',
            stderr = '';
        script.stdout.on('data', function (data) {
            if (data) stdout += data.toString() + '\n';
        });

        script.stderr.on('data', function (data) {
            if (data) stderr += data.toString() + '\n';
        });

        script.on('close', function (code) {
            if (code !== 0) {
                log.warn('\n- test install stdout: ' + stdout + '\n- test install stderr: ' + stderr);
            }

            // If code is 0, it worked!
            accept(code === 0);
        });
    });
};

var testInstallAndFetch = (function () {
    var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(process, access) {
        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        _context.next = 2;
                        return testInstall();

                    case 2:
                        if (!_context.sent) {
                            _context.next = 4;
                            break;
                        }

                        return _context.abrupt('return', fetch(process, access));

                    case 4:
                        throw "Weboob doesn't seem to be installed, skipping fetch.";

                    case 5:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));
    return function testInstallAndFetch(_x, _x2) {
        return ref.apply(this, arguments);
    };
})();

function fetchAccounts(access) {
    return testInstallAndFetch('./weboob/scripts/accounts.sh', access);
}

function fetchOperations(access) {
    return testInstallAndFetch('./weboob/scripts/operations.sh', access);
}

var installOrUpdateWeboob = exports.installOrUpdateWeboob = (function () {
    var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(forceUpdate) {
        var isInstalled, script, onclose, code;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        _context2.next = 2;
                        return testInstall();

                    case 2:
                        isInstalled = _context2.sent;

                        log.info('Is it installed? ' + isInstalled);

                        if (!(isInstalled && !forceUpdate)) {
                            _context2.next = 7;
                            break;
                        }

                        log.info('Already installed and it works, carry on.');
                        return _context2.abrupt('return', true);

                    case 7:

                        log.info("=> No it isn't. Installing weboob...");
                        script = (0, _child_process.spawn)('./weboob/scripts/install.sh', []);

                        script.stdout.on('data', function (data) {
                            if (data) log.info('install.sh stdout -- ' + data.toString());
                        });

                        script.stderr.on('data', function (data) {
                            if (data) log.info('install.sh stderr -- ' + data.toString());
                        });

                        onclose = function onclose() {
                            return new _promise2.default(function (accept) {
                                script.on('close', accept);
                            });
                        };

                        _context2.next = 14;
                        return onclose();

                    case 14:
                        code = _context2.sent;

                        if (!(code !== 0)) {
                            _context2.next = 17;
                            break;
                        }

                        throw 'return code of install.sh is ' + code + ', not 0.';

                    case 17:
                        log.info('install.sh returned with code ' + code);

                        log.info('weboob installation done');
                        return _context2.abrupt('return', true);

                    case 20:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, this);
    }));
    return function installOrUpdateWeboob(_x3) {
        return ref.apply(this, arguments);
    };
})();

var updateWeboobModules = exports.updateWeboobModules = (function () {
    var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3() {
        var script, onclose, code;
        return _regenerator2.default.wrap(function _callee3$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        script = (0, _child_process.spawn)('./weboob/scripts/update-modules.sh', []);

                        script.stdout.on('data', function (data) {
                            if (data) log.info('update-modules.sh stdout -- ' + data.toString());
                        });

                        script.stderr.on('data', function (data) {
                            if (data) log.info('update-modules.sh stderr -- ' + data.toString());
                        });

                        onclose = function onclose() {
                            return new _promise2.default(function (accept) {
                                script.on('close', accept);
                            });
                        };

                        _context3.next = 6;
                        return onclose();

                    case 6:
                        code = _context3.sent;

                        log.info('update-modules.sh closed with code: ' + code);

                        if (!(code !== 0)) {
                            _context3.next = 10;
                            break;
                        }

                        throw 'return code of update-modules.sh is ' + code + ', not 0.';

                    case 10:

                        log.info('update-modules.sh Update done!');

                    case 11:
                    case 'end':
                        return _context3.stop();
                }
            }
        }, _callee3, this);
    }));
    return function updateWeboobModules() {
        return ref.apply(this, arguments);
    };
})();

// Each installation of kresus should trigger an installation or update of
// weboob.

var init = exports.init = (function () {
    var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4() {
        var i, forceInstall, success;
        return _regenerator2.default.wrap(function _callee4$(_context4) {
            while (1) {
                switch (_context4.prev = _context4.next) {
                    case 0:
                        i = 0;

                    case 1:
                        if (!(i < 3)) {
                            _context4.next = 23;
                            break;
                        }

                        forceInstall = i !== 0;
                        _context4.prev = 3;
                        _context4.next = 6;
                        return installOrUpdateWeboob(forceInstall);

                    case 6:
                        success = _context4.sent;

                        if (!success) {
                            _context4.next = 10;
                            break;
                        }

                        log.info('installation/update succeeded. Weboob can be used!');
                        return _context4.abrupt('return');

                    case 10:
                        _context4.next = 20;
                        break;

                    case 12:
                        _context4.prev = 12;
                        _context4.t0 = _context4['catch'](3);

                        log.error('error on install/update, attempt #' + i + ': ' + _context4.t0);

                        if (!(i < 3)) {
                            _context4.next = 19;
                            break;
                        }

                        log.info('retrying...');
                        _context4.next = 20;
                        break;

                    case 19:
                        throw ErrorString;

                    case 20:
                        i++;
                        _context4.next = 1;
                        break;

                    case 23:
                    case 'end':
                        return _context4.stop();
                }
            }
        }, _callee4, this, [[3, 12]]);
    }));
    return function init() {
        return ref.apply(this, arguments);
    };
})();