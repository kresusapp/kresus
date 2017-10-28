'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.update = exports.poll = exports.fetchAccounts = exports.fetchOperations = exports.create = exports.destroy = exports.getAccounts = exports.preloadAccess = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

// Preloads a bank access (sets @access).
var preloadAccess = exports.preloadAccess = function () {
    var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(req, res, next, accessId) {
        var access;
        return regeneratorRuntime.wrap(function _callee$(_context) {
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
                        return _context.abrupt('return', next());

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
    var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(req, res) {
        var accounts;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        _context2.prev = 0;
                        _context2.next = 3;
                        return _account2.default.byAccess(req.preloaded.access);

                    case 3:
                        accounts = _context2.sent;

                        res.status(200).json(accounts);
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
    var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(req, res) {
        var access, accounts, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, account, stillThere;

        return regeneratorRuntime.wrap(function _callee3$(_context3) {
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
                        _iterator = accounts[Symbol.iterator]();

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
                        res.status(204).end();
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
    var _ref4 = _asyncToGenerator(regeneratorRuntime.mark(function _callee4(req, res) {
        var access, createdAccess, retrievedAccounts, params, similarAccesses, errcode, _ref5, accounts, newOperations, _accounts, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, acc;

        return regeneratorRuntime.wrap(function _callee4$(_context4) {
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
                        return _access2.default.create(sanitizeCustomFields(params));

                    case 14:
                        access = _context4.sent;

                        createdAccess = true;

                        _context4.next = 18;
                        return _accountsManager2.default.retrieveAndAddAccountsByAccess(access);

                    case 18:
                        retrievedAccounts = true;

                        _context4.next = 21;
                        return _accountsManager2.default.retrieveOperationsByAccess(access);

                    case 21:
                        _ref5 = _context4.sent;
                        accounts = _ref5.accounts;
                        newOperations = _ref5.newOperations;


                        res.status(201).json({
                            accessId: access.id,
                            accounts: accounts,
                            newOperations: newOperations
                        });
                        _context4.next = 66;
                        break;

                    case 27:
                        _context4.prev = 27;
                        _context4.t0 = _context4['catch'](2);

                        log.error('The access process creation failed, cleaning up...');

                        // Silently swallow errors here, we don't want to catch errors in error
                        // code.

                        if (!retrievedAccounts) {
                            _context4.next = 61;
                            break;
                        }

                        log.info('\tdeleting accounts...');
                        _context4.next = 34;
                        return _account2.default.byAccess(access);

                    case 34:
                        _accounts = _context4.sent;
                        _iteratorNormalCompletion2 = true;
                        _didIteratorError2 = false;
                        _iteratorError2 = undefined;
                        _context4.prev = 38;
                        _iterator2 = _accounts[Symbol.iterator]();

                    case 40:
                        if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
                            _context4.next = 47;
                            break;
                        }

                        acc = _step2.value;
                        _context4.next = 44;
                        return acc.destroy();

                    case 44:
                        _iteratorNormalCompletion2 = true;
                        _context4.next = 40;
                        break;

                    case 47:
                        _context4.next = 53;
                        break;

                    case 49:
                        _context4.prev = 49;
                        _context4.t1 = _context4['catch'](38);
                        _didIteratorError2 = true;
                        _iteratorError2 = _context4.t1;

                    case 53:
                        _context4.prev = 53;
                        _context4.prev = 54;

                        if (!_iteratorNormalCompletion2 && _iterator2.return) {
                            _iterator2.return();
                        }

                    case 56:
                        _context4.prev = 56;

                        if (!_didIteratorError2) {
                            _context4.next = 59;
                            break;
                        }

                        throw _iteratorError2;

                    case 59:
                        return _context4.finish(56);

                    case 60:
                        return _context4.finish(53);

                    case 61:
                        if (!createdAccess) {
                            _context4.next = 65;
                            break;
                        }

                        log.info('\tdeleting access...');
                        _context4.next = 65;
                        return access.destroy();

                    case 65:
                        return _context4.abrupt('return', (0, _helpers.asyncErr)(res, _context4.t0, 'when creating a bank access'));

                    case 66:
                    case 'end':
                        return _context4.stop();
                }
            }
        }, _callee4, this, [[2, 27], [38, 49, 53, 61], [54,, 56, 60]]);
    }));

    return function create(_x9, _x10) {
        return _ref4.apply(this, arguments);
    };
}();

// Fetch operations using the backend and return the operations to the client.


var fetchOperations = exports.fetchOperations = function () {
    var _ref6 = _asyncToGenerator(regeneratorRuntime.mark(function _callee5(req, res) {
        var access, errcode, _ref7, accounts, newOperations;

        return regeneratorRuntime.wrap(function _callee5$(_context5) {
            while (1) {
                switch (_context5.prev = _context5.next) {
                    case 0:
                        _context5.prev = 0;
                        access = req.preloaded.access;

                        if (access.enabled) {
                            _context5.next = 5;
                            break;
                        }

                        errcode = (0, _helpers.getErrorCode)('DISABLED_ACCESS');
                        throw new _helpers.KError('disabled access', 409, errcode);

                    case 5:
                        _context5.next = 7;
                        return _accountsManager2.default.retrieveOperationsByAccess(access);

                    case 7:
                        _ref7 = _context5.sent;
                        accounts = _ref7.accounts;
                        newOperations = _ref7.newOperations;


                        res.status(200).json({
                            accounts: accounts,
                            newOperations: newOperations
                        });
                        _context5.next = 16;
                        break;

                    case 13:
                        _context5.prev = 13;
                        _context5.t0 = _context5['catch'](0);
                        return _context5.abrupt('return', (0, _helpers.asyncErr)(res, _context5.t0, 'when fetching operations'));

                    case 16:
                    case 'end':
                        return _context5.stop();
                }
            }
        }, _callee5, this, [[0, 13]]);
    }));

    return function fetchOperations(_x11, _x12) {
        return _ref6.apply(this, arguments);
    };
}();

// Fetch accounts, including new accounts, and operations using the backend and
// return both to the client.


var fetchAccounts = exports.fetchAccounts = function () {
    var _ref8 = _asyncToGenerator(regeneratorRuntime.mark(function _callee6(req, res) {
        var access, errcode, _ref9, accounts, newOperations;

        return regeneratorRuntime.wrap(function _callee6$(_context6) {
            while (1) {
                switch (_context6.prev = _context6.next) {
                    case 0:
                        _context6.prev = 0;
                        access = req.preloaded.access;

                        if (access.enabled) {
                            _context6.next = 5;
                            break;
                        }

                        errcode = (0, _helpers.getErrorCode)('DISABLED_ACCESS');
                        throw new _helpers.KError('disabled access', 409, errcode);

                    case 5:
                        _context6.next = 7;
                        return _accountsManager2.default.retrieveAndAddAccountsByAccess(access);

                    case 7:
                        _context6.next = 9;
                        return _accountsManager2.default.retrieveOperationsByAccess(access);

                    case 9:
                        _ref9 = _context6.sent;
                        accounts = _ref9.accounts;
                        newOperations = _ref9.newOperations;


                        res.status(200).json({
                            accounts: accounts,
                            newOperations: newOperations
                        });
                        _context6.next = 18;
                        break;

                    case 15:
                        _context6.prev = 15;
                        _context6.t0 = _context6['catch'](0);
                        return _context6.abrupt('return', (0, _helpers.asyncErr)(res, _context6.t0, 'when fetching accounts'));

                    case 18:
                    case 'end':
                        return _context6.stop();
                }
            }
        }, _callee6, this, [[0, 15]]);
    }));

    return function fetchAccounts(_x13, _x14) {
        return _ref8.apply(this, arguments);
    };
}();

// Fetch all the operations / accounts for all the accesses, as is done during
// any regular poll.


var poll = exports.poll = function () {
    var _ref10 = _asyncToGenerator(regeneratorRuntime.mark(function _callee7(req, res) {
        return regeneratorRuntime.wrap(function _callee7$(_context7) {
            while (1) {
                switch (_context7.prev = _context7.next) {
                    case 0:
                        _context7.prev = 0;
                        _context7.next = 3;
                        return (0, _poller.fullPoll)();

                    case 3:
                        res.status(200).json({
                            status: 'OK'
                        });
                        _context7.next = 10;
                        break;

                    case 6:
                        _context7.prev = 6;
                        _context7.t0 = _context7['catch'](0);

                        log.warn('Error when doing a full poll: ' + _context7.t0.message);
                        res.status(500).json({
                            status: 'error',
                            message: _context7.t0.message
                        });

                    case 10:
                    case 'end':
                        return _context7.stop();
                }
            }
        }, _callee7, this, [[0, 6]]);
    }));

    return function poll(_x15, _x16) {
        return _ref10.apply(this, arguments);
    };
}();

// Updates a bank access.


var update = exports.update = function () {
    var _ref11 = _asyncToGenerator(regeneratorRuntime.mark(function _callee8(req, res) {
        var access, preloaded;
        return regeneratorRuntime.wrap(function _callee8$(_context8) {
            while (1) {
                switch (_context8.prev = _context8.next) {
                    case 0:
                        _context8.prev = 0;
                        access = req.body;

                        if (!(typeof access.enabled === 'undefined' || access.enabled)) {
                            _context8.next = 9;
                            break;
                        }

                        _context8.next = 5;
                        return req.preloaded.access.updateAttributes(sanitizeCustomFields(access));

                    case 5:
                        _context8.next = 7;
                        return fetchAccounts(req, res);

                    case 7:
                        _context8.next = 16;
                        break;

                    case 9:
                        if (Object.keys(access).length > 1) {
                            log.warn('Supplementary fields not considered when disabling an access.');
                        }

                        preloaded = req.preloaded.access;


                        delete preloaded.password;
                        preloaded.enabled = false;

                        _context8.next = 15;
                        return preloaded.save();

                    case 15:
                        res.status(201).json({ status: 'OK' });

                    case 16:
                        _context8.next = 21;
                        break;

                    case 18:
                        _context8.prev = 18;
                        _context8.t0 = _context8['catch'](0);
                        return _context8.abrupt('return', (0, _helpers.asyncErr)(res, _context8.t0, 'when updating bank access'));

                    case 21:
                    case 'end':
                        return _context8.stop();
                }
            }
        }, _callee8, this, [[0, 18]]);
    }));

    return function update(_x17, _x18) {
        return _ref11.apply(this, arguments);
    };
}();

var _access = require('../../models/access');

var _access2 = _interopRequireDefault(_access);

var _account = require('../../models/account');

var _account2 = _interopRequireDefault(_account);

var _accountsManager = require('../../lib/accounts-manager');

var _accountsManager2 = _interopRequireDefault(_accountsManager);

var _poller = require('../../lib/poller');

var _accounts2 = require('./accounts');

var AccountController = _interopRequireWildcard(_accounts2);

var _helpers = require('../../helpers');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var log = (0, _helpers.makeLogger)('controllers/accesses');

function sanitizeCustomFields(access) {
    if (typeof access.customFields !== 'undefined') {
        try {
            JSON.parse(access.customFields);
        } catch (e) {
            log.warn('Sanitizing unparseable access.customFields.');
            var sanitized = _extends({}, access);
            sanitized.customFields = '[]';
            return sanitized;
        }
    }
    return access;
}