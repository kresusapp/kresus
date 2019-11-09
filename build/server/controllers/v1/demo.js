"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setupDemoMode = setupDemoMode;
exports.enable = enable;
exports.disable = disable;

var _accesses = _interopRequireDefault(require("../../models/accesses"));

var _budgets = _interopRequireDefault(require("../../models/budgets"));

var _categories = _interopRequireDefault(require("../../models/categories"));

var _settings = _interopRequireDefault(require("../../models/settings"));

var _helpers = require("../../helpers");

var _settings2 = require("./settings");

var _accesses2 = require("./accesses");

var _defaultCategories = _interopRequireDefault(require("../../shared/default-categories.json"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function setupDemoMode(_x) {
  return _setupDemoMode.apply(this, arguments);
}

function _setupDemoMode() {
  _setupDemoMode = _asyncToGenerator(function* (userId) {
    // Create default categories.
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = _defaultCategories.default[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        let category = _step.value;
        yield _categories.default.create(userId, {
          label: (0, _helpers.translate)(category.label),
          color: category.color
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

    const data = yield (0, _accesses2.createAndRetrieveData)(userId, {
      vendorId: 'demo',
      login: 'mylogin',
      password: 'couldnotcareless',
      customLabel: 'Demo bank'
    }); // Set the demo mode to true only if other operations succeeded.

    const isEnabled = yield _settings.default.findOrCreateByKey(userId, 'demo-mode', 'true');

    if (isEnabled.value !== 'true') {
      // The setting already existed and has the wrong value.
      yield _settings.default.updateByKey(userId, 'demo-mode', 'true');
    }

    return data;
  });
  return _setupDemoMode.apply(this, arguments);
}

function enable(_x2, _x3) {
  return _enable.apply(this, arguments);
}

function _enable() {
  _enable = _asyncToGenerator(function* (req, res) {
    try {
      let userId = req.user.id;
      let isEnabled = yield (0, _settings2.isDemoEnabled)(userId);

      if (isEnabled) {
        throw new _helpers.KError('Demo mode is already enabled, not enabling it.', 400);
      }

      const data = yield setupDemoMode(userId);
      res.status(201).json(data);
    } catch (err) {
      return (0, _helpers.asyncErr)(res, err, 'when enabling demo mode');
    }
  });
  return _enable.apply(this, arguments);
}

function disable(_x4, _x5) {
  return _disable.apply(this, arguments);
}

function _disable() {
  _disable = _asyncToGenerator(function* (req, res) {
    try {
      let userId = req.user.id;

      if ((0, _settings2.isDemoForced)()) {
        throw new _helpers.KError('Demo mode is forced at the server level, not disabling it.', 400);
      }

      const isEnabled = yield (0, _settings2.isDemoEnabled)(userId);

      if (!isEnabled) {
        throw new _helpers.KError('Demo mode was not enabled, not disabling it.', 400);
      }

      const accesses = yield _accesses.default.all(userId);
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = accesses[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          let acc = _step2.value;
          yield (0, _accesses2.destroyWithData)(userId, acc);
        } // Delete categories and associated budgets.

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

      const categories = yield _categories.default.all(userId);
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = categories[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          let cat = _step3.value;
          yield _budgets.default.destroyForCategory(userId, cat.id
          /* no replacement category */
          );
          yield _categories.default.destroy(userId, cat.id);
        } // Only reset the setting value if all the destroy operations
        // succeeded.

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

      yield _settings.default.updateByKey(userId, 'demo-mode', 'false');
      res.status(200).end();
    } catch (err) {
      return (0, _helpers.asyncErr)(res, err, 'when disabling demo mode');
    }
  });
  return _disable.apply(this, arguments);
}