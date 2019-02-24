"use strict";

var cozydb = _interopRequireWildcard(require("cozydb"));

var _helpers = require("../helpers");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

let log = (0, _helpers.makeLogger)('models/budget');
let Budget = cozydb.getModel('budget', {
  // Associated category id.
  categoryId: String,
  // Threshold used in the budget section, defined by the user.
  threshold: {
    type: Number,
    default: 0
  },
  // Year
  year: Number,
  // Month
  month: Number
});
Budget = (0, _helpers.promisifyModel)(Budget);
let request = (0, _helpers.promisify)(Budget.request.bind(Budget));
let olderCreate = Budget.create;

Budget.create =
/*#__PURE__*/
function () {
  var _ref = _asyncToGenerator(function* (userId, attributes) {
    (0, _helpers.assert)(userId === 0, 'Budget.create first arg must be the userId.');
    return yield olderCreate(attributes);
  });

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

let olderAll = Budget.all;

Budget.all =
/*#__PURE__*/
function () {
  var _ref2 = _asyncToGenerator(function* (userId) {
    (0, _helpers.assert)(userId === 0, 'Budget.all first arg must be the userId.');
    return yield olderAll();
  });

  return function (_x3) {
    return _ref2.apply(this, arguments);
  };
}();

let olderDestroy = Budget.destroy;

Budget.destroy =
/*#__PURE__*/
function () {
  var _ref3 = _asyncToGenerator(function* (userId, budgetId) {
    (0, _helpers.assert)(userId === 0, 'Budget.destroy first arg must be the userId.');
    return yield olderDestroy(budgetId);
  });

  return function (_x4, _x5) {
    return _ref3.apply(this, arguments);
  };
}();

Budget.byCategory =
/*#__PURE__*/
function () {
  var _byCategory = _asyncToGenerator(function* (userId, categoryId) {
    (0, _helpers.assert)(userId === 0, 'Budget.byCategory first arg must be the userId.');

    if (typeof categoryId !== 'string') {
      log.warn(`Budget.byCategory API misuse: ${categoryId}`);
    }

    let params = {
      key: categoryId
    };
    return yield request('allByCategory', params);
  });

  function byCategory(_x6, _x7) {
    return _byCategory.apply(this, arguments);
  }

  return byCategory;
}();

Budget.byYearAndMonth =
/*#__PURE__*/
function () {
  var _byYearAndMonth = _asyncToGenerator(function* (userId, year, month) {
    (0, _helpers.assert)(userId === 0, 'Budget.byYearAndMonth first arg must be the userId.');

    if (typeof year !== 'number') {
      log.warn('Budget.byYearAndMonth misuse: year must be a number');
    }

    if (typeof month !== 'number') {
      log.warn('Budget.byYearAndMonth misuse: month must be a number');
    }

    let params = {
      key: [year, month]
    };
    return yield request('allByYearMonth', params);
  });

  function byYearAndMonth(_x8, _x9, _x10) {
    return _byYearAndMonth.apply(this, arguments);
  }

  return byYearAndMonth;
}();

Budget.byCategoryAndYearAndMonth =
/*#__PURE__*/
function () {
  var _byCategoryAndYearAndMonth = _asyncToGenerator(function* (userId, categoryID, year, month) {
    (0, _helpers.assert)(userId === 0, 'Budget.byCategoryAndYearAndMonth first arg must be the userId.');

    if (typeof categoryID !== 'string') {
      log.warn('Budget.byCategoryAndYearAndMonth misuse: categoryId must be a string');
    }

    if (typeof year !== 'number') {
      log.warn('Budget.byCategoryAndYearAndMonth misuse: year must be a number');
    }

    if (typeof month !== 'number') {
      log.warn('Budget.byCategoryAndYearAndMonth misuse: month must be a number');
    }

    let params = {
      key: [categoryID, year, month]
    };
    let budget = yield request('byCategoryAndYearAndMonth', params);

    if (budget instanceof Array) {
      if (budget.length > 1) {
        log.warn('Budget.byCategoryAndYearAndMonth: there should be only one budget for a ' + 'category/month/year tuple');
      }

      budget = budget[0];
    }

    return budget;
  });

  function byCategoryAndYearAndMonth(_x11, _x12, _x13, _x14) {
    return _byCategoryAndYearAndMonth.apply(this, arguments);
  }

  return byCategoryAndYearAndMonth;
}();

let olderUpdateAttributes = Budget.updateAttributes;

Budget.update =
/*#__PURE__*/
function () {
  var _ref4 = _asyncToGenerator(function* (userId, budgetId, fields) {
    (0, _helpers.assert)(userId === 0, 'Budget.update first arg must be the userId.');
    return yield olderUpdateAttributes(budgetId, fields);
  });

  return function (_x15, _x16, _x17) {
    return _ref4.apply(this, arguments);
  };
}();

Budget.updateAttributes = function () {
  (0, _helpers.assert)(false, 'Budget.updateAttributes is deprecated. Please use Budget.update');
};

Budget.findAndUpdate =
/*#__PURE__*/
function () {
  var _findAndUpdate = _asyncToGenerator(function* (userId, categoryId, year, month, threshold) {
    (0, _helpers.assert)(userId === 0, 'Budget.findAndUpdate first arg must be the userId.');
    const budget = yield Budget.byCategoryAndYearAndMonth(userId, categoryId, year, month);
    return yield Budget.update(userId, budget.id, {
      threshold
    });
  });

  function findAndUpdate(_x18, _x19, _x20, _x21, _x22) {
    return _findAndUpdate.apply(this, arguments);
  }

  return findAndUpdate;
}();

Budget.destroyForCategory =
/*#__PURE__*/
function () {
  var _destroyForCategory = _asyncToGenerator(function* (userId, deletedCategoryId, replacementCategoryId) {
    (0, _helpers.assert)(userId === 0, 'Budget.destroyForCategory first arg must be the userId.');
    let budgets = yield Budget.byCategory(userId, deletedCategoryId);
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = budgets[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        let budget = _step.value;

        if (replacementCategoryId) {
          let replacementCategoryBudget = yield Budget.byCategoryAndYearAndMonth(userId, replacementCategoryId, budget.year, budget.month); // If there is no budget for the existing replacement category, don't actually delete
          // the current budget, just update its category with the new one.

          if (!replacementCategoryBudget) {
            yield Budget.update(userId, budget.id, {
              categoryId: replacementCategoryId
            }); // Do not delete the budget we just updated.

            continue;
          } else if (!replacementCategoryBudget.threshold && budget.threshold) {
            // If there is an existing budget without threshold, use the current threshold.
            yield Budget.update(userId, replacementCategoryBudget.id, {
              threshold: budget.threshold
            });
          }
        } // Destroy the existing budget.


        yield Budget.destroy(userId, budget.id);
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
  });

  function destroyForCategory(_x23, _x24, _x25) {
    return _destroyForCategory.apply(this, arguments);
  }

  return destroyForCategory;
}();

module.exports = Budget;