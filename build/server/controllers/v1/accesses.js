"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.preloadAccess = preloadAccess;
exports.destroyWithData = destroyWithData;
exports.destroy = destroy;
exports.createAndRetrieveData = createAndRetrieveData;
exports.create = create;
exports.fetchOperations = fetchOperations;
exports.fetchAccounts = fetchAccounts;
exports.poll = poll;
exports.update = update;
exports.updateAndFetchAccounts = updateAndFetchAccounts;

var _accesses = _interopRequireDefault(require("../../models/accesses"));

var _accounts = _interopRequireDefault(require("../../models/accounts"));

var _accountsManager = _interopRequireDefault(require("../../lib/accounts-manager"));

var _poller = require("../../lib/poller");

var _bankVendors = require("../../lib/bank-vendors");

var AccountController = _interopRequireWildcard(require("./accounts"));

var _settings = require("./settings");

var _helpers = require("../../helpers");

var _validators = require("../../shared/validators");

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; if (obj != null) { var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

let log = (0, _helpers.makeLogger)('controllers/accesses'); // Preloads a bank access (sets @access).

function preloadAccess(_x, _x2, _x3, _x4) {
  return _preloadAccess.apply(this, arguments);
}

function _preloadAccess() {
  _preloadAccess = _asyncToGenerator(function* (req, res, next, accessId) {
    try {
      let userId = req.user.id;
      let access = yield _accesses.default.find(userId, accessId);

      if (!access) {
        throw new _helpers.KError('bank access not found', 404);
      }

      req.preloaded = {
        access
      };
      return next();
    } catch (err) {
      return (0, _helpers.asyncErr)(res, err, 'when finding bank access');
    }
  });
  return _preloadAccess.apply(this, arguments);
}

function destroyWithData(_x5, _x6) {
  return _destroyWithData.apply(this, arguments);
} // Destroy a given access, including accounts, alerts and operations.


function _destroyWithData() {
  _destroyWithData = _asyncToGenerator(function* (userId, access) {
    log.info(`Removing access ${access.id} for bank ${access.vendorId}...`); // TODO arguably, this should be done in the access model.

    let accounts = yield _accounts.default.byAccess(userId, access);
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = accounts[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        let account = _step.value;
        yield AccountController.destroyWithOperations(userId, account);
      } // The access should have been destroyed by the last account deletion.

    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return != null) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    let stillThere = yield _accesses.default.exists(userId, access.id);

    if (stillThere) {
      log.error('Access should have been deleted! Manually deleting.');
      yield _accesses.default.destroy(userId, access.id);
    }

    log.info('Done!');
  });
  return _destroyWithData.apply(this, arguments);
}

function destroy(_x7, _x8) {
  return _destroy.apply(this, arguments);
}

function _destroy() {
  _destroy = _asyncToGenerator(function* (req, res) {
    try {
      let userId = req.user.id;

      if (yield (0, _settings.isDemoEnabled)(userId)) {
        throw new _helpers.KError("access deletion isn't allowed in demo mode", 400);
      }

      yield destroyWithData(userId, req.preloaded.access);
      res.status(204).end();
    } catch (err) {
      return (0, _helpers.asyncErr)(res, err, 'when destroying an access');
    }
  });
  return _destroy.apply(this, arguments);
}

function createAndRetrieveData(_x9, _x10) {
  return _createAndRetrieveData.apply(this, arguments);
} // Creates a new bank access (expecting at least (vendorId / login /
// password)), and retrieves its accounts and operations.


function _createAndRetrieveData() {
  _createAndRetrieveData = _asyncToGenerator(function* (userId, params) {
    let error = (0, _validators.checkHasAllFields)(params, ['vendorId', 'login', 'password']) || (0, _validators.checkAllowedFields)(params, ['vendorId', 'login', 'password', 'fields', 'customLabel']);

    if (error) {
      throw new _helpers.KError(`when creating a new access: ${error}`, 400);
    }

    let access = null;
    let createdAccess = false;
    let retrievedAccounts = false;

    try {
      access = yield _accesses.default.create(userId, params);
      createdAccess = true;
      yield _accountsManager.default.retrieveAndAddAccountsByAccess(userId, access);
      retrievedAccounts = true;

      let _ref = yield _accountsManager.default.retrieveOperationsByAccess(userId, access),
          accounts = _ref.accounts,
          newOperations = _ref.newOperations;

      return {
        accessId: access.id,
        accounts,
        newOperations
      };
    } catch (err) {
      log.error('The access process creation failed, cleaning up...'); // Silently swallow errors here, we don't want to catch errors in error
      // code.

      if (retrievedAccounts) {
        log.info('\tdeleting accounts...');
        let accounts = yield _accounts.default.byAccess(userId, access);
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = accounts[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            let acc = _step2.value;
            yield _accounts.default.destroy(userId, acc.id);
          }
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
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
        yield _accesses.default.destroy(userId, access.id);
      } // Rethrow the error


      throw err;
    }
  });
  return _createAndRetrieveData.apply(this, arguments);
}

function create(_x11, _x12) {
  return _create.apply(this, arguments);
} // Fetch operations using the backend and return the operations to the client.


function _create() {
  _create = _asyncToGenerator(function* (req, res) {
    try {
      let userId = req.user.id;

      if (yield (0, _settings.isDemoEnabled)(userId)) {
        throw new _helpers.KError("access creation isn't allowed in demo mode", 400);
      }

      const data = yield createAndRetrieveData(userId, req.body);
      res.status(201).json(data);
    } catch (err) {
      return (0, _helpers.asyncErr)(res, err, 'when creating a bank access');
    }
  });
  return _create.apply(this, arguments);
}

function fetchOperations(_x13, _x14) {
  return _fetchOperations.apply(this, arguments);
} // Fetch accounts, including new accounts, and operations using the backend and
// return both to the client.


function _fetchOperations() {
  _fetchOperations = _asyncToGenerator(function* (req, res) {
    try {
      let userId = req.user.id;
      let access = req.preloaded.access;
      let bankVendor = (0, _bankVendors.bankVendorByUuid)(access.vendorId);

      if (!access.isEnabled() || bankVendor.deprecated) {
        let errcode = (0, _helpers.getErrorCode)('DISABLED_ACCESS');
        throw new _helpers.KError('disabled access', 403, errcode);
      }

      let _ref2 = yield _accountsManager.default.retrieveOperationsByAccess(userId, access),
          accounts = _ref2.accounts,
          newOperations = _ref2.newOperations;

      res.status(200).json({
        accounts,
        newOperations
      });
    } catch (err) {
      return (0, _helpers.asyncErr)(res, err, 'when fetching operations');
    }
  });
  return _fetchOperations.apply(this, arguments);
}

function fetchAccounts(_x15, _x16) {
  return _fetchAccounts.apply(this, arguments);
} // Fetch all the operations / accounts for all the accesses, as is done during
// any regular poll.


function _fetchAccounts() {
  _fetchAccounts = _asyncToGenerator(function* (req, res) {
    try {
      let userId = req.user.id;
      let access = req.preloaded.access;
      let bankVendor = (0, _bankVendors.bankVendorByUuid)(access.vendorId);

      if (!access.isEnabled() || bankVendor.deprecated) {
        let errcode = (0, _helpers.getErrorCode)('DISABLED_ACCESS');
        throw new _helpers.KError('disabled access', 403, errcode);
      }

      yield _accountsManager.default.retrieveAndAddAccountsByAccess(userId, access);

      let _ref3 = yield _accountsManager.default.retrieveOperationsByAccess(userId, access, true),
          accounts = _ref3.accounts,
          newOperations = _ref3.newOperations;

      res.status(200).json({
        accounts,
        newOperations
      });
    } catch (err) {
      return (0, _helpers.asyncErr)(res, err, 'when fetching accounts');
    }
  });
  return _fetchAccounts.apply(this, arguments);
}

function poll(_x17, _x18) {
  return _poll.apply(this, arguments);
} // Updates a bank access.


function _poll() {
  _poll = _asyncToGenerator(function* (req, res) {
    try {
      let userId = req.user.id;
      yield (0, _poller.fullPoll)(userId);
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
  return _poll.apply(this, arguments);
}

function update(_x19, _x20) {
  return _update.apply(this, arguments);
}

function _update() {
  _update = _asyncToGenerator(function* (req, res) {
    try {
      let userId = req.user.id;
      let access = req.preloaded.access;
      let newFields = req.body;
      let error = (0, _validators.checkAllowedFields)(newFields, ['enabled', 'customLabel']);

      if (error) {
        throw new _helpers.KError(`when updating an access: ${error}`, 400);
      }

      if (newFields.enabled === false) {
        newFields.password = null;
      }

      if (newFields.customLabel === '') {
        newFields.customLabel = null;
      }

      yield _accesses.default.update(userId, access.id, newFields);
      res.status(201).json({
        status: 'OK'
      });
    } catch (err) {
      return (0, _helpers.asyncErr)(res, err, 'when updating bank access');
    }
  });
  return _update.apply(this, arguments);
}

function updateAndFetchAccounts(_x21, _x22) {
  return _updateAndFetchAccounts.apply(this, arguments);
}

function _updateAndFetchAccounts() {
  _updateAndFetchAccounts = _asyncToGenerator(function* (req, res) {
    try {
      let userId = req.user.id;
      let access = req.preloaded.access;
      let newFields = req.body;
      let error = (0, _validators.checkAllowedFields)(newFields, ['enabled', 'login', 'password', 'fields']);

      if (error) {
        throw new _helpers.KError(`when updating and polling an access: ${error}`, 400);
      } // The preloaded access needs to be updated before calling fetchAccounts.


      req.preloaded.access = yield _accesses.default.update(userId, access.id, newFields);
      yield fetchAccounts(req, res);
    } catch (err) {
      return (0, _helpers.asyncErr)(res, err, 'when updating and fetching bank access');
    }
  });
  return _updateAndFetchAccounts.apply(this, arguments);
}