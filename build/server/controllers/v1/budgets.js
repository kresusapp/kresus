"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getByYearAndMonth = getByYearAndMonth;
exports.update = update;

var _budgets = _interopRequireDefault(require("../../models/budgets"));

var _categories = _interopRequireDefault(require("../../models/categories"));

var _helpers = require("../../helpers");

var _validators = require("../../shared/validators");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function createBudget(_x, _x2) {
  return _createBudget.apply(this, arguments);
}

function _createBudget() {
  _createBudget = _asyncToGenerator(function* (userId, budget) {
    // Missing parameters
    if (typeof budget.categoryId !== 'undefined') {
      let categoryExists = yield _categories.default.exists(userId, budget.categoryId);

      if (!categoryExists) {
        throw new _helpers.KError(`Category ${budget.categoryId} not found`, 404);
      }
    }

    const error = (0, _validators.checkBudget)(budget);

    if (error) {
      throw new _helpers.KError(error, 400);
    }

    return yield _budgets.default.create(userId, budget);
  });
  return _createBudget.apply(this, arguments);
}

function getByYearAndMonth(_x3, _x4) {
  return _getByYearAndMonth.apply(this, arguments);
}

function _getByYearAndMonth() {
  _getByYearAndMonth = _asyncToGenerator(function* (req, res) {
    try {
      let userId = req.user.id;
      let _req$params = req.params,
          year = _req$params.year,
          month = _req$params.month;
      year = Number.parseInt(year, 10);

      if (Number.isNaN(year)) {
        throw new _helpers.KError('Invalid year parameter', 400);
      }

      month = Number.parseInt(month, 10);

      if (Number.isNaN(month) || month < 0 || month > 11) {
        throw new _helpers.KError('Invalid month parameter', 400);
      }

      let budgets = yield _budgets.default.byYearAndMonth(userId, year, month); // Ensure there is a budget for each category.

      let categories = yield _categories.default.all(userId);
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = categories[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          let cat = _step.value;

          if (!budgets.find(b => b.categoryId === cat.id)) {
            // Retrieve the last threshold used for this category instead of defaulting to 0.
            // "last" here means "last in time" not last entered (TODO: fix it when we'll be
            // able to sort by creation/update order).
            let sameCategoryBudgets = yield _budgets.default.byCategory(userId, cat.id);
            let currentYear = 0;
            let currentMonth = 0;
            let threshold = 0;
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
              for (var _iterator2 = sameCategoryBudgets[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                let b = _step2.value;

                if (b.year > currentYear || b.year === currentYear && b.month > currentMonth) {
                  currentYear = b.year;
                  currentMonth = b.month;
                  threshold = b.threshold;
                }
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

            let budget = yield createBudget(userId, {
              year,
              month,
              categoryId: cat.id,
              threshold
            });
            budgets.push(budget);
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

      res.status(200).json({
        year,
        month,
        budgets
      });
    } catch (err) {
      return (0, _helpers.asyncErr)(res, err, 'when loading budgets by year/month');
    }
  });
  return _getByYearAndMonth.apply(this, arguments);
}

function update(_x5, _x6) {
  return _update.apply(this, arguments);
}

function _update() {
  _update = _asyncToGenerator(function* (req, res) {
    try {
      let userId = req.user.id;
      let params = req.body;
      let _req$params2 = req.params,
          year = _req$params2.year,
          month = _req$params2.month,
          categoryId = _req$params2.budgetCatId;
      year = Number.parseInt(year, 10);
      month = Number.parseInt(month, 10);
      const error = (0, _validators.checkBudget)({
        year,
        month,
        threshold: params.threshold
      });

      if (error) {
        throw new _helpers.KError(error, 400);
      }

      const newBudget = _budgets.default.findAndUpdate(userId, categoryId, year, month, params.threshold);

      res.status(200).json(newBudget);
    } catch (err) {
      return (0, _helpers.asyncErr)(res, err, 'when updating a budget');
    }
  });
  return _update.apply(this, arguments);
}