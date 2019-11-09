"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.checkHasAllFields = checkHasAllFields;
exports.checkAllowedFields = checkAllowedFields;
exports.checkExactFields = checkExactFields;
exports.checkAlert = checkAlert;
exports.checkBudget = checkBudget;

// Checks that the given object fields match all the names specified in
// allowedFieldNames. Returns an error if there's one, or nothing otherwise.
function checkHasAllFields(object, allowedFieldNames) {
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = allowedFieldNames[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      let name = _step.value;

      if (!object.hasOwnProperty(name)) {
        return `missing field ${name}`;
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
} // Checks that the given object fields belong to the list of allowedFieldNames.
// Returns an error if there's one, or nothing otherwise.


function checkAllowedFields(object, allowedFieldNames) {
  for (var _i = 0, _Object$keys = Object.keys(object); _i < _Object$keys.length; _i++) {
    let key = _Object$keys[_i];

    if (!allowedFieldNames.includes(key)) {
      return `unexpected property on object: ${key}`;
    }
  }
} // Checks that the fields in object exactly match those provided by
// allowedFieldNames. Returns an error if there's one, or nothing otherwise.


function checkExactFields(object, allowedFieldNames) {
  return checkHasAllFields(object, allowedFieldNames) || checkAllowedFields(object, allowedFieldNames);
}

function checkAlert(alert) {
  if (alert.type === 'report') {
    if (typeof alert.frequency !== 'string' || !['daily', 'weekly', 'monthly'].includes(alert.frequency)) {
      return 'invalid report parameters';
    }
  } else if (alert.type === 'balance' || alert.type === 'transaction') {
    if (typeof alert.limit !== 'number' || Number.isNaN(alert.limit) || typeof alert.order !== 'string' || !['gt', 'lt'].includes(alert.order)) {
      return 'invalid balance/transaction parameters';
    }
  } else {
    return 'invalid alert type';
  }

  return null;
}

function checkBudget(budget) {
  if (Number.isNaN(budget.year) || budget.year < 1) {
    return 'invalid budget year';
  }

  if (Number.isNaN(budget.month) || budget.month < 0 || budget.month > 11) {
    return 'invalid budget month';
  }

  if (Number.isNaN(budget.threshold)) {
    return 'invalid budget threshold';
  }

  return null;
}