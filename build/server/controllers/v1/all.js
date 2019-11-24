"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.all = all;
exports.export_ = export_;
exports.import_ = import_;
exports.importOFX_ = importOFX_;
exports.testing = void 0;

var crypto = _interopRequireWildcard(require("crypto"));

var _accesses = _interopRequireDefault(require("../../models/accesses"));

var _accounts = _interopRequireDefault(require("../../models/accounts"));

var _alerts = _interopRequireDefault(require("../../models/alerts"));

var _budgets = _interopRequireDefault(require("../../models/budgets"));

var _categories = _interopRequireDefault(require("../../models/categories"));

var _settings = _interopRequireDefault(require("../../models/settings"));

var _transactions = _interopRequireDefault(require("../../models/transactions"));

var _migrations = require("../../models/migrations");

var _ghostSettings = require("../../lib/ghost-settings");

var _helpers = require("../../shared/helpers");

var _defaultSettings = _interopRequireDefault(require("../../shared/default-settings"));

var _settings2 = require("./settings");

var _ofx = require("./ofx");

var _helpers2 = require("../../helpers");

var _helpers3 = require("./helpers");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; if (obj != null) { var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

let log = (0, _helpers2.makeLogger)('controllers/all');
const ERR_MSG_LOADING_ALL = 'Error when loading all Kresus data'; // Strip away Couchdb/pouchdb metadata.

function cleanMeta(obj) {
  delete obj._id;
  delete obj._rev;
  delete obj.docType;
  return obj;
}

function getAllData(_x) {
  return _getAllData.apply(this, arguments);
}

function _getAllData() {
  _getAllData = _asyncToGenerator(function* (userId, isExport = false, cleanPassword = true) {
    let ret = {};
    ret.accounts = (yield _accounts.default.all(userId)).map(cleanMeta);
    ret.accesses = (yield _accesses.default.all(userId)).map(cleanMeta);
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = ret.accesses[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        let access = _step.value;

        // Process enabled status only for the /all request.
        if (!isExport) {
          access.enabled = access.isEnabled();
        } // Just keep the name and the value of the field.


        access.fields = access.fields.map(({
          name,
          value
        }) => {
          return {
            name,
            value
          };
        });

        if (cleanPassword) {
          delete access.password;
        }
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

    ret.categories = (yield _categories.default.all(userId)).map(cleanMeta);
    ret.operations = (yield _transactions.default.all(userId)).map(cleanMeta);
    ret.settings = (isExport ? yield _settings.default.allWithoutGhost(userId) : yield _settings.default.all(userId)).map(cleanMeta);

    if (isExport) {
      ret.budgets = (yield _budgets.default.all(userId)).map(cleanMeta);
    } // Return alerts only if there is an email recipient.


    let emailRecipient = ret.settings.find(s => s.key === 'email-recipient');

    if (emailRecipient && emailRecipient.value !== _defaultSettings.default.get('email-recipient')) {
      ret.alerts = (yield _alerts.default.all(userId)).map(cleanMeta);
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

function applyRenamings(model) {
  if (typeof model.renamings === 'undefined') {
    return obj => obj;
  }

  return obj => {
    for (var _i = 0, _Object$keys = Object.keys(model.renamings); _i < _Object$keys.length; _i++) {
      let from = _Object$keys[_i];
      let to = model.renamings[from];

      if (typeof obj[from] !== 'undefined') {
        if (typeof obj[to] === 'undefined') {
          obj[to] = obj[from];
        }

        delete obj[from];
      }
    }

    return obj;
  };
}

function importData(_x6, _x7) {
  return _importData.apply(this, arguments);
}

function _importData() {
  _importData = _asyncToGenerator(function* (userId, world) {
    world.accesses = (world.accesses || []).map(applyRenamings(_accesses.default));
    world.accounts = (world.accounts || []).map(applyRenamings(_accounts.default));
    world.alerts = (world.alerts || []).map(applyRenamings(_alerts.default));
    world.budgets = (world.budgets || []).map(applyRenamings(_budgets.default));
    world.categories = (world.categories || []).map(applyRenamings(_categories.default));
    world.operations = (world.operations || []).map(applyRenamings(_transactions.default));
    world.settings = (world.settings || []).map(applyRenamings(_settings.default)); // Static data.

    world.operationtypes = world.operationtypes || []; // Importing only known settings prevents assertion errors in the client when
    // importing Kresus data in an older version of kresus.

    world.settings = world.settings.filter(s => _defaultSettings.default.has(s.key)) || [];
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
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = world.accesses[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        let access = _step2.value;
        let accessId = access.id;
        delete access.id;
        let created = yield _accesses.default.create(userId, access);
        accessMap[accessId] = created.id;
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
    log.info('Import accounts...');
    let accountIdToAccount = new Map();
    let vendorToOwnAccountId = new Map();
    var _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
    var _iteratorError3 = undefined;

    try {
      for (var _iterator3 = world.accounts[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
        let account = _step3.value;

        if (typeof accessMap[account.accessId] === 'undefined') {
          log.warn('Ignoring orphan account:\n', account);
          continue;
        }

        let accountId = account.id;
        delete account.id; // For an initial import which does not come from Kresus (ex: a
        // handmade JSON file), there might be no lastCheckDate.

        if (!account.lastCheckDate) {
          let latestOpDate = null;

          if (world.operations) {
            let accountOps = world.operations.filter(op => op.accountId === accountId);
            var _iteratorNormalCompletion12 = true;
            var _didIteratorError12 = false;
            var _iteratorError12 = undefined;

            try {
              for (var _iterator12 = accountOps[Symbol.iterator](), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
                let op = _step12.value;

                if (!latestOpDate || op.date > latestOpDate) {
                  latestOpDate = op.date;
                }
              }
            } catch (err) {
              _didIteratorError12 = true;
              _iteratorError12 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion12 && _iterator12.return != null) {
                  _iterator12.return();
                }
              } finally {
                if (_didIteratorError12) {
                  throw _iteratorError12;
                }
              }
            }
          }

          account.lastCheckDate = latestOpDate || new Date();
        }

        account.accessId = accessMap[account.accessId];
        let created = yield _accounts.default.create(userId, account);
        accountIdToAccount.set(accountId, created.id);
        vendorToOwnAccountId.set(created.vendorAccountId, created.id);
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

    log.info('Done.');
    log.info('Import categories...');
    let existingCategories = yield _categories.default.all(userId);
    let existingCategoriesMap = new Map();
    var _iteratorNormalCompletion4 = true;
    var _didIteratorError4 = false;
    var _iteratorError4 = undefined;

    try {
      for (var _iterator4 = existingCategories[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
        let category = _step4.value;
        existingCategoriesMap.set(category.label, category);
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

    let categoryMap = {};
    var _iteratorNormalCompletion5 = true;
    var _didIteratorError5 = false;
    var _iteratorError5 = undefined;

    try {
      for (var _iterator5 = world.categories[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
        let category = _step5.value;
        let catId = category.id;
        delete category.id;

        if (existingCategoriesMap.has(category.label)) {
          let existing = existingCategoriesMap.get(category.label);
          categoryMap[catId] = existing.id;
        } else {
          let created = yield _categories.default.create(userId, category);
          categoryMap[catId] = created.id;
        }
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

    log.info('Done.');
    log.info('Import budgets...');

    let makeBudgetKey = b => `${b.categoryId}-${b.year}-${b.month}`;

    let existingBudgets = yield _budgets.default.all(userId);
    let existingBudgetsMap = new Map();
    var _iteratorNormalCompletion6 = true;
    var _didIteratorError6 = false;
    var _iteratorError6 = undefined;

    try {
      for (var _iterator6 = existingBudgets[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
        let budget = _step6.value;
        existingBudgetsMap.set(makeBudgetKey(budget), budget);
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

    var _iteratorNormalCompletion7 = true;
    var _didIteratorError7 = false;
    var _iteratorError7 = undefined;

    try {
      for (var _iterator7 = world.budgets[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
        let importedBudget = _step7.value;
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

    log.info('Done.'); // No need to import operation types.
    // importedTypesMap is used to set type to imported operations (backward compatibility).

    let importedTypes = world.operationtypes || [];
    let importedTypesMap = new Map();
    var _iteratorNormalCompletion8 = true;
    var _didIteratorError8 = false;
    var _iteratorError8 = undefined;

    try {
      for (var _iterator8 = importedTypes[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
        let type = _step8.value;
        importedTypesMap.set(type.id.toString(), type.name);
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

    log.info('Import transactions...');
    var _iteratorNormalCompletion9 = true;
    var _didIteratorError9 = false;
    var _iteratorError9 = undefined;

    try {
      for (var _iterator9 = world.operations[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
        let op = _step9.value;

        // Map operation to account.
        if (typeof op.accountId !== 'undefined') {
          if (!accountIdToAccount.has(op.accountId)) {
            log.warn('Ignoring orphan operation:\n', op);
            continue;
          }

          op.accountId = accountIdToAccount.get(op.accountId);
        } else {
          if (!vendorToOwnAccountId.has(op.bankAccount)) {
            log.warn('Ignoring orphan operation:\n', op);
            continue;
          }

          op.accountId = vendorToOwnAccountId.get(op.bankAccount);
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
        } // If there is no label use the rawLabel, and vice-versa


        if (typeof op.label === 'undefined') {
          op.label = op.rawLabel;
        }

        if (typeof op.rawLabel === 'undefined') {
          op.rawLabel = op.label;
        }

        if (typeof op.label === 'undefined' && typeof op.rawLabel === 'undefined') {
          log.warn('Ignoring transaction without label/rawLabel:\n', op);
          continue;
        } // Remove attachments, if there were any.


        delete op.attachments;
        delete op.binary;
        yield _transactions.default.create(userId, op);
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

    log.info('Done.');
    log.info('Import settings...');
    let shouldResetMigration = true;
    var _iteratorNormalCompletion10 = true;
    var _didIteratorError10 = false;
    var _iteratorError10 = undefined;

    try {
      for (var _iterator10 = world.settings[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
        let setting = _step10.value;

        if (_ghostSettings.ConfigGhostSettings.has(setting.key)) {
          continue;
        } // Overwrite previous value of migration-version setting, if it's set.


        if (setting.key === 'migration-version') {
          let found = yield _settings.default.byKey(userId, 'migration-version');

          if (found) {
            shouldResetMigration = false;
            log.debug(`Updating migration-version index to ${setting.value}.`);
            yield _settings.default.update(userId, found.id, {
              value: setting.value
            });
            continue;
          }
        } // Reset the default account id, if it's set.


        if (setting.key === 'default-account-id' && setting.value !== _defaultSettings.default.get('default-account-id')) {
          if (!accountIdToAccount.has(setting.value)) {
            log.warn(`unknown default account id: ${setting.value}, skipping.`);
            continue;
          }

          setting.value = accountIdToAccount.get(setting.value);
          yield _settings.default.updateByKey(userId, 'default-account-id', setting.value);
          continue;
        } // Overwrite the previous value of the demo-mode, if it was set.


        if (setting.key === 'demo-mode' && setting.value === 'true') {
          let found = yield _settings.default.byKey(userId, 'demo-mode');

          if (found && found.value !== 'true') {
            yield _settings.default.updateByKey(userId, 'demo-mode', true);
            continue;
          }
        } // Note that former existing values are not overwritten!


        yield _settings.default.findOrCreateByKey(userId, setting.key, setting.value);
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

    if (shouldResetMigration) {
      // If no migration-version has been set, just reset
      // migration-version value to 0, to force all the migrations to be
      // run again.
      log.info('The imported file did not provide a migration-version value. ' + 'Resetting it to 0 to run all migrations again.');
      yield _settings.default.updateByKey(userId, 'migration-version', '0');
    }

    log.info('Done.');
    log.info('Import alerts...');
    var _iteratorNormalCompletion11 = true;
    var _didIteratorError11 = false;
    var _iteratorError11 = undefined;

    try {
      for (var _iterator11 = world.alerts[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
        let a = _step11.value;

        // Map alert to account.
        if (typeof a.accountId !== 'undefined') {
          if (!accountIdToAccount.has(a.accountId)) {
            log.warn('Ignoring orphan alert:\n', a);
            continue;
          }

          a.accountId = accountIdToAccount.get(a.accountId);
        } else {
          if (!vendorToOwnAccountId.has(a.bankAccount)) {
            log.warn('Ignoring orphan alert:\n', a);
            continue;
          }

          a.accountId = vendorToOwnAccountId.get(a.bankAccount);
        } // Remove bankAccount as the alert is now linked to account with accountId prop.


        delete a.bankAccount;
        yield _alerts.default.create(userId, a);
      }
    } catch (err) {
      _didIteratorError11 = true;
      _iteratorError11 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion11 && _iterator11.return != null) {
          _iterator11.return();
        }
      } finally {
        if (_didIteratorError11) {
          throw _iteratorError11;
        }
      }
    }

    log.info('Done.');
  });
  return _importData.apply(this, arguments);
}

function import_(_x8, _x9) {
  return _import_.apply(this, arguments);
}

function _import_() {
  _import_ = _asyncToGenerator(function* (req, res) {
    try {
      let userId = req.user.id;

      if (yield (0, _settings2.isDemoEnabled)(userId)) {
        throw new _helpers2.KError("importing accesses isn't allowed in demo mode", 400);
      }

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

      yield importData(userId, world);
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

function importOFX_(_x10, _x11) {
  return _importOFX_.apply(this, arguments);
}

function _importOFX_() {
  _importOFX_ = _asyncToGenerator(function* (req, res) {
    try {
      let userId = req.user.id;
      log.info('Parsing OFX file...');
      yield importData(userId, (0, _ofx.ofxToKresus)(req.body));
      log.info('Running migrations...');
      yield (0, _migrations.run)();
      log.info('Done.');
      log.info('Import finished with success!');
      res.status(200).end();
    } catch (err) {
      return (0, _helpers2.asyncErr)(res, err, 'when importing data');
    }
  });
  return _importOFX_.apply(this, arguments);
}

const testing = {
  importData,
  ofxToKresus: _ofx.ofxToKresus
};
exports.testing = testing;