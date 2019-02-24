"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.all = all;
exports.export_ = export_;
exports.import_ = import_;

var crypto = _interopRequireWildcard(require("crypto"));

var _accesses = _interopRequireDefault(require("../../models/accesses"));

var _accounts = _interopRequireDefault(require("../../models/accounts"));

var _alerts = _interopRequireDefault(require("../../models/alerts"));

var _budgets = _interopRequireDefault(require("../../models/budgets"));

var _categories = _interopRequireDefault(require("../../models/categories"));

var _settings = _interopRequireDefault(require("../../models/settings"));

var _transactions = _interopRequireDefault(require("../../models/transactions"));

var _migrations = require("../../models/migrations");

var _staticData = require("../../models/static-data");

var _helpers = require("../../shared/helpers");

var _defaultSettings = _interopRequireDefault(require("../../shared/default-settings"));

var _helpers2 = require("../../helpers");

var _helpers3 = require("./helpers");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

let log = (0, _helpers2.makeLogger)('controllers/all');
const ERR_MSG_LOADING_ALL = 'Error when loading all Kresus data';

function getAllData(_x) {
  return _getAllData.apply(this, arguments);
}

function _getAllData() {
  _getAllData = _asyncToGenerator(function* (userId, isExport = false, cleanPassword = true) {
    let ret = {};
    ret.accounts = yield _accounts.default.all(userId);
    ret.accesses = yield _accesses.default.all(userId);

    if (cleanPassword) {
      ret.accesses.forEach(access => delete access.password);
    }

    ret.categories = yield _categories.default.all(userId);
    ret.operations = yield _transactions.default.all(userId);
    ret.settings = isExport ? yield _settings.default.allWithoutGhost(userId) : yield _settings.default.all(userId);

    if (isExport) {
      ret.budgets = yield _budgets.default.all(userId);
    } // Return alerts only if there is an email recipient.


    let emailRecipient = ret.settings.find(s => s.name === 'email-recipient');

    if (emailRecipient && emailRecipient.value !== _defaultSettings.default.get('email-recipient')) {
      ret.alerts = yield _alerts.default.all(userId);
    } else {
      ret.alerts = [];
    }

    return ret;
  });
  return _getAllData.apply(this, arguments);
}

function all(_x2, _x3) {
  return _all.apply(this, arguments);
}

function _all() {
  _all = _asyncToGenerator(function* (req, res) {
    try {
      let userId = req.user.id;
      let ret = yield getAllData(userId);
      res.status(200).json(ret);
    } catch (err) {
      err.code = ERR_MSG_LOADING_ALL;
      return (0, _helpers2.asyncErr)(res, err, 'when loading all data');
    }
  });
  return _all.apply(this, arguments);
}

const ENCRYPTION_ALGORITHM = 'aes-256-ctr';
const ENCRYPTED_CONTENT_TAG = Buffer.from('KRE');

function encryptData(data, passphrase) {
  (0, _helpers2.assert)(process.kresus.salt !== null, 'must have provided a salt');
  let initVector = crypto.randomBytes(16);
  let key = crypto.pbkdf2Sync(passphrase, process.kresus.salt, 100000, 32, 'sha512');
  let cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, key, initVector);
  return Buffer.concat([initVector, ENCRYPTED_CONTENT_TAG, cipher.update(JSON.stringify(data)), cipher.final()]).toString('base64');
}

function decryptData(data, passphrase) {
  (0, _helpers2.assert)(process.kresus.salt !== null, 'must have provided a salt');
  let rawData = Buffer.from(data, 'base64');
  let _ref = [rawData.slice(0, 16), rawData.slice(16, 16 + 3), rawData.slice(16 + 3)],
      initVector = _ref[0],
      tag = _ref[1],
      encrypted = _ref[2];

  if (tag.toString() !== ENCRYPTED_CONTENT_TAG.toString()) {
    throw new _helpers2.KError('submitted file is not a valid kresus encrypted file', 400, (0, _helpers2.getErrorCode)('INVALID_ENCRYPTED_EXPORT'));
  }

  let key = crypto.pbkdf2Sync(passphrase, process.kresus.salt, 100000, 32, 'sha512');
  let decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, key, initVector);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]);
}

function export_(_x4, _x5) {
  return _export_.apply(this, arguments);
}

function _export_() {
  _export_ = _asyncToGenerator(function* (req, res) {
    try {
      let userId = req.user.id;
      let passphrase = null;

      if (req.body.encrypted) {
        if (typeof req.body.passphrase !== 'string') {
          throw new _helpers2.KError('missing parameter "passphrase"', 400);
        }

        if (process.kresus.salt === null) {
          throw new _helpers2.KError("server hasn't been configured for encryption; " + 'please ask your administrator to provide a salt');
        }

        passphrase = req.body.passphrase; // Check password strength

        if (!(0, _helpers.validatePassword)(passphrase)) {
          throw new _helpers2.KError('submitted passphrase is too weak', 400);
        }
      }

      let data = yield getAllData(userId,
      /* isExport = */
      true, !passphrase);
      data = (0, _helpers3.cleanData)(data);
      let ret = {};

      if (passphrase) {
        data = encryptData(data, passphrase);
        ret = {
          encrypted: true,
          data
        };
      } else {
        ret = {
          encrypted: false,
          data
        };
      }

      res.status(200).json(ret);
    } catch (err) {
      err.code = ERR_MSG_LOADING_ALL;
      return (0, _helpers2.asyncErr)(res, err, 'when exporting data');
    }
  });
  return _export_.apply(this, arguments);
}

function import_(_x6, _x7) {
  return _import_.apply(this, arguments);
}

function _import_() {
  _import_ = _asyncToGenerator(function* (req, res) {
    try {
      let userId = req.user.id;

      if (!req.body.data) {
        throw new _helpers2.KError('missing parameter "data" in the file', 400);
      }

      let world = req.body.data;

      if (req.body.encrypted) {
        if (typeof req.body.data !== 'string') {
          throw new _helpers2.KError('content of an encrypted export should be an encoded string', 400);
        }

        if (typeof req.body.passphrase !== 'string') {
          throw new _helpers2.KError('missing parameter "passphrase"', 400);
        }

        if (process.kresus.salt === null) {
          throw new _helpers2.KError("server hasn't been configured for encryption; " + 'please ask your administrator to provide a salt');
        }

        world = decryptData(world, req.body.passphrase);

        try {
          world = JSON.parse(world);
        } catch (err) {
          throw new _helpers2.KError('Invalid JSON file or bad passphrase.', 400, (0, _helpers2.getErrorCode)('INVALID_PASSWORD_JSON_EXPORT'));
        }
      } else if (typeof req.body.data !== 'object') {
        throw new _helpers2.KError('content of a JSON export should be a JSON object', 400);
      }

      world.accesses = world.accesses || [];
      world.accounts = world.accounts || [];
      world.alerts = world.alerts || [];
      world.budgets = world.budgets || [];
      world.categories = world.categories || [];
      world.operationtypes = world.operationtypes || [];
      world.operations = world.operations || []; // Importing only known settings prevents assertion errors in the client when
      // importing Kresus data in an older version of kresus.

      world.settings = world.settings.filter(s => _defaultSettings.default.has(s.name)) || [];
      log.info(`Importing:
            accesses:        ${world.accesses.length}
            accounts:        ${world.accounts.length}
            alerts:          ${world.alerts.length}
            budgets:         ${world.budgets.length}
            categories:      ${world.categories.length}
            operation-types: ${world.operationtypes.length}
            settings:        ${world.settings.length}
            operations:      ${world.operations.length}
        `);
      log.info('Import accesses...');
      let accessMap = {};
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = world.accesses[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          let access = _step.value;
          let accessId = access.id;
          delete access.id; // An access without password should be disabled by default.

          if (!access.password) {
            access.enabled = false;
          }

          let created = yield _accesses.default.create(userId, access);
          accessMap[accessId] = created.id;
        }
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

      log.info('Done.');
      log.info('Import accounts...');
      let accountIdToAccount = new Map();
      let accountNumberToAccount = new Map();
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = world.accounts[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          let account = _step2.value;

          if (typeof accessMap[account.bankAccess] === 'undefined') {
            log.warn('Ignoring orphan account:\n', account);
            continue;
          }

          let accountId = account.id;
          delete account.id;
          account.bankAccess = accessMap[account.bankAccess];
          let created = yield _accounts.default.create(userId, account);
          accountIdToAccount.set(accountId, created.id);
          accountNumberToAccount.set(created.accountNumber, created.id);
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

      log.info('Done.');
      log.info('Import categories...');
      let existingCategories = yield _categories.default.all(userId);
      let existingCategoriesMap = new Map();
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = existingCategories[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          let c = _step3.value;
          existingCategoriesMap.set(c.title, c);
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3.return != null) {
            _iterator3.return();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }

      let categoryMap = {};
      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = world.categories[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          let category = _step4.value;
          let catId = category.id;
          delete category.id;

          if (existingCategoriesMap.has(category.title)) {
            let existing = existingCategoriesMap.get(category.title);
            categoryMap[catId] = existing.id;
          } else {
            let created = yield _categories.default.create(userId, category);
            categoryMap[catId] = created.id;
          }
        }
      } catch (err) {
        _didIteratorError4 = true;
        _iteratorError4 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion4 && _iterator4.return != null) {
            _iterator4.return();
          }
        } finally {
          if (_didIteratorError4) {
            throw _iteratorError4;
          }
        }
      }

      log.info('Done.');
      log.info('Import budgets...');

      let makeBudgetKey = b => `${b.categoryId}-${b.year}-${b.month}`;

      let existingBudgets = yield _budgets.default.all(userId);
      let existingBudgetsMap = new Map();
      var _iteratorNormalCompletion5 = true;
      var _didIteratorError5 = false;
      var _iteratorError5 = undefined;

      try {
        for (var _iterator5 = existingBudgets[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
          let budget = _step5.value;
          existingBudgetsMap.set(makeBudgetKey(budget), budget);
        }
      } catch (err) {
        _didIteratorError5 = true;
        _iteratorError5 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion5 && _iterator5.return != null) {
            _iterator5.return();
          }
        } finally {
          if (_didIteratorError5) {
            throw _iteratorError5;
          }
        }
      }

      var _iteratorNormalCompletion6 = true;
      var _didIteratorError6 = false;
      var _iteratorError6 = undefined;

      try {
        for (var _iterator6 = world.budgets[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
          let importedBudget = _step6.value;
          // Note the order here: first map to the actual category id, so the
          // map lookup thereafter uses an existing category id.
          importedBudget.categoryId = categoryMap[importedBudget.categoryId];
          let existingBudget = existingBudgetsMap.get(makeBudgetKey(importedBudget));

          if (existingBudget) {
            if (!existingBudget.threshold || existingBudget.threshold !== importedBudget.threshold) {
              yield _budgets.default.update(userId, existingBudget.id, {
                threshold: importedBudget.threshold
              });
            }
          } else {
            delete importedBudget.id;
            yield _budgets.default.create(userId, importedBudget);
          }
        }
      } catch (err) {
        _didIteratorError6 = true;
        _iteratorError6 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion6 && _iterator6.return != null) {
            _iterator6.return();
          }
        } finally {
          if (_didIteratorError6) {
            throw _iteratorError6;
          }
        }
      }

      log.info('Done.'); // No need to import operation types.
      // importedTypesMap is used to set type to imported operations (backward compatibility).

      let importedTypes = world.operationtypes || [];
      let importedTypesMap = new Map();
      var _iteratorNormalCompletion7 = true;
      var _didIteratorError7 = false;
      var _iteratorError7 = undefined;

      try {
        for (var _iterator7 = importedTypes[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
          let type = _step7.value;
          importedTypesMap.set(type.id.toString(), type.name);
        }
      } catch (err) {
        _didIteratorError7 = true;
        _iteratorError7 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion7 && _iterator7.return != null) {
            _iterator7.return();
          }
        } finally {
          if (_didIteratorError7) {
            throw _iteratorError7;
          }
        }
      }

      log.info('Import operations...');
      var _iteratorNormalCompletion8 = true;
      var _didIteratorError8 = false;
      var _iteratorError8 = undefined;

      try {
        for (var _iterator8 = world.operations[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
          let op = _step8.value;

          // Map operation to account.
          if (typeof op.accountId !== 'undefined') {
            if (!accountIdToAccount.has(op.accountId)) {
              log.warn('Ignoring orphan operation:\n', op);
              continue;
            }

            op.accountId = accountIdToAccount.get(op.accountId);
          } else {
            if (!accountNumberToAccount.has(op.bankAccount)) {
              log.warn('Ignoring orphan operation:\n', op);
              continue;
            }

            op.accountId = accountNumberToAccount.get(op.bankAccount);
          } // Remove bankAccount as the operation is now linked to account with accountId prop.


          delete op.bankAccount;
          let categoryId = op.categoryId;

          if (typeof categoryId !== 'undefined') {
            if (typeof categoryMap[categoryId] === 'undefined') {
              log.warn('Unknown category, unsetting for operation:\n', op);
            }

            op.categoryId = categoryMap[categoryId];
          } // Set operation type base on operationId


          if (typeof op.operationTypeID !== 'undefined') {
            let key = op.operationTypeID.toString();

            if (importedTypesMap.has(key)) {
              op.type = importedTypesMap.get(key);
            } else {
              op.type = _helpers2.UNKNOWN_OPERATION_TYPE;
            }

            delete op.operationTypeID;
          } // Remove attachments, if there were any.


          delete op.attachments;
          delete op.binary;
          yield _transactions.default.create(userId, op);
        }
      } catch (err) {
        _didIteratorError8 = true;
        _iteratorError8 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion8 && _iterator8.return != null) {
            _iterator8.return();
          }
        } finally {
          if (_didIteratorError8) {
            throw _iteratorError8;
          }
        }
      }

      log.info('Done.');
      log.info('Import settings...');
      let shouldResetMigration = true;
      var _iteratorNormalCompletion9 = true;
      var _didIteratorError9 = false;
      var _iteratorError9 = undefined;

      try {
        for (var _iterator9 = world.settings[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
          let setting = _step9.value;

          if (_staticData.ConfigGhostSettings.has(setting.name)) {
            continue;
          }

          if (setting.name === 'migration-version') {
            // Overwrite previous value of migration-version setting.
            let found = yield _settings.default.byName(userId, 'migration-version');

            if (found) {
              shouldResetMigration = false;
              log.debug(`Updating migration-version index to ${setting.value}.`);
              yield _settings.default.update(userId, found.id, {
                value: setting.value
              });
              continue;
            }
          }

          if (setting.name === 'default-account-id' && setting.value !== _defaultSettings.default.get('default-account-id')) {
            if (!accountIdToAccount.has(setting.value)) {
              log.warn(`unknown default account id: ${setting.value}, skipping.`);
              continue;
            }

            setting.value = accountIdToAccount.get(setting.value);
            yield _settings.default.updateByKey(userId, 'default-account-id', setting.value);
            continue;
          } // Note that former existing values are not overwritten!


          yield _settings.default.findOrCreateByName(userId, setting.name, setting.value);
        }
      } catch (err) {
        _didIteratorError9 = true;
        _iteratorError9 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion9 && _iterator9.return != null) {
            _iterator9.return();
          }
        } finally {
          if (_didIteratorError9) {
            throw _iteratorError9;
          }
        }
      }

      if (shouldResetMigration) {
        // If no migration-version has been set, just reset
        // migration-version value to 0, to force all the migrations to be
        // run again.
        log.info('The imported file did not provide a migration-version value. ' + 'Resetting it to 0 to run all migrations again.');
        yield _settings.default.updateByKey(userId, 'migration-version', '0');
      }

      log.info('Done.');
      log.info('Import alerts...');
      var _iteratorNormalCompletion10 = true;
      var _didIteratorError10 = false;
      var _iteratorError10 = undefined;

      try {
        for (var _iterator10 = world.alerts[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
          let a = _step10.value;

          // Map alert to account.
          if (typeof a.accountId !== 'undefined') {
            if (!accountIdToAccount.has(a.accountId)) {
              log.warn('Ignoring orphan alert:\n', a);
              continue;
            }

            a.accountId = accountIdToAccount.get(a.accountId);
          } else {
            if (!accountNumberToAccount.has(a.bankAccount)) {
              log.warn('Ignoring orphan alert:\n', a);
              continue;
            }

            a.accountId = accountNumberToAccount.get(a.bankAccount);
          } // Remove bankAccount as the alert is now linked to account with accountId prop.


          delete a.bankAccount;
          yield _alerts.default.create(userId, a);
        }
      } catch (err) {
        _didIteratorError10 = true;
        _iteratorError10 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion10 && _iterator10.return != null) {
            _iterator10.return();
          }
        } finally {
          if (_didIteratorError10) {
            throw _iteratorError10;
          }
        }
      }

      log.info('Done.');
      log.info('Running migrations...');
      yield (0, _migrations.run)();
      log.info('Done.');
      log.info('Import finished with success!');
      res.status(200).end();
    } catch (err) {
      return (0, _helpers2.asyncErr)(res, err, 'when importing data');
    }
  });
  return _import_.apply(this, arguments);
}