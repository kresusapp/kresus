'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.update = exports.fetchAccounts = exports.fetchOperations = exports.create = exports.destroy = exports.getAccounts = exports.preloadAccess = undefined;

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

// Preloads a bank access (sets @access).
var preloadAccess = exports.preloadAccess = function () {
    var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(req, res, next, accessId) {
        var access;
        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        _context.prev = 0;
                        _context.next = 3;
                        return _access2.default.find(accessId);

                    case 3:
                        access = _context.sent;

                        if (access) {
                            _context.next = 6;
                            break;
                        }

                        throw new _helpers.KError('bank access not found', 404);

                    case 6:
                        req.preloaded = { access: access };
                        next();
                        _context.next = 13;
                        break;

                    case 10:
                        _context.prev = 10;
                        _context.t0 = _context['catch'](0);
                        return _context.abrupt('return', (0, _helpers.asyncErr)(res, _context.t0, 'when finding bank access'));

                    case 13:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this, [[0, 10]]);
    }));

    return function preloadAccess(_x, _x2, _x3, _x4) {
        return _ref.apply(this, arguments);
    };
}();

// Returns accounts bound to a given access.


var getAccounts = exports.getAccounts = function () {
    var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(req, res) {
        var accounts;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        _context2.prev = 0;
                        _context2.next = 3;
                        return _account2.default.byAccess(req.preloaded.access);

                    case 3:
                        accounts = _context2.sent;

                        res.status(200).send(accounts);
                        _context2.next = 10;
                        break;

                    case 7:
                        _context2.prev = 7;
                        _context2.t0 = _context2['catch'](0);
                        return _context2.abrupt('return', (0, _helpers.asyncErr)(_context2.t0, res, 'when getting accounts for a bank'));

                    case 10:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, this, [[0, 7]]);
    }));

    return function getAccounts(_x5, _x6) {
        return _ref2.apply(this, arguments);
    };
}();

// Destroy a given access, including accounts, alerts and operations.


var destroy = exports.destroy = function () {
    var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(req, res) {
        var access, accounts, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, account, stillThere;

        return _regenerator2.default.wrap(function _callee3$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        _context3.prev = 0;
                        access = req.preloaded.access;

                        log.info('Removing access ' + access.id + ' for bank ' + access.bank + '...');

                        // TODO arguably, this should be done in the access model.
                        _context3.next = 5;
                        return _account2.default.byAccess(access);

                    case 5:
                        accounts = _context3.sent;
                        _iteratorNormalCompletion = true;
                        _didIteratorError = false;
                        _iteratorError = undefined;
                        _context3.prev = 9;
                        _iterator = (0, _getIterator3.default)(accounts);

                    case 11:
                        if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                            _context3.next = 18;
                            break;
                        }

                        account = _step.value;
                        _context3.next = 15;
                        return AccountController.destroyWithOperations(account);

                    case 15:
                        _iteratorNormalCompletion = true;
                        _context3.next = 11;
                        break;

                    case 18:
                        _context3.next = 24;
                        break;

                    case 20:
                        _context3.prev = 20;
                        _context3.t0 = _context3['catch'](9);
                        _didIteratorError = true;
                        _iteratorError = _context3.t0;

                    case 24:
                        _context3.prev = 24;
                        _context3.prev = 25;

                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }

                    case 27:
                        _context3.prev = 27;

                        if (!_didIteratorError) {
                            _context3.next = 30;
                            break;
                        }

                        throw _iteratorError;

                    case 30:
                        return _context3.finish(27);

                    case 31:
                        return _context3.finish(24);

                    case 32:
                        _context3.next = 34;
                        return _access2.default.exists(access.id);

                    case 34:
                        stillThere = _context3.sent;

                        if (!stillThere) {
                            _context3.next = 39;
                            break;
                        }

                        log.error('Access should have been deleted! Manually deleting.');
                        _context3.next = 39;
                        return access.destroy();

                    case 39:

                        log.info('Done!');
                        res.sendStatus(204);
                        _context3.next = 46;
                        break;

                    case 43:
                        _context3.prev = 43;
                        _context3.t1 = _context3['catch'](0);
                        return _context3.abrupt('return', (0, _helpers.asyncErr)(res, _context3.t1, 'when destroying an access'));

                    case 46:
                    case 'end':
                        return _context3.stop();
                }
            }
        }, _callee3, this, [[0, 43], [9, 20, 24, 32], [25,, 27, 31]]);
    }));

    return function destroy(_x7, _x8) {
        return _ref3.apply(this, arguments);
    };
}();

// Creates a new bank access (expecting at least (bank / login / password)), and
// retrieves its accounts and operations.


var create = exports.create = function () {
    var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4(req, res) {
        var access, createdAccess, retrievedAccounts, params, similarAccesses, errcode, manager, accounts, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, acc;

        return _regenerator2.default.wrap(function _callee4$(_context4) {
            while (1) {
                switch (_context4.prev = _context4.next) {
                    case 0:
                        access = void 0;
                        createdAccess = false, retrievedAccounts = false;
                        _context4.prev = 2;
                        params = req.body;

                        if (!(!params.bank || !params.login || !params.password)) {
                            _context4.next = 6;
                            break;
                        }

                        throw new _helpers.KError('missing parameters', 400);

                    case 6:
                        _context4.next = 8;
                        return _access2.default.allLike(params);

                    case 8:
                        similarAccesses = _context4.sent;

                        if (!similarAccesses.length) {
                            _context4.next = 12;
                            break;
                        }

                        errcode = (0, _helpers.getErrorCode)('BANK_ALREADY_EXISTS');
                        throw new _helpers.KError('bank already exists', 409, errcode);

                    case 12:
                        _context4.next = 14;
                        return _access2.default.create(params);

                    case 14:
                        access = _context4.sent;

                        createdAccess = true;

                        // For account creation, use your own instance of account manager, to
                        // make sure not to perturbate other operations.
                        manager = new _accountsManager2.default();
                        _context4.next = 19;
                        return manager.retrieveAndAddAccountsByAccess(access);

                    case 19:
                        retrievedAccounts = true;

                        _context4.next = 22;
                        return manager.retrieveOperationsByAccess(access);

                    case 22:
                        res.status(201).send(access.id);
                        _context4.next = 64;
                        break;

                    case 25:
                        _context4.prev = 25;
                        _context4.t0 = _context4['catch'](2);

                        log.error('The access process creation failed, cleaning up...');

                        // Silently swallow errors here, we don't want to catch errors in error
                        // code.

                        if (!retrievedAccounts) {
                            _context4.next = 59;
                            break;
                        }

                        log.info('\tdeleting accounts...');
                        _context4.next = 32;
                        return _account2.default.byAccess(access);

                    case 32:
                        accounts = _context4.sent;
                        _iteratorNormalCompletion2 = true;
                        _didIteratorError2 = false;
                        _iteratorError2 = undefined;
                        _context4.prev = 36;
                        _iterator2 = (0, _getIterator3.default)(accounts);

                    case 38:
                        if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
                            _context4.next = 45;
                            break;
                        }

                        acc = _step2.value;
                        _context4.next = 42;
                        return acc.destroy();

                    case 42:
                        _iteratorNormalCompletion2 = true;
                        _context4.next = 38;
                        break;

                    case 45:
                        _context4.next = 51;
                        break;

                    case 47:
                        _context4.prev = 47;
                        _context4.t1 = _context4['catch'](36);
                        _didIteratorError2 = true;
                        _iteratorError2 = _context4.t1;

                    case 51:
                        _context4.prev = 51;
                        _context4.prev = 52;

                        if (!_iteratorNormalCompletion2 && _iterator2.return) {
                            _iterator2.return();
                        }

                    case 54:
                        _context4.prev = 54;

                        if (!_didIteratorError2) {
                            _context4.next = 57;
                            break;
                        }

                        throw _iteratorError2;

                    case 57:
                        return _context4.finish(54);

                    case 58:
                        return _context4.finish(51);

                    case 59:
                        if (!createdAccess) {
                            _context4.next = 63;
                            break;
                        }

                        log.info('\tdeleting access...');
                        _context4.next = 63;
                        return access.destroy();

                    case 63:
                        return _context4.abrupt('return', (0, _helpers.asyncErr)(res, _context4.t0, 'when creating a bank access'));

                    case 64:
                    case 'end':
                        return _context4.stop();
                }
            }
        }, _callee4, this, [[2, 25], [36, 47, 51, 59], [52,, 54, 58]]);
    }));

    return function create(_x9, _x10) {
        return _ref4.apply(this, arguments);
    };
}();

// Fetch operations using the backend. Note: client needs to get the operations
// back.


var fetchOperations = exports.fetchOperations = function () {
    var _ref5 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee5(req, res) {
        var access;
        return _regenerator2.default.wrap(function _callee5$(_context5) {
            while (1) {
                switch (_context5.prev = _context5.next) {
                    case 0:
                        _context5.prev = 0;
                        access = req.preloaded.access;
                        // Fetch operations

                        _context5.next = 4;
                        return commonAccountManager.retrieveOperationsByAccess(access);

                    case 4:
                        res.sendStatus(200);
                        _context5.next = 10;
                        break;

                    case 7:
                        _context5.prev = 7;
                        _context5.t0 = _context5['catch'](0);
                        return _context5.abrupt('return', (0, _helpers.asyncErr)(res, _context5.t0, 'when fetching operations'));

                    case 10:
                    case 'end':
                        return _context5.stop();
                }
            }
        }, _callee5, this, [[0, 7]]);
    }));

    return function fetchOperations(_x11, _x12) {
        return _ref5.apply(this, arguments);
    };
}();

// Ditto but for accounts. Accounts and operations should be retrieved from the
// client as well.


var fetchAccounts = exports.fetchAccounts = function () {
    var _ref6 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee6(req, res) {
        var access;
        return _regenerator2.default.wrap(function _callee6$(_context6) {
            while (1) {
                switch (_context6.prev = _context6.next) {
                    case 0:
                        _context6.prev = 0;
                        access = req.preloaded.access;
                        _context6.next = 4;
                        return commonAccountManager.retrieveAndAddAccountsByAccess(access);

                    case 4:
                        _context6.next = 6;
                        return fetchOperations(req, res);

                    case 6:
                        _context6.next = 11;
                        break;

                    case 8:
                        _context6.prev = 8;
                        _context6.t0 = _context6['catch'](0);
                        return _context6.abrupt('return', (0, _helpers.asyncErr)(res, _context6.t0, 'when fetching accounts'));

                    case 11:
                    case 'end':
                        return _context6.stop();
                }
            }
        }, _callee6, this, [[0, 8]]);
    }));

    return function fetchAccounts(_x13, _x14) {
        return _ref6.apply(this, arguments);
    };
}();

// Updates the bank access


var update = exports.update = function () {
    var _ref7 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee7(req, res) {
        var access;
        return _regenerator2.default.wrap(function _callee7$(_context7) {
            while (1) {
                switch (_context7.prev = _context7.next) {
                    case 0:
                        _context7.prev = 0;
                        access = req.body;

                        if (access.password) {
                            _context7.next = 4;
                            break;
                        }

                        throw new _helpers.KError('missing password', 400);

                    case 4:
                        _context7.next = 6;
                        return req.preloaded.access.updateAttributes(access);

                    case 6:
                        _context7.next = 8;
                        return fetchAccounts(req, res);

                    case 8:
                        _context7.next = 13;
                        break;

                    case 10:
                        _context7.prev = 10;
                        _context7.t0 = _context7['catch'](0);
                        return _context7.abrupt('return', (0, _helpers.asyncErr)(res, _context7.t0, 'when updating bank access'));

                    case 13:
                    case 'end':
                        return _context7.stop();
                }
            }
        }, _callee7, this, [[0, 10]]);
    }));

    return function update(_x15, _x16) {
        return _ref7.apply(this, arguments);
    };
}();

var _access = require('../models/access');

var _access2 = _interopRequireDefault(_access);

var _account = require('../models/account');

var _account2 = _interopRequireDefault(_account);

var _accountsManager = require('../lib/accounts-manager');

var _accountsManager2 = _interopRequireDefault(_accountsManager);

var _accounts = require('./accounts');

var AccountController = _interopRequireWildcard(_accounts);

var _helpers = require('../helpers');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var log = (0, _helpers.makeLogger)('controllers/accesses');

var commonAccountManager = new _accountsManager2.default();