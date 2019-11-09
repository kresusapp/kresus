"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.cleanData = cleanData;
exports.obfuscatePasswords = obfuscatePasswords;
exports.obfuscateKeywords = obfuscateKeywords;

var _regexEscape = _interopRequireDefault(require("regex-escape"));

var _helpers = require("../../helpers");

var _ghostSettings = require("../../lib/ghost-settings");

var _defaultSettings = _interopRequireDefault(require("../../shared/default-settings"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let log = (0, _helpers.makeLogger)('controllers/helpers'); // Sync function

function cleanData(world) {
  let accessMap = {};
  let nextAccessId = 0;
  world.accesses = world.accesses || [];
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = world.accesses[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      let a = _step.value;
      accessMap[a.id] = nextAccessId;
      a.id = nextAccessId++;
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

  let accountMap = {};
  let nextAccountId = 0;
  world.accounts = world.accounts || [];
  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = world.accounts[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      let a = _step2.value;
      a.accessId = accessMap[a.accessId];
      accountMap[a.id] = nextAccountId;
      a.id = nextAccountId++;
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

  let categoryMap = {};
  let nextCatId = 0;
  world.categories = world.categories || [];
  var _iteratorNormalCompletion3 = true;
  var _didIteratorError3 = false;
  var _iteratorError3 = undefined;

  try {
    for (var _iterator3 = world.categories[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
      let c = _step3.value;
      categoryMap[c.id] = nextCatId;
      c.id = nextCatId++;
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

  world.budgets = world.budgets || [];
  var _iteratorNormalCompletion4 = true;
  var _didIteratorError4 = false;
  var _iteratorError4 = undefined;

  try {
    for (var _iterator4 = world.budgets[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
      let b = _step4.value;

      if (typeof categoryMap[b.categoryId] === 'undefined') {
        log.warn(`unexpected category id for a budget: ${b.categoryId}`);
      } else {
        b.categoryId = categoryMap[b.categoryId];
      }

      delete b.id;
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

  world.operations = world.operations || [];
  var _iteratorNormalCompletion5 = true;
  var _didIteratorError5 = false;
  var _iteratorError5 = undefined;

  try {
    for (var _iterator5 = world.operations[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
      let o = _step5.value;

      if (typeof o.categoryId !== 'undefined') {
        let cid = o.categoryId;

        if (typeof categoryMap[cid] === 'undefined') {
          log.warn(`unexpected category id for a transaction: ${cid}`);
        } else {
          o.categoryId = categoryMap[cid];
        }
      }

      o.accountId = accountMap[o.accountId]; // Strip away id.

      delete o.id; // Remove attachments, if there are any.

      delete o.attachments;
      delete o.binary;
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

  world.settings = world.settings || [];
  let settings = [];
  var _iteratorNormalCompletion6 = true;
  var _didIteratorError6 = false;
  var _iteratorError6 = undefined;

  try {
    for (var _iterator6 = world.settings[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
      let s = _step6.value;

      if (!_defaultSettings.default.has(s.key)) {
        log.warn(`Not exporting setting "${s.key}", it does not have a default value.`);
        continue;
      }

      if (_ghostSettings.ConfigGhostSettings.has(s.key)) {
        // Don't export ghost settings, since they're computed at runtime.
        continue;
      }

      delete s.id; // Properly save the default account id if it exists.

      if (s.key === 'default-account-id' && s.value !== _defaultSettings.default.get('default-account-id')) {
        let accountId = s.value;

        if (typeof accountMap[accountId] === 'undefined') {
          log.warn(`unexpected default account id: ${accountId}`);
          continue;
        } else {
          s.value = accountMap[accountId];
        }
      }

      settings.push(s);
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

  world.settings = settings;
  world.alerts = world.alerts || [];
  var _iteratorNormalCompletion7 = true;
  var _didIteratorError7 = false;
  var _iteratorError7 = undefined;

  try {
    for (var _iterator7 = world.alerts[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
      let a = _step7.value;
      a.accountId = accountMap[a.accountId];
      delete a.id;
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

  return world;
}

function obfuscatePasswords(string, passwords) {
  // Prevents the application of the regexp s//*******/g
  if (!passwords.size) {
    return string;
  }

  const regex = [...passwords].map(k => (0, _regexEscape.default)(k)).join('|'); // Always return a fixed width string

  return string.replace(new RegExp(`(${regex})`, 'gm'), '********');
}

function obfuscateKeywords(string, keywords) {
  // Prevents the application of the regexp s//*******/g
  if (!keywords.size) {
    return string;
  }

  const regex = [...keywords].map(k => (0, _regexEscape.default)(k)).join('|');
  return string.replace(new RegExp(`(${regex})`, 'gm'), (all, keyword) => keyword.substr(-3).padStart(keyword.length, '*'));
}