"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.run = run;
exports.testing = void 0;

var _accesses = _interopRequireDefault(require("./accesses"));

var _accounts = _interopRequireDefault(require("./accounts"));

var _alerts = _interopRequireDefault(require("./alerts"));

var _budgets = _interopRequireDefault(require("./budgets"));

var _categories = _interopRequireDefault(require("./categories"));

var _settings = _interopRequireDefault(require("./settings"));

var _transactions = _interopRequireDefault(require("./transactions"));

var _deprecatedBank = _interopRequireDefault(require("./deprecated-bank"));

var _deprecatedOperationtype = _interopRequireDefault(require("./deprecated-operationtype"));

var _users = _interopRequireDefault(require("./users"));

var _ghostSettings = require("../../lib/ghost-settings");

var _helpers = require("../../helpers");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

let log = (0, _helpers.makeLogger)('models/migrations'); // For a given access, retrieves the custom fields and gives them to the
// changeFn, which must return a new version of the custom fields (deleted
// fields won't be kept in database). After which they're saved (it's not
// changeFn's responsability to call save/update).

function updateCustomFields(_x, _x2, _x3) {
  return _updateCustomFields.apply(this, arguments);
}

function _updateCustomFields() {
  _updateCustomFields = _asyncToGenerator(function* (userId, access, changeFn) {
    // "deep copy", lol
    let newCustomFields = JSON.parse(access.customFields || '[]');
    newCustomFields = changeFn(newCustomFields);
    log.debug(`Updating custom fields for ${access.id}`);
    yield _accesses.default.update(userId, access.id, {
      customFields: JSON.stringify(newCustomFields)
    });
  });
  return _updateCustomFields.apply(this, arguments);
}

function makeRenameField(Model, formerFieldName, newFieldName) {
  return (
    /*#__PURE__*/
    function () {
      var _ref = _asyncToGenerator(function* (userId) {
        let _Model$displayName = Model.displayName,
            displayName = _Model$displayName === void 0 ? '(some model)' : _Model$displayName;

        try {
          log.info(`Renaming ${displayName}.${formerFieldName} to ${newFieldName}`);
          let allEntities = yield Model.all(userId);
          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            for (var _iterator = allEntities[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              let entity = _step.value;

              if (typeof entity.id === 'undefined') {
                // Could happen for e.g. ghost settings.
                continue;
              }

              if (typeof entity[formerFieldName] === 'undefined') {
                // The object might have been migrated already; in this
                // case, migrating again will clobber the migrated value.
                // Don't do this!
                continue;
              }

              yield Model.update(userId, entity.id, {
                [newFieldName]: entity[formerFieldName],
                [formerFieldName]: null
              });
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

          return true;
        } catch (e) {
          log.error(`Error while renaming field ${displayName}.${formerFieldName} to ${newFieldName}:`, e.toString());
          return false;
        }
      });

      return function (_x4) {
        return _ref.apply(this, arguments);
      };
    }()
  );
}
/**
 * This is an array of all the migrations to apply on the database, in order to
 * automatically keep database schema in sync with Kresus code.
 *
 * _Note_: As only the necessary migrations are run at each startup, you should
 * NEVER update a given migration, but instead add a new migration to reflect
 * the changes you want to apply on the db. Updating an existing migration
 * might not update the database as expected.
 */


let migrations = [
/*#__PURE__*/
function () {
  var _m = _asyncToGenerator(function* (userId) {
    log.info('Removing weboob-log and weboob-installed from the db...');
    let weboobLog = yield _settings.default.byKey(userId, 'weboob-log');

    if (weboobLog) {
      log.info('\tDestroying Settings[weboob-log].');
      yield _settings.default.destroy(userId, weboobLog.id);
    }

    let weboobInstalled = yield _settings.default.byKey(userId, 'weboob-installed');

    if (weboobInstalled) {
      log.info('\tDestroying Settings[weboob-installed].');
      yield _settings.default.destroy(userId, weboobInstalled.id);
    }

    return true;
  });

  function m0(_x5) {
    return _m.apply(this, arguments);
  }

  return m0;
}(),
/*#__PURE__*/
function () {
  var _m2 = _asyncToGenerator(function* (userId) {
    log.info('Checking that operations with categories are consistent...');
    let operations = yield _transactions.default.all(userId);
    let categories = yield _categories.default.all(userId);
    let categorySet = new Set();
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = categories[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        let c = _step2.value;
        categorySet.add(c.id);
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

    let catNum = 0;
    var _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
    var _iteratorError3 = undefined;

    try {
      for (var _iterator3 = operations[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
        let op = _step3.value;

        if (typeof op.categoryId !== 'undefined' && !categorySet.has(op.categoryId)) {
          yield _transactions.default.update(userId, op.id, {
            categoryId: null
          });
          catNum += 1;
        }
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

    if (catNum) {
      log.info(`\t${catNum} operations had an inconsistent category.`);
    }

    return true;
  });

  function m1(_x6) {
    return _m2.apply(this, arguments);
  }

  return m1;
}(),
/*#__PURE__*/
function () {
  var _m3 = _asyncToGenerator(function* (userId) {
    log.info('Replacing NONE_CATEGORY_ID by null...');
    let operations = yield _transactions.default.all(userId);
    let num = 0;
    var _iteratorNormalCompletion4 = true;
    var _didIteratorError4 = false;
    var _iteratorError4 = undefined;

    try {
      for (var _iterator4 = operations[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
        let o = _step4.value;

        if (typeof o.categoryId !== 'undefined' && o.categoryId.toString() === '-1') {
          yield _transactions.default.update(userId, o.id, {
            categoryId: null
          });
          num += 1;
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

    if (num) {
      log.info(`\t${num} operations had -1 as categoryId.`);
    }

    return true;
  });

  function m2(_x7) {
    return _m3.apply(this, arguments);
  }

  return m2;
}(),
/*#__PURE__*/
function () {
  var _m4 = _asyncToGenerator(function* (userId) {
    log.info('Migrating websites to the customFields format...');
    let accesses = yield _accesses.default.all(userId);
    let num = 0;

    let updateFields = website => customFields => {
      if (customFields.some(field => field.name === 'website')) {
        return customFields;
      }

      customFields.push({
        name: 'website',
        value: website
      });
      return customFields;
    };

    var _iteratorNormalCompletion5 = true;
    var _didIteratorError5 = false;
    var _iteratorError5 = undefined;

    try {
      for (var _iterator5 = accesses[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
        let a = _step5.value;

        if (typeof a.website === 'undefined' || !a.website.length) {
          continue;
        }

        yield updateCustomFields(userId, a, updateFields(a.website));
        num += 1;
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

    if (num) {
      log.info(`\t${num} accesses updated to the customFields format.`);
    }

    return true;
  });

  function m3(_x8) {
    return _m4.apply(this, arguments);
  }

  return m3;
}(),
/*#__PURE__*/
function () {
  var _m5 = _asyncToGenerator(function* (userId) {
    log.info('Migrating HelloBank users to BNP and BNP users to the new website format.');
    let accesses = yield _accesses.default.all(userId);

    let updateFieldsBnp = customFields => {
      if (customFields.some(field => field.name === 'website')) {
        return customFields;
      }

      customFields.push({
        name: 'website',
        value: 'pp'
      });
      log.info('\tBNP access updated to the new website format.');
      return customFields;
    };

    let updateFieldsHelloBank = customFields => {
      customFields.push({
        name: 'website',
        value: 'hbank'
      });
      return customFields;
    };

    var _iteratorNormalCompletion6 = true;
    var _didIteratorError6 = false;
    var _iteratorError6 = undefined;

    try {
      for (var _iterator6 = accesses[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
        let a = _step6.value;

        if (a.vendorId === 'bnporc') {
          yield updateCustomFields(userId, a, updateFieldsBnp);
          continue;
        }

        if (a.vendorId === 'hellobank') {
          // Update access
          yield updateCustomFields(userId, a, updateFieldsHelloBank); // Update accounts

          let accounts = yield _accounts.default.byVendorId(userId, {
            uuid: 'hellobank'
          });
          var _iteratorNormalCompletion7 = true;
          var _didIteratorError7 = false;
          var _iteratorError7 = undefined;

          try {
            for (var _iterator7 = accounts[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
              let acc = _step7.value;
              yield _accounts.default.update(userId, acc.id, {
                vendorId: 'bnporc'
              });
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

          yield _accesses.default.update(userId, a.id, {
            vendorId: 'bnporc'
          });
          log.info("\tHelloBank access updated to use BNP's backend.");
          continue;
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

    return true;
  });

  function m4(_x9) {
    return _m5.apply(this, arguments);
  }

  return m4;
}(),
/*#__PURE__*/
function () {
  var _m6 = _asyncToGenerator(function* (userId) {
    log.info('Ensure "importDate" field is present in accounts.');
    let accounts = yield _accounts.default.all(userId);

    let reducer = (oldest, operation) => {
      let importTimestamp = +new Date(operation.importDate);

      if (isNaN(importTimestamp)) {
        return oldest;
      }

      return Math.min(oldest, importTimestamp);
    };

    var _iteratorNormalCompletion8 = true;
    var _didIteratorError8 = false;
    var _iteratorError8 = undefined;

    try {
      for (var _iterator8 = accounts[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
        let a = _step8.value;

        if (typeof a.importDate !== 'undefined') {
          continue;
        }

        log.info(`\t${a.vendorAccountId} has no importDate.`);
        let ops = yield _transactions.default.byAccount(userId, a);
        let dateNumber = Date.now();

        if (ops.length) {
          dateNumber = ops.reduce(reducer, Date.now());
        }

        let importDate = new Date(dateNumber);
        yield _accounts.default.update(userId, a.id, {
          importDate
        });
        log.info(`\tImport date for ${a.label} (${a.vendorAccountId}): ${importDate}`);
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

    return true;
  });

  function m5(_x10) {
    return _m6.apply(this, arguments);
  }

  return m5;
}(),
/*#__PURE__*/
function () {
  var _m7 = _asyncToGenerator(function* (userId) {
    log.info('Migrate operationTypeId to type field...');

    try {
      let types = yield _deprecatedOperationtype.default.all();

      if (types.length) {
        let operations = yield _transactions.default.allWithOperationTypesId(userId);
        log.info(`${operations.length} operations to migrate`);
        let typeMap = new Map();
        var _iteratorNormalCompletion9 = true;
        var _didIteratorError9 = false;
        var _iteratorError9 = undefined;

        try {
          for (var _iterator9 = types[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
            let _step9$value = _step9.value,
                id = _step9$value.id,
                name = _step9$value.name;
            typeMap.set(id, name);
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

        var _iteratorNormalCompletion10 = true;
        var _didIteratorError10 = false;
        var _iteratorError10 = undefined;

        try {
          for (var _iterator10 = operations[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
            let operation = _step10.value;
            let type;

            if (operation.operationTypeID && typeMap.has(operation.operationTypeID)) {
              type = typeMap.get(operation.operationTypeID);
            } else {
              type = _helpers.UNKNOWN_OPERATION_TYPE;
            }

            yield _transactions.default.update(userId, operation.id, {
              type,
              operationTypeID: null
            });
          } // Delete operation types

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

        var _iteratorNormalCompletion11 = true;
        var _didIteratorError11 = false;
        var _iteratorError11 = undefined;

        try {
          for (var _iterator11 = types[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
            let type = _step11.value;

            if (typeof type.id !== 'undefined') {
              yield _deprecatedOperationtype.default.destroy(type.id);
            }
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
      }

      return true;
    } catch (e) {
      log.error(`Error while updating operation type: ${e}`);
      return false;
    }
  });

  function m6(_x11) {
    return _m7.apply(this, arguments);
  }

  return m6;
}(),
/*#__PURE__*/
function () {
  var _m8 = _asyncToGenerator(function* (userId) {
    log.info('Ensuring consistency of accounts with alerts...');

    try {
      let accountSet = new Set();
      let accounts = yield _accounts.default.all(userId);
      let alerts = yield _alerts.default.all(userId);
      var _iteratorNormalCompletion12 = true;
      var _didIteratorError12 = false;
      var _iteratorError12 = undefined;

      try {
        for (var _iterator12 = accounts[Symbol.iterator](), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
          let account = _step12.value;
          accountSet.add(account.vendorAccountId);
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

      let numOrphans = 0;
      var _iteratorNormalCompletion13 = true;
      var _didIteratorError13 = false;
      var _iteratorError13 = undefined;

      try {
        for (var _iterator13 = alerts[Symbol.iterator](), _step13; !(_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done); _iteratorNormalCompletion13 = true) {
          let al = _step13.value;

          if (typeof al.bankAccount === 'undefined') {
            continue;
          }

          if (!accountSet.has(al.bankAccount)) {
            numOrphans++;
            yield _alerts.default.destroy(userId, al.id);
          }
        }
      } catch (err) {
        _didIteratorError13 = true;
        _iteratorError13 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion13 && _iterator13.return != null) {
            _iterator13.return();
          }
        } finally {
          if (_didIteratorError13) {
            throw _iteratorError13;
          }
        }
      }

      if (numOrphans) {
        log.info(`\tfound and removed ${numOrphans} orphan alerts`);
      }

      return true;
    } catch (e) {
      log.error(`Error while ensuring consistency of alerts: ${e.toString()}`);
      return false;
    }
  });

  function m7(_x12) {
    return _m8.apply(this, arguments);
  }

  return m7;
}(),
/*#__PURE__*/
function () {
  var _m9 = _asyncToGenerator(function* () {
    log.info('Deleting banks from database');

    try {
      let banks = yield _deprecatedBank.default.all();
      var _iteratorNormalCompletion14 = true;
      var _didIteratorError14 = false;
      var _iteratorError14 = undefined;

      try {
        for (var _iterator14 = banks[Symbol.iterator](), _step14; !(_iteratorNormalCompletion14 = (_step14 = _iterator14.next()).done); _iteratorNormalCompletion14 = true) {
          let bank = _step14.value;

          if (typeof bank.id !== 'undefined') {
            yield _deprecatedBank.default.destroy(bank.id);
          }
        }
      } catch (err) {
        _didIteratorError14 = true;
        _iteratorError14 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion14 && _iterator14.return != null) {
            _iterator14.return();
          }
        } finally {
          if (_didIteratorError14) {
            throw _iteratorError14;
          }
        }
      }

      return true;
    } catch (e) {
      log.error(`Error while deleting banks: ${e.toString()}`);
      return false;
    }
  });

  function m8() {
    return _m9.apply(this, arguments);
  }

  return m8;
}(),
/*#__PURE__*/
function () {
  var _m10 = _asyncToGenerator(function* () {
    // This migration used to set the website custom field to 'par' for the CMB accesses.
    // However this is not expected anymore, and the value should now be set to 'pro', as done
    // in m19. This migration is therefore now a no-op so that m19 can do its job (it could not
    // if the website custom field was already set).
    return true;
  });

  function m9() {
    return _m10.apply(this, arguments);
  }

  return m9;
}(),
/*#__PURE__*/
function () {
  var _m11 = _asyncToGenerator(function* (userId) {
    log.info('Looking for an s2e module...');

    try {
      let accesses = yield _accesses.default.byVendorId(userId, {
        uuid: 's2e'
      });
      var _iteratorNormalCompletion15 = true;
      var _didIteratorError15 = false;
      var _iteratorError15 = undefined;

      try {
        for (var _iterator15 = accesses[Symbol.iterator](), _step15; !(_iteratorNormalCompletion15 = (_step15 = _iterator15.next()).done); _iteratorNormalCompletion15 = true) {
          let access = _step15.value;
          let customFields = JSON.parse(access.customFields);

          let _customFields$find = customFields.find(f => f.name === 'website'),
              website = _customFields$find.value;

          let vendorId = null;

          switch (website) {
            case 'smartphone.s2e-net.com':
              log.info('\tMigrating s2e module to bnpere...');
              vendorId = 'bnppere';
              break;

            case 'mobile.capeasi.com':
              log.info('\tMigrating s2e module to capeasi...');
              vendorId = 'capeasi';
              break;

            case 'm.esalia.com':
              log.info('\tMigrating s2e module to esalia...');
              vendorId = 'esalia';
              break;

            case 'mobi.ere.hsbc.fr':
              log.error('\tCannot migrate module s2e.');
              log.error('\tPlease create a new access using erehsbc module (HSBC ERE).');
              continue;

            default:
              log.error(`Invalid value for s2e module: ${website}`);
              continue;
          }

          if (vendorId !== null) {
            yield _accesses.default.update(userId, access.id, {
              customFields: '[]',
              vendorId
            });
          }
        }
      } catch (err) {
        _didIteratorError15 = true;
        _iteratorError15 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion15 && _iterator15.return != null) {
            _iterator15.return();
          }
        } finally {
          if (_didIteratorError15) {
            throw _iteratorError15;
          }
        }
      }

      return true;
    } catch (e) {
      log.error(`Error while migrating s2e accesses: ${e.toString()}`);
      return false;
    }
  });

  function m10(_x13) {
    return _m11.apply(this, arguments);
  }

  return m10;
}(),
/*#__PURE__*/
function () {
  var _m12 = _asyncToGenerator(function* (userId) {
    log.info('Searching accounts with IBAN value set to None');

    try {
      let accounts = yield _accounts.default.all(userId);
      var _iteratorNormalCompletion16 = true;
      var _didIteratorError16 = false;
      var _iteratorError16 = undefined;

      try {
        for (var _iterator16 = accounts.filter(acc => acc.iban === 'None')[Symbol.iterator](), _step16; !(_iteratorNormalCompletion16 = (_step16 = _iterator16.next()).done); _iteratorNormalCompletion16 = true) {
          let account = _step16.value;
          log.info(`\tDeleting iban for ${account.label} of bank ${account.vendorId}`);
          yield _accounts.default.update(userId, account.id, {
            iban: null
          });
        }
      } catch (err) {
        _didIteratorError16 = true;
        _iteratorError16 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion16 && _iterator16.return != null) {
            _iterator16.return();
          }
        } finally {
          if (_didIteratorError16) {
            throw _iteratorError16;
          }
        }
      }

      return true;
    } catch (e) {
      log.error(`Error while deleting iban with None value: ${e.toString()}`);
      return false;
    }
  });

  function m11(_x14) {
    return _m12.apply(this, arguments);
  }

  return m11;
}(),
/*#__PURE__*/
function () {
  var _m13 = _asyncToGenerator(function* (userId) {
    log.info("Ensuring the Settings table doesn't contain any ghost settings.");

    try {
      var _iteratorNormalCompletion17 = true;
      var _didIteratorError17 = false;
      var _iteratorError17 = undefined;

      try {
        for (var _iterator17 = _ghostSettings.ConfigGhostSettings.keys()[Symbol.iterator](), _step17; !(_iteratorNormalCompletion17 = (_step17 = _iterator17.next()).done); _iteratorNormalCompletion17 = true) {
          let ghostKey = _step17.value;
          let found = yield _settings.default.byKey(userId, ghostKey);

          if (found) {
            yield _settings.default.destroy(userId, found.id);
            log.info(`\tRemoved ${ghostKey} from the database.`);
          }
        }
      } catch (err) {
        _didIteratorError17 = true;
        _iteratorError17 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion17 && _iterator17.return != null) {
            _iterator17.return();
          }
        } finally {
          if (_didIteratorError17) {
            throw _iteratorError17;
          }
        }
      }

      return true;
    } catch (e) {
      log.error('Error while deleting the ghost settings from the Settings table.');
      return false;
    }
  });

  function m12(_x15) {
    return _m13.apply(this, arguments);
  }

  return m12;
}(),
/*#__PURE__*/
function () {
  var _m14 = _asyncToGenerator(function* (userId) {
    log.info('Migrating the email configuration...');

    try {
      let found = yield _settings.default.byKey(userId, 'mail-config');

      if (!found) {
        log.info('Not migrating: email configuration not found.');
        return true;
      }

      let _JSON$parse = JSON.parse(found.value),
          toEmail = _JSON$parse.toEmail;

      if (!toEmail) {
        log.info('Not migrating: recipient email not found in current configuration.');
        yield _settings.default.destroy(userId, found.id);
        log.info('Previous configuration destroyed.');
        return true;
      }

      log.info(`Found mail config, migrating toEmail=${toEmail}.`); // There's a race condition hidden here: the user could have set a
      // new email address before the migration happened, at start. In
      // this case, this will just keep the email they've set.

      yield _settings.default.findOrCreateByKey(userId, 'email-recipient', toEmail);
      yield _settings.default.destroy(userId, found.id);
      log.info('Done migrating recipient email configuration!');
      return true;
    } catch (e) {
      log.error('Error while migrating the email configuration: ', e.toString());
      return false;
    }
  });

  function m13(_x16) {
    return _m14.apply(this, arguments);
  }

  return m13;
}(),
/*#__PURE__*/
function () {
  var _m15 = _asyncToGenerator(function* (userId) {
    try {
      log.info('Migrating empty access.customFields...');
      let accesses = yield _accesses.default.all(userId);
      var _iteratorNormalCompletion18 = true;
      var _didIteratorError18 = false;
      var _iteratorError18 = undefined;

      try {
        for (var _iterator18 = accesses[Symbol.iterator](), _step18; !(_iteratorNormalCompletion18 = (_step18 = _iterator18.next()).done); _iteratorNormalCompletion18 = true) {
          let access = _step18.value;

          try {
            if (!(JSON.parse(access.customFields) instanceof Array)) {
              throw new Error('customFields should be an array');
            }
          } catch (e) {
            log.info(`Found invalid access.customFields for access with id=${access.id}, replacing by empty array.`);
            yield _accesses.default.update(userId, access.id, {
              customFields: '[]'
            });
          }
        }
      } catch (err) {
        _didIteratorError18 = true;
        _iteratorError18 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion18 && _iterator18.return != null) {
            _iterator18.return();
          }
        } finally {
          if (_didIteratorError18) {
            throw _iteratorError18;
          }
        }
      }

      return true;
    } catch (e) {
      log.error('Error while migrating empty access.customFields:', e.toString());
      return false;
    }
  });

  function m14(_x17) {
    return _m15.apply(this, arguments);
  }

  return m14;
}(),
/*#__PURE__*/
function () {
  var _m16 = _asyncToGenerator(function* (userId) {
    log.info('Re-applying m12 now that "weboob-version" was moved to ghost settings.');
    return yield migrations[12](userId);
  });

  function m15(_x18) {
    return _m16.apply(this, arguments);
  }

  return m15;
}(),
/*#__PURE__*/
function () {
  var _m17 = _asyncToGenerator(function* (userId) {
    log.info('Linking operations to account by id instead of vendorAccountId');

    try {
      let operations = yield _transactions.default.all(userId);
      let accounts = yield _accounts.default.all(userId);
      let accountsMap = new Map();
      var _iteratorNormalCompletion19 = true;
      var _didIteratorError19 = false;
      var _iteratorError19 = undefined;

      try {
        for (var _iterator19 = accounts[Symbol.iterator](), _step19; !(_iteratorNormalCompletion19 = (_step19 = _iterator19.next()).done); _iteratorNormalCompletion19 = true) {
          let account = _step19.value;

          if (accountsMap.has(account.vendorAccountId)) {
            accountsMap.get(account.vendorAccountId).push(account);
          } else {
            accountsMap.set(account.vendorAccountId, [account]);
          }
        }
      } catch (err) {
        _didIteratorError19 = true;
        _iteratorError19 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion19 && _iterator19.return != null) {
            _iterator19.return();
          }
        } finally {
          if (_didIteratorError19) {
            throw _iteratorError19;
          }
        }
      }

      let newOperations = [];
      let numMigratedOps = 0;
      let numOrphanOps = 0;
      var _iteratorNormalCompletion20 = true;
      var _didIteratorError20 = false;
      var _iteratorError20 = undefined;

      try {
        for (var _iterator20 = operations[Symbol.iterator](), _step20; !(_iteratorNormalCompletion20 = (_step20 = _iterator20.next()).done); _iteratorNormalCompletion20 = true) {
          let op = _step20.value;

          // Ignore already migrated operations.
          if (typeof op.bankAccount === 'undefined' || op.bankAccount === null) {
            continue;
          }

          if (!accountsMap.has(op.bankAccount)) {
            log.warn('Orphan operation, to be removed:', op);
            numOrphanOps++;
            yield _transactions.default.destroy(userId, op.id);
            continue;
          }

          let cloneOperation = false;
          var _iteratorNormalCompletion22 = true;
          var _didIteratorError22 = false;
          var _iteratorError22 = undefined;

          try {
            for (var _iterator22 = accountsMap.get(op.bankAccount)[Symbol.iterator](), _step22; !(_iteratorNormalCompletion22 = (_step22 = _iterator22.next()).done); _iteratorNormalCompletion22 = true) {
              let account = _step22.value;

              if (cloneOperation) {
                let newOp = op.clone();
                newOp.accountId = account.id;
                delete newOp.bankAccount;
                newOp = yield _transactions.default.create(userId, newOp);
                newOperations.push(newOp);
              } else {
                cloneOperation = true;
                yield _transactions.default.update(userId, op.id, {
                  accountId: account.id,
                  bankAccount: null
                });
                numMigratedOps++;
              }
            }
          } catch (err) {
            _didIteratorError22 = true;
            _iteratorError22 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion22 && _iterator22.return != null) {
                _iterator22.return();
              }
            } finally {
              if (_didIteratorError22) {
                throw _iteratorError22;
              }
            }
          }
        }
      } catch (err) {
        _didIteratorError20 = true;
        _iteratorError20 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion20 && _iterator20.return != null) {
            _iterator20.return();
          }
        } finally {
          if (_didIteratorError20) {
            throw _iteratorError20;
          }
        }
      }

      log.info(`${numMigratedOps} operations migrated`);
      log.info(`${numOrphanOps} orphan operations have been removed`);
      log.info(`${newOperations.length} new operations created`);
      log.info('All operations correctly migrated.');
      log.info('Linking alerts to account by id instead of vendorAccountId');
      let alerts = yield _alerts.default.all(userId);
      let newAlerts = [];
      let numMigratedAlerts = 0;
      let numOrphanAlerts = 0;
      var _iteratorNormalCompletion21 = true;
      var _didIteratorError21 = false;
      var _iteratorError21 = undefined;

      try {
        for (var _iterator21 = alerts[Symbol.iterator](), _step21; !(_iteratorNormalCompletion21 = (_step21 = _iterator21.next()).done); _iteratorNormalCompletion21 = true) {
          let alert = _step21.value;

          // Ignore already migrated alerts.
          if (typeof alert.bankAccount === 'undefined' || alert.bankAccount === null) {
            continue;
          }

          if (!accountsMap.has(alert.bankAccount)) {
            log.warn('Orphan alert, to be removed:', alert);
            numOrphanAlerts++;
            yield _alerts.default.destroy(userId, alert.id);
            continue;
          }

          let cloneAlert = false;
          var _iteratorNormalCompletion23 = true;
          var _didIteratorError23 = false;
          var _iteratorError23 = undefined;

          try {
            for (var _iterator23 = accountsMap.get(alert.bankAccount)[Symbol.iterator](), _step23; !(_iteratorNormalCompletion23 = (_step23 = _iterator23.next()).done); _iteratorNormalCompletion23 = true) {
              let account = _step23.value;

              if (cloneAlert) {
                let newAlert = alert.clone();
                newAlert.accountId = account.id;
                delete newAlert.bankAccount;
                newAlert = yield _alerts.default.create(userId, newAlert);
                newAlerts.push(newAlert);
              } else {
                cloneAlert = true;
                yield _alerts.default.update(userId, alert.id, {
                  bankAccount: null,
                  accountId: account.id
                });
                numMigratedAlerts++;
              }
            }
          } catch (err) {
            _didIteratorError23 = true;
            _iteratorError23 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion23 && _iterator23.return != null) {
                _iterator23.return();
              }
            } finally {
              if (_didIteratorError23) {
                throw _iteratorError23;
              }
            }
          }
        }
      } catch (err) {
        _didIteratorError21 = true;
        _iteratorError21 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion21 && _iterator21.return != null) {
            _iterator21.return();
          }
        } finally {
          if (_didIteratorError21) {
            throw _iteratorError21;
          }
        }
      }

      log.info(`${numMigratedAlerts} alerts migrated`);
      log.info(`${numOrphanAlerts} orphan alerts have been removed`);
      log.info(`${newAlerts.length} new alerts created`);
      log.info('All alerts correctly migrated.');
      return true;
    } catch (e) {
      log.error('Error while linking operations and alerts to account by id: ', e.toString());
      return false;
    }
  });

  function m16(_x19) {
    return _m17.apply(this, arguments);
  }

  return m16;
}(),
/*#__PURE__*/
function () {
  var _m18 = _asyncToGenerator(function* (userId) {
    log.info('Trying to apply m16 again after resolution of #733.');
    return yield migrations[16](userId);
  });

  function m17(_x20) {
    return _m18.apply(this, arguments);
  }

  return m17;
}(),
/*#__PURE__*/
function () {
  var _m19 = _asyncToGenerator(function* (userId) {
    log.info('Migrating budgets from categories to budgets.');

    try {
      let categories = yield _categories.default.all(userId);
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();
      var _iteratorNormalCompletion24 = true;
      var _didIteratorError24 = false;
      var _iteratorError24 = undefined;

      try {
        for (var _iterator24 = categories[Symbol.iterator](), _step24; !(_iteratorNormalCompletion24 = (_step24 = _iterator24.next()).done); _iteratorNormalCompletion24 = true) {
          let category = _step24.value;

          if (category.threshold === 0) {
            continue;
          } // If there is no budget for this category, create one for the current period.


          let budget = yield _budgets.default.byCategory(userId, category.id);

          if (!budget || budget.length === 0) {
            log.info(`Migrating budget for category ${category.label} with period ${month}/${year}`);
            yield _budgets.default.create(userId, {
              categoryId: category.id,
              threshold: category.threshold,
              year,
              month
            });
          }

          yield _categories.default.update(userId, category.id, {
            threshold: 0
          });
        }
      } catch (err) {
        _didIteratorError24 = true;
        _iteratorError24 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion24 && _iterator24.return != null) {
            _iterator24.return();
          }
        } finally {
          if (_didIteratorError24) {
            throw _iteratorError24;
          }
        }
      }
    } catch (e) {
      log.error('Error while migrating budgets from categories to bugdets:', e.toString());
      return false;
    }

    return true;
  });

  function m18(_x21) {
    return _m19.apply(this, arguments);
  }

  return m18;
}(),
/*#__PURE__*/
function () {
  var _m20 = _asyncToGenerator(function* (userId) {
    log.info('Migrating Crédit Mutuel de Bretagne default website.');

    try {
      let accesses = yield _accesses.default.byVendorId(userId, {
        uuid: 'cmb'
      });
      var _iteratorNormalCompletion25 = true;
      var _didIteratorError25 = false;
      var _iteratorError25 = undefined;

      try {
        accessLoop: for (var _iterator25 = accesses[Symbol.iterator](), _step25; !(_iteratorNormalCompletion25 = (_step25 = _iterator25.next()).done); _iteratorNormalCompletion25 = true) {
          let access = _step25.value;
          let customFields = JSON.parse(access.customFields);
          var _iteratorNormalCompletion26 = true;
          var _didIteratorError26 = false;
          var _iteratorError26 = undefined;

          try {
            for (var _iterator26 = customFields[Symbol.iterator](), _step26; !(_iteratorNormalCompletion26 = (_step26 = _iterator26.next()).done); _iteratorNormalCompletion26 = true) {
              let customField = _step26.value;

              if (customField.name === 'website') {
                log.info('Website already set in custom field. Leaving as is');
                continue accessLoop;
              }
            }
          } catch (err) {
            _didIteratorError26 = true;
            _iteratorError26 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion26 && _iterator26.return != null) {
                _iterator26.return();
              }
            } finally {
              if (_didIteratorError26) {
                throw _iteratorError26;
              }
            }
          }

          customFields.push({
            name: 'website',
            value: 'pro'
          });
          yield _accesses.default.update(userId, access.id, {
            customFields: JSON.stringify(customFields)
          });
        }
      } catch (err) {
        _didIteratorError25 = true;
        _iteratorError25 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion25 && _iterator25.return != null) {
            _iterator25.return();
          }
        } finally {
          if (_didIteratorError25) {
            throw _iteratorError25;
          }
        }
      }
    } catch (e) {
      log.error('Error while migrating Crédit Mutuel de Bretagne default website:', e.toString());
      return false;
    }

    return true;
  });

  function m19(_x22) {
    return _m20.apply(this, arguments);
  }

  return m19;
}(),
/*#__PURE__*/
function () {
  var _m21 = _asyncToGenerator(function* (userId) {
    log.info('Migrating camelCase settings to regular-case.');

    try {
      let settings = yield _settings.default.all(userId);
      let numMigrated = 0;
      var _iteratorNormalCompletion27 = true;
      var _didIteratorError27 = false;
      var _iteratorError27 = undefined;

      try {
        for (var _iterator27 = settings[Symbol.iterator](), _step27; !(_iteratorNormalCompletion27 = (_step27 = _iterator27.next()).done); _iteratorNormalCompletion27 = true) {
          let s = _step27.value;
          let newKey = null;

          switch (s.key) {
            case 'duplicateThreshold':
              newKey = 'duplicate-threshold';
              break;

            case 'duplicateIgnoreDifferentCustomFields':
              newKey = 'duplicate-ignore-different-custom-fields';
              break;

            case 'defaultChartDisplayType':
              newKey = 'default-chart-display-type';
              break;

            case 'defaultChartType':
              newKey = 'default-chart-type';
              break;

            case 'defaultChartPeriod':
              newKey = 'default-chart-period';
              break;

            case 'defaultAccountId':
              newKey = 'default-account-id';
              break;

            case 'defaultCurrency':
              newKey = 'default-currency';
              break;

            case 'budgetDisplayPercent':
              newKey = 'budget-display-percent';
              break;

            case 'budgetDisplayNoThreshold':
              newKey = 'budget-display-no-threshold';
              break;

            default:
              break;
          }

          if (newKey !== null) {
            yield _settings.default.update(userId, s.id, {
              key: newKey
            });
            numMigrated++;
          }
        }
      } catch (err) {
        _didIteratorError27 = true;
        _iteratorError27 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion27 && _iterator27.return != null) {
            _iterator27.return();
          }
        } finally {
          if (_didIteratorError27) {
            throw _iteratorError27;
          }
        }
      }

      log.info(numMigrated, 'camelCase settings have been migrated.');
      return true;
    } catch (e) {
      log.error('Error while migrating camelCase settings:', e.toString());
      return false;
    }
  });

  function m20(_x23) {
    return _m21.apply(this, arguments);
  }

  return m20;
}(),
/*#__PURE__*/
function () {
  var _m22 = _asyncToGenerator(function* (userId) {
    log.info('Migrating banquepopulaire websites.');

    try {
      let accesses = yield _accesses.default.byVendorId(userId, {
        uuid: 'banquepopulaire'
      });

      const updateBanqueBopulaire = customFields => {
        let newFields = [];
        var _iteratorNormalCompletion28 = true;
        var _didIteratorError28 = false;
        var _iteratorError28 = undefined;

        try {
          for (var _iterator28 = customFields[Symbol.iterator](), _step28; !(_iteratorNormalCompletion28 = (_step28 = _iterator28.next()).done); _iteratorNormalCompletion28 = true) {
            let _step28$value = _step28.value,
                name = _step28$value.name,
                value = _step28$value.value;

            if (name !== 'website') {
              newFields.push({
                name,
                value
              });
              continue;
            }

            let newField = {
              name
            };

            switch (value) {
              case 'www.ibps.alpes.banquepopulaire.fr':
              case 'www.ibps.loirelyonnais.banquepopulaire.fr':
              case 'www.ibps.massifcentral.banquepopulaire.fr':
                newField.value = 'www.ibps.bpaura.banquepopulaire.fr';
                break;

              case 'www.ibps.alsace.banquepopulaire.fr':
              case 'www.ibps.lorrainechampagne.banquepopulaire.fr':
                newField.value = 'www.ibps.bpalc.banquepopulaire.fr';
                break;

              case 'www.ibps.atlantique.banquepopulaire.fr':
              case 'www.ibps.ouest.banquepopulaire.fr':
                newField.value = 'www.ibps.bpgo.banquepopulaire.fr';
                break;

              case 'www.ibps.bretagnenormandie.cmm.banquepopulaire.fr':
                newField.value = 'www.ibps.cmgo.creditmaritime.groupe.banquepopulaire.fr';
                break;

              case 'www.ibps.cotedazure.banquepopulaire.fr':
              case 'www.ibps.provencecorse.banquepopulaire.fr':
                newField.value = 'www.ibps.mediterranee.banquepopulaire.fr';
                break;

              case 'www.ibps.sudouest.creditmaritime.groupe.banquepopulaire.fr':
                newField.value = 'www.ibps.bpaca.banquepopulaire.fr';
                break;

              default:
                newField.value = value;
                break;
            }

            newFields.push(newField);
          }
        } catch (err) {
          _didIteratorError28 = true;
          _iteratorError28 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion28 && _iterator28.return != null) {
              _iterator28.return();
            }
          } finally {
            if (_didIteratorError28) {
              throw _iteratorError28;
            }
          }
        }

        return newFields;
      };

      var _iteratorNormalCompletion29 = true;
      var _didIteratorError29 = false;
      var _iteratorError29 = undefined;

      try {
        for (var _iterator29 = accesses[Symbol.iterator](), _step29; !(_iteratorNormalCompletion29 = (_step29 = _iterator29.next()).done); _iteratorNormalCompletion29 = true) {
          let access = _step29.value;
          yield updateCustomFields(userId, access, updateBanqueBopulaire);
        }
      } catch (err) {
        _didIteratorError29 = true;
        _iteratorError29 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion29 && _iterator29.return != null) {
            _iterator29.return();
          }
        } finally {
          if (_didIteratorError29) {
            throw _iteratorError29;
          }
        }
      }
    } catch (e) {
      log.error('Error while migrating Banque Populaire websites:', e.toString());
      return false;
    }

    return true;
  });

  function m21(_x24) {
    return _m22.apply(this, arguments);
  }

  return m21;
}(),
/*#__PURE__*/
function () {
  var _m23 = _asyncToGenerator(function* (userId) {
    log.info("Migrating bnporc 'ppold' website to 'pp'");

    try {
      let accesses = yield _accesses.default.byVendorId(userId, {
        uuid: 'bnporc'
      });

      const changePpoldToPp = customFields => {
        var _iteratorNormalCompletion30 = true;
        var _didIteratorError30 = false;
        var _iteratorError30 = undefined;

        try {
          for (var _iterator30 = customFields[Symbol.iterator](), _step30; !(_iteratorNormalCompletion30 = (_step30 = _iterator30.next()).done); _iteratorNormalCompletion30 = true) {
            let customField = _step30.value;

            if (customField.name === 'website' && customField.value === 'ppold') {
              customField.value = 'pp';
              break;
            }
          }
        } catch (err) {
          _didIteratorError30 = true;
          _iteratorError30 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion30 && _iterator30.return != null) {
              _iterator30.return();
            }
          } finally {
            if (_didIteratorError30) {
              throw _iteratorError30;
            }
          }
        }

        return customFields;
      };

      var _iteratorNormalCompletion31 = true;
      var _didIteratorError31 = false;
      var _iteratorError31 = undefined;

      try {
        for (var _iterator31 = accesses[Symbol.iterator](), _step31; !(_iteratorNormalCompletion31 = (_step31 = _iterator31.next()).done); _iteratorNormalCompletion31 = true) {
          let access = _step31.value;
          yield updateCustomFields(userId, access, changePpoldToPp);
        }
      } catch (err) {
        _didIteratorError31 = true;
        _iteratorError31 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion31 && _iterator31.return != null) {
            _iterator31.return();
          }
        } finally {
          if (_didIteratorError31) {
            throw _iteratorError31;
          }
        }
      }

      return true;
    } catch (e) {
      log.error("Error while migrating bnporc 'ppold' website to 'pp'", e.toString());
      return false;
    }
  });

  function m22(_x25) {
    return _m23.apply(this, arguments);
  }

  return m22;
}(), // m23: rename Accounts.initialAmount to initialBalance.
makeRenameField(_accounts.default, 'initialAmount', 'initialBalance'),
/*#__PURE__*/
function () {
  var _m24 = _asyncToGenerator(function* (userId) {
    try {
      log.info("Deleting 'enabled' flag for accesses.");
      let accesses = yield _accesses.default.all(userId);
      var _iteratorNormalCompletion32 = true;
      var _didIteratorError32 = false;
      var _iteratorError32 = undefined;

      try {
        for (var _iterator32 = accesses[Symbol.iterator](), _step32; !(_iteratorNormalCompletion32 = (_step32 = _iterator32.next()).done); _iteratorNormalCompletion32 = true) {
          let access = _step32.value;
          let newFields = {};

          if (typeof access.enabled !== 'undefined' && !access.enabled) {
            newFields.password = null;
          }

          newFields.enabled = null;
          yield _accesses.default.update(userId, access.id, newFields);
        }
      } catch (err) {
        _didIteratorError32 = true;
        _iteratorError32 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion32 && _iterator32.return != null) {
            _iterator32.return();
          }
        } finally {
          if (_didIteratorError32) {
            throw _iteratorError32;
          }
        }
      }

      return true;
    } catch (e) {
      log.error('Error while deleting enabled flag for accesses:', e.toString());
      return false;
    }
  });

  function m24(_x26) {
    return _m24.apply(this, arguments);
  }

  return m24;
}(), // m25: rename Categories.title to Categories.label.
makeRenameField(_categories.default, 'title', 'label'), // m26: rename Accesses.bank to Accesses.vendorId.
makeRenameField(_accesses.default, 'bank', 'vendorId'), // m27: rename Accounts.bank to Accounts.vendorId.
makeRenameField(_accounts.default, 'bank', 'vendorId'),
/*#__PURE__*/
function () {
  var _m25 = _asyncToGenerator(function* (userId) {
    try {
      log.info("Migrating accesses' customFields to their own data structure");
      let accesses = yield _accesses.default.all(userId);
      var _iteratorNormalCompletion33 = true;
      var _didIteratorError33 = false;
      var _iteratorError33 = undefined;

      try {
        for (var _iterator33 = accesses[Symbol.iterator](), _step33; !(_iteratorNormalCompletion33 = (_step33 = _iterator33.next()).done); _iteratorNormalCompletion33 = true) {
          let access = _step33.value;
          let customFields = access.customFields; // Ignore already migrated accesses.

          if (customFields === null) {
            continue;
          }

          let fields = [];

          try {
            fields = JSON.parse(customFields);
          } catch (e) {
            log.error('Invalid JSON customFields, ignoring fields:', e.toString());
          }

          yield _accesses.default.update(userId, access.id, {
            customFields: null,
            fields
          });
        }
      } catch (err) {
        _didIteratorError33 = true;
        _iteratorError33 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion33 && _iterator33.return != null) {
            _iterator33.return();
          }
        } finally {
          if (_didIteratorError33) {
            throw _iteratorError33;
          }
        }
      }

      return true;
    } catch (e) {
      log.error("Error while migrating accesses' customFields to their own data structure:", e.toString());
      return false;
    }
  });

  function m28(_x27) {
    return _m25.apply(this, arguments);
  }

  return m28;
}(), // m28: rename Transactions.raw to Transactions.rawLabel.
makeRenameField(_transactions.default, 'raw', 'rawLabel'), // m29: rename Transactions.dateImport to Transactions.importDate.
makeRenameField(_transactions.default, 'dateImport', 'importDate'), // m30: rename Accounts.lastChecked to Accounts.lastCheckDate.
makeRenameField(_accounts.default, 'lastChecked', 'lastCheckDate'), // m31: rename Accounts.bankAccess to Accounts.accessId.
makeRenameField(_accounts.default, 'bankAccess', 'accessId'), // m32: rename Accounts.accountNumber to Accounts.vendorAccountId.
makeRenameField(_accounts.default, 'accountNumber', 'vendorAccountId'), // m33: rename Accounts.title to Accounts.label.
makeRenameField(_accounts.default, 'title', 'label'), // m34: rename Transactions.title to Transactions.label.
makeRenameField(_transactions.default, 'title', 'label'),
/*#__PURE__*/
// m35: rename Settings.name to Settings.key.
function () {
  var _ref2 = _asyncToGenerator(function* (userId) {
    try {
      // There's a catch here! Before the migration runs, settings could
      // have been re-created since Settings.createOrFindByKey may
      // encounter misses.
      //
      // Our problem here is that:
      // - we don't want to end up with duplicated settings, otherwise
      // the behavior may be undefined.
      // - we want to be able to run this migration several times if
      // needed (because an import could reset the last migration).
      //
      // We do this in 3 steps:
      // - remember which settings had a key before the renaming.
      // - do the renaming.
      // - after the renaming, check if some settings have been
      // duplicated; if so, remove the one that was present before the
      // migration, since it was transient.
      // 1. Remember previous settings.
      let previousSettings = yield _settings.default.allWithoutGhost(userId);
      let previousIdMap = new Map();
      var _iteratorNormalCompletion34 = true;
      var _didIteratorError34 = false;
      var _iteratorError34 = undefined;

      try {
        for (var _iterator34 = previousSettings[Symbol.iterator](), _step34; !(_iteratorNormalCompletion34 = (_step34 = _iterator34.next()).done); _iteratorNormalCompletion34 = true) {
          let s = _step34.value;

          if (typeof s.key !== 'undefined') {
            previousIdMap.set(s.key, s.id);
          }
        } // 2. Do the actual renaming.

      } catch (err) {
        _didIteratorError34 = true;
        _iteratorError34 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion34 && _iterator34.return != null) {
            _iterator34.return();
          }
        } finally {
          if (_didIteratorError34) {
            throw _iteratorError34;
          }
        }
      }

      let rename = makeRenameField(_settings.default, 'name', 'key');

      if (!(yield rename(userId))) {
        return false;
      } // 3. Remove duplicated settings, if we introduced any.


      let newSettings = yield _settings.default.all(userId);
      var _iteratorNormalCompletion35 = true;
      var _didIteratorError35 = false;
      var _iteratorError35 = undefined;

      try {
        for (var _iterator35 = newSettings[Symbol.iterator](), _step35; !(_iteratorNormalCompletion35 = (_step35 = _iterator35.next()).done); _iteratorNormalCompletion35 = true) {
          let s = _step35.value;

          if (previousIdMap.has(s.key)) {
            if (newSettings.filter(pair => pair.key === s.key).length > 1) {
              log.info(`Removing duplicated setting ${s.key}...`);
              yield _settings.default.destroy(userId, previousIdMap.get(s.key));
              previousIdMap.delete(s.key);
            }
          }
        }
      } catch (err) {
        _didIteratorError35 = true;
        _iteratorError35 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion35 && _iterator35.return != null) {
            _iterator35.return();
          }
        } finally {
          if (_didIteratorError35) {
            throw _iteratorError35;
          }
        }
      }

      return true;
    } catch (e) {
      log.error('Error while cleaning up transient settings:', e.toString());
      return false;
    }
  });

  return function (_x28) {
    return _ref2.apply(this, arguments);
  };
}(),
/*#__PURE__*/
// m36: remove theme setting from DB
function () {
  var _m26 = _asyncToGenerator(function* (userId) {
    log.info('Removing theme setting from the database (now stored locally).');

    try {
      let found = yield _settings.default.byKey(userId, 'theme');

      if (found) {
        yield _settings.default.destroy(userId, found.id);
        log.info('\tRemoved theme setting from the database.');
      }

      return true;
    } catch (e) {
      log.error('Error while deleting the theme setting from the Settings table.', e.toString());
      return false;
    }
  });

  function m36(_x29) {
    return _m26.apply(this, arguments);
  }

  return m36;
}()];
const testing = {
  migrations
};
/**
 * Run all the required migrations.
 *
 * To determine whether a migration has to be run or not, we are comparing its
 * index in the migrations Array above with the `migration-version` config
 * value, which indicates the next migration to run.
 */

exports.testing = testing;

function run() {
  return _run.apply(this, arguments);
}

function _run() {
  _run = _asyncToGenerator(function* () {
    const users = yield _users.default.all();
    var _iteratorNormalCompletion36 = true;
    var _didIteratorError36 = false;
    var _iteratorError36 = undefined;

    try {
      for (var _iterator36 = users[Symbol.iterator](), _step36; !(_iteratorNormalCompletion36 = (_step36 = _iterator36.next()).done); _iteratorNormalCompletion36 = true) {
        let userId = _step36.value.id;
        let migrationVersion = yield _settings.default.findOrCreateDefault(userId, 'migration-version');
        let firstMigrationIndex = parseInt(migrationVersion.value, 10);

        for (let m = firstMigrationIndex; m < migrations.length; m++) {
          if (!(yield migrations[m](userId))) {
            log.error(`Migration #${m} failed, aborting.`);
            return;
          }

          yield _settings.default.updateByKey(userId, 'migration-version', (m + 1).toString());
        }
      }
    } catch (err) {
      _didIteratorError36 = true;
      _iteratorError36 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion36 && _iterator36.return != null) {
          _iterator36.return();
        }
      } finally {
        if (_didIteratorError36) {
          throw _iteratorError36;
        }
      }
    }
  });
  return _run.apply(this, arguments);
}