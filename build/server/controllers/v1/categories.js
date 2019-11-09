"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.preloadCategory = preloadCategory;
exports.create = create;
exports.update = update;
exports.destroy = destroy;

var _budgets = _interopRequireDefault(require("../../models/budgets"));

var _categories = _interopRequireDefault(require("../../models/categories"));

var _transactions = _interopRequireDefault(require("../../models/transactions"));

var _helpers = require("../../helpers");

var _validators = require("../../shared/validators");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

let log = (0, _helpers.makeLogger)('controllers/categories');

function preloadCategory(_x, _x2, _x3, _x4) {
  return _preloadCategory.apply(this, arguments);
}

function _preloadCategory() {
  _preloadCategory = _asyncToGenerator(function* (req, res, next, id) {
    try {
      let userId = req.user.id;
      let category;
      category = yield _categories.default.find(userId, id);

      if (!category) {
        throw new _helpers.KError('Category not found', 404);
      }

      req.preloaded = {
        category
      };
      return next();
    } catch (err) {
      return (0, _helpers.asyncErr)(res, err, 'when preloading a category');
    }
  });
  return _preloadCategory.apply(this, arguments);
}

function create(_x5, _x6) {
  return _create.apply(this, arguments);
}

function _create() {
  _create = _asyncToGenerator(function* (req, res) {
    try {
      let userId = req.user.id;
      let error = (0, _validators.checkExactFields)(req.body, ['label', 'color']);

      if (error) {
        throw new _helpers.KError(`when creating a category: ${error}`, 400);
      }

      let created = yield _categories.default.create(userId, req.body);
      res.status(200).json(created);
    } catch (err) {
      return (0, _helpers.asyncErr)(res, err, 'when creating category');
    }
  });
  return _create.apply(this, arguments);
}

function update(_x7, _x8) {
  return _update.apply(this, arguments);
}

function _update() {
  _update = _asyncToGenerator(function* (req, res) {
    try {
      let userId = req.user.id;
      let error = (0, _validators.checkAllowedFields)(req.body, ['label', 'color']);

      if (error) {
        throw new _helpers.KError(`when updating a category: ${error}`, 400);
      }

      let category = req.preloaded.category;
      let newCat = yield _categories.default.update(userId, category.id, req.body);
      res.status(200).json(newCat);
    } catch (err) {
      return (0, _helpers.asyncErr)(res, err, 'when updating a category');
    }
  });
  return _update.apply(this, arguments);
}

function destroy(_x9, _x10) {
  return _destroy.apply(this, arguments);
}

function _destroy() {
  _destroy = _asyncToGenerator(function* (req, res) {
    try {
      let userId = req.user.id;
      let error = (0, _validators.checkExactFields)(req.body, ['replaceByCategoryId']);

      if (error) {
        throw new _helpers.KError('Missing parameter replaceByCategoryId', 400);
      }

      let former = req.preloaded.category;
      let replaceBy = req.body.replaceByCategoryId;

      if (replaceBy !== null) {
        log.debug(`Replacing category ${former.id} by ${replaceBy}...`);
        let categoryToReplaceBy = yield _categories.default.find(userId, replaceBy);

        if (!categoryToReplaceBy) {
          throw new _helpers.KError('Replacement category not found', 404);
        }
      } else {
        log.debug('No replacement category, replacing by the None category.');
      }

      let categoryId = replaceBy;
      let operations = yield _transactions.default.byCategory(userId, former.id);
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = operations[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          let op = _step.value;
          yield _transactions.default.update(userId, op.id, {
            categoryId
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

      yield _budgets.default.destroyForCategory(userId, former.id, categoryId);
      yield _categories.default.destroy(userId, former.id);
      res.status(200).end();
    } catch (err) {
      return (0, _helpers.asyncErr)(res, err, 'when deleting a category');
    }
  });
  return _destroy.apply(this, arguments);
}