"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.create = create;
exports.preloadCategory = preloadCategory;
exports.update = update;
exports.destroy = destroy;

var _budgets = _interopRequireDefault(require("../../models/budgets"));

var _categories = _interopRequireDefault(require("../../models/categories"));

var _transactions = _interopRequireDefault(require("../../models/transactions"));

var _helpers = require("../../helpers");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

let log = (0, _helpers.makeLogger)('controllers/categories');

function create(_x, _x2) {
  return _create.apply(this, arguments);
}

function _create() {
  _create = _asyncToGenerator(function* (req, res) {
    try {
      let userId = req.user.id;
      let cat = req.body; // Missing parameters

      if (typeof cat.title === 'undefined') {
        throw new _helpers.KError('Missing category title', 400);
      }

      if (typeof cat.color === 'undefined') {
        throw new _helpers.KError('Missing category color', 400);
      }

      if (typeof cat.parentId !== 'undefined') {
        let parent = yield _categories.default.find(userId, cat.parentId);

        if (!parent) {
          throw new _helpers.KError(`Category ${cat.parentId} not found`, 404);
        }
      }

      let created = yield _categories.default.create(userId, cat);
      res.status(200).json(created);
    } catch (err) {
      return (0, _helpers.asyncErr)(res, err, 'when creating category');
    }
  });
  return _create.apply(this, arguments);
}

function preloadCategory(_x3, _x4, _x5, _x6) {
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

function update(_x7, _x8) {
  return _update.apply(this, arguments);
}

function _update() {
  _update = _asyncToGenerator(function* (req, res) {
    try {
      let userId = req.user.id;
      let params = req.body; // Missing parameters

      if (typeof params.title === 'undefined') {
        throw new _helpers.KError('Missing title parameter', 400);
      }

      if (typeof params.color === 'undefined') {
        throw new _helpers.KError('Missing color parameter', 400);
      }

      let category = req.preloaded.category;
      let newCat = yield _categories.default.update(userId, category.id, params);
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
      let replaceby = req.body.replaceByCategoryId;

      if (typeof replaceby === 'undefined') {
        throw new _helpers.KError('Missing parameter replaceby', 400);
      }

      let former = req.preloaded.category;
      let categoryId;

      if (replaceby.toString() !== '') {
        log.debug(`Replacing category ${former.id} by ${replaceby}...`);
        let categoryToReplaceBy = yield _categories.default.find(userId, replaceby);

        if (!categoryToReplaceBy) {
          throw new _helpers.KError('Replacement category not found', 404);
        }

        categoryId = replaceby;
      } else {
        log.debug('No replacement category, replacing by None.');
        categoryId = null;
      }

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