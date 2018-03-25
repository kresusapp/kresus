'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.update = exports.poll = exports.fetchAccounts = exports.fetchOperations = exports.create = exports.destroy = exports.getAccounts = exports.preloadAccess = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

// Preloads a bank access (sets @access).
let preloadAccess = exports.preloadAccess = (() => {
    var _ref = _asyncToGenerator(function* (req, res, next, accessId) {
        try {
            let access = yield _access2.default.find(accessId);
            if (!access) {
                throw new _helpers.KError('bank access not found', 404);
            }
            req.preloaded = { access };
            return next();
        } catch (err) {
            return (0, _helpers.asyncErr)(res, err, 'when finding bank access');
        }
    });

    return function preloadAccess(_x, _x2, _x3, _x4) {
        return _ref.apply(this, arguments);
    };
})();

// Returns accounts bound to a given access.


let getAccounts = exports.getAccounts = (() => {
    var _ref2 = _asyncToGenerator(function* (req, res) {
        try {
            let accounts = yield _account2.default.byAccess(req.preloaded.access);
            res.status(200).json(accounts);
        } catch (err) {
            return (0, _helpers.asyncErr)(err, res, 'when getting accounts for a bank');
        }
    });

    return function getAccounts(_x5, _x6) {
        return _ref2.apply(this, arguments);
    };
})();

// Destroy a given access, including accounts, alerts and operations.


let destroy = exports.destroy = (() => {
    var _ref3 = _asyncToGenerator(function* (req, res) {
        try {
            let access = req.preloaded.access;
            log.info(`Removing access ${access.id} for bank ${access.bank}...`);

            // TODO arguably, this should be done in the access model.
            let accounts = yield _account2.default.byAccess(access);
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = accounts[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    let account = _step.value;

                    yield AccountController.destroyWithOperations(account);
                }

                // The access should have been destroyed by the last account deletion.
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

            let stillThere = yield _access2.default.exists(access.id);
            if (stillThere) {
                log.error('Access should have been deleted! Manually deleting.');
                yield access.destroy();
            }

            log.info('Done!');
            res.status(204).end();
        } catch (err) {
            return (0, _helpers.asyncErr)(res, err, 'when destroying an access');
        }
    });

    return function destroy(_x7, _x8) {
        return _ref3.apply(this, arguments);
    };
})();

// Creates a new bank access (expecting at least (bank / login / password)), and
// retrieves its accounts and operations.
let create = exports.create = (() => {
    var _ref4 = _asyncToGenerator(function* (req, res) {
        let access;
        let createdAccess = false,
            retrievedAccounts = false;
        try {
            let params = req.body;

            if (!params.bank || !params.login || !params.password) {
                throw new _helpers.KError('missing parameters', 400);
            }

            let similarAccesses = yield _access2.default.allLike(params);
            if (similarAccesses.length) {
                let errcode = (0, _helpers.getErrorCode)('BANK_ALREADY_EXISTS');
                throw new _helpers.KError('bank already exists', 409, errcode);
            }

            access = yield _access2.default.create(sanitizeCustomFields(params));
            createdAccess = true;

            yield _accountsManager2.default.retrieveAndAddAccountsByAccess(access);
            retrievedAccounts = true;

            var _ref5 = yield _accountsManager2.default.retrieveOperationsByAccess(access);

            let accounts = _ref5.accounts,
                newOperations = _ref5.newOperations;


            res.status(201).json({
                accessId: access.id,
                accounts,
                newOperations
            });
        } catch (err) {
            log.error('The access process creation failed, cleaning up...');

            // Silently swallow errors here, we don't want to catch errors in error
            // code.
            if (retrievedAccounts) {
                log.info('\tdeleting accounts...');
                let accounts = yield _account2.default.byAccess(access);
                var _iteratorNormalCompletion2 = true;
                var _didIteratorError2 = false;
                var _iteratorError2 = undefined;

                try {
                    for (var _iterator2 = accounts[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                        let acc = _step2.value;

                        yield acc.destroy();
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
            }

            if (createdAccess) {
                log.info('\tdeleting access...');
                yield access.destroy();
            }

            return (0, _helpers.asyncErr)(res, err, 'when creating a bank access');
        }
    });

    return function create(_x9, _x10) {
        return _ref4.apply(this, arguments);
    };
})();

// Fetch operations using the backend and return the operations to the client.


let fetchOperations = exports.fetchOperations = (() => {
    var _ref6 = _asyncToGenerator(function* (req, res) {
        try {
            let access = req.preloaded.access;

            if (!access.enabled) {
                let errcode = (0, _helpers.getErrorCode)('DISABLED_ACCESS');
                throw new _helpers.KError('disabled access', 403, errcode);
            }

            var _ref7 = yield _accountsManager2.default.retrieveOperationsByAccess(access);

            let accounts = _ref7.accounts,
                newOperations = _ref7.newOperations;


            res.status(200).json({
                accounts,
                newOperations
            });
        } catch (err) {
            return (0, _helpers.asyncErr)(res, err, 'when fetching operations');
        }
    });

    return function fetchOperations(_x11, _x12) {
        return _ref6.apply(this, arguments);
    };
})();

// Fetch accounts, including new accounts, and operations using the backend and
// return both to the client.


let fetchAccounts = exports.fetchAccounts = (() => {
    var _ref8 = _asyncToGenerator(function* (req, res) {
        try {
            let access = req.preloaded.access;

            if (!access.enabled) {
                let errcode = (0, _helpers.getErrorCode)('DISABLED_ACCESS');
                throw new _helpers.KError('disabled access', 403, errcode);
            }

            yield _accountsManager2.default.retrieveAndAddAccountsByAccess(access);

            var _ref9 = yield _accountsManager2.default.retrieveOperationsByAccess(access);

            let accounts = _ref9.accounts,
                newOperations = _ref9.newOperations;


            res.status(200).json({
                accounts,
                newOperations
            });
        } catch (err) {
            return (0, _helpers.asyncErr)(res, err, 'when fetching accounts');
        }
    });

    return function fetchAccounts(_x13, _x14) {
        return _ref8.apply(this, arguments);
    };
})();

// Fetch all the operations / accounts for all the accesses, as is done during
// any regular poll.


let poll = exports.poll = (() => {
    var _ref10 = _asyncToGenerator(function* (req, res) {
        try {
            yield (0, _poller.fullPoll)();
            res.status(200).json({
                status: 'OK'
            });
        } catch (err) {
            log.warn(`Error when doing a full poll: ${err.message}`);
            res.status(500).json({
                status: 'error',
                message: err.message
            });
        }
    });

    return function poll(_x15, _x16) {
        return _ref10.apply(this, arguments);
    };
})();

// Updates a bank access.


let update = exports.update = (() => {
    var _ref11 = _asyncToGenerator(function* (req, res) {
        try {
            let access = req.body;

            if (typeof access.enabled === 'undefined' || access.enabled) {
                yield req.preloaded.access.updateAttributes(sanitizeCustomFields(access));
                yield fetchAccounts(req, res);
            } else {
                if (Object.keys(access).length > 1) {
                    log.warn('Supplementary fields not considered when disabling an access.');
                }

                let preloaded = req.preloaded.access;

                delete preloaded.password;
                preloaded.enabled = false;

                yield preloaded.save();
                res.status(201).json({ status: 'OK' });
            }
        } catch (err) {
            return (0, _helpers.asyncErr)(res, err, 'when updating bank access');
        }
    });

    return function update(_x17, _x18) {
        return _ref11.apply(this, arguments);
    };
})();

var _access = require('../../models/access');

var _access2 = _interopRequireDefault(_access);

var _account = require('../../models/account');

var _account2 = _interopRequireDefault(_account);

var _accountsManager = require('../../lib/accounts-manager');

var _accountsManager2 = _interopRequireDefault(_accountsManager);

var _poller = require('../../lib/poller');

var _accounts = require('./accounts');

var AccountController = _interopRequireWildcard(_accounts);

var _helpers = require('../../helpers');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

let log = (0, _helpers.makeLogger)('controllers/accesses');

function sanitizeCustomFields(access) {
    if (typeof access.customFields !== 'undefined') {
        try {
            JSON.parse(access.customFields);
        } catch (e) {
            log.warn('Sanitizing unparseable access.customFields.');
            let sanitized = _extends({}, access);
            sanitized.customFields = '[]';
            return sanitized;
        }
    }
    return access;
}