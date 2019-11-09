"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.preloadOperation = preloadOperation;
exports.preloadOtherOperation = preloadOtherOperation;
exports.update = update;
exports.merge = merge;
exports.create = create;
exports.destroy = destroy;

var _moment = _interopRequireDefault(require("moment"));

var _categories = _interopRequireDefault(require("../../models/categories"));

var _transactions = _interopRequireDefault(require("../../models/transactions"));

var _transactionTypes = require("../../lib/transaction-types");

var _helpers = require("../../helpers");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function preload(_x, _x2, _x3, _x4, _x5) {
  return _preload.apply(this, arguments);
}

function _preload() {
  _preload = _asyncToGenerator(function* (varName, req, res, next, operationID) {
    let userId = req.user.id;

    try {
      let operation = yield _transactions.default.find(userId, operationID);

      if (!operation) {
        throw new _helpers.KError('bank operation not found', 404);
      }

      req.preloaded = req.preloaded || {};
      req.preloaded[varName] = operation;
      return next();
    } catch (err) {
      return (0, _helpers.asyncErr)(res, err, 'when preloading an operation');
    }
  });
  return _preload.apply(this, arguments);
}

function preloadOperation(req, res, next, operationID) {
  preload('operation', req, res, next, operationID);
}

function preloadOtherOperation(req, res, next, otherOperationID) {
  preload('otherOperation', req, res, next, otherOperationID);
}

function update(_x6, _x7) {
  return _update.apply(this, arguments);
}

function _update() {
  _update = _asyncToGenerator(function* (req, res) {
    try {
      let userId = req.user.id;
      let attr = req.body; // We can only update the category id, operation type, custom label or budget date
      // of an operation.

      if (typeof attr.categoryId === 'undefined' && typeof attr.type === 'undefined' && typeof attr.customLabel === 'undefined' && typeof attr.budgetDate === 'undefined') {
        throw new _helpers.KError('Missing parameter', 400);
      }

      let opUpdate = {};

      if (typeof attr.categoryId !== 'undefined') {
        if (attr.categoryId !== null) {
          let found = yield _categories.default.find(userId, attr.categoryId);

          if (!found) {
            throw new _helpers.KError('Category not found', 404);
          }
        }

        opUpdate.categoryId = attr.categoryId;
      }

      if (typeof attr.type !== 'undefined') {
        if ((0, _transactionTypes.isKnownTransactionTypeName)(attr.type)) {
          opUpdate.type = attr.type;
        } else {
          opUpdate.type = _helpers.UNKNOWN_OPERATION_TYPE;
        }
      }

      if (typeof attr.customLabel !== 'undefined') {
        if (attr.customLabel === '') {
          opUpdate.customLabel = null;
        } else {
          opUpdate.customLabel = attr.customLabel;
        }
      }

      if (typeof attr.budgetDate !== 'undefined') {
        if (attr.budgetDate === null) {
          opUpdate.budgetDate = null;
        } else {
          opUpdate.budgetDate = new Date(attr.budgetDate);
        }
      }

      yield _transactions.default.update(userId, req.preloaded.operation.id, opUpdate);
      res.status(200).end();
    } catch (err) {
      return (0, _helpers.asyncErr)(res, err, 'when updating attributes of operation');
    }
  });
  return _update.apply(this, arguments);
}

function merge(_x8, _x9) {
  return _merge.apply(this, arguments);
} // Create a new operation


function _merge() {
  _merge = _asyncToGenerator(function* (req, res) {
    try {
      let userId = req.user.id; // @operation is the one to keep, @otherOperation is the one to delete.

      let otherOp = req.preloaded.otherOperation;
      let op = req.preloaded.operation; // Transfer various fields upon deletion

      let newFields = op.mergeWith(otherOp);
      op = yield _transactions.default.update(userId, op.id, newFields);
      yield _transactions.default.destroy(userId, otherOp.id);
      res.status(200).json(op);
    } catch (err) {
      return (0, _helpers.asyncErr)(res, err, 'when merging two operations');
    }
  });
  return _merge.apply(this, arguments);
}

function create(_x10, _x11) {
  return _create.apply(this, arguments);
} // Delete an operation


function _create() {
  _create = _asyncToGenerator(function* (req, res) {
    try {
      let userId = req.user.id;
      let operation = req.body;

      if (!_transactions.default.isOperation(operation)) {
        throw new _helpers.KError('Not an operation', 400);
      }

      if (typeof operation.categoryId !== 'undefined' && operation.categoryId !== null) {
        let found = yield _categories.default.find(userId, operation.categoryId);

        if (!found) {
          throw new _helpers.KError('Category not found', 404);
        }
      } // We fill the missing fields


      operation.rawLabel = operation.label;
      operation.customLabel = operation.label;
      operation.importDate = (0, _moment.default)().format('YYYY-MM-DDTHH:mm:ss.000Z');
      operation.createdByUser = true;
      let op = yield _transactions.default.create(userId, operation);
      res.status(201).json(op);
    } catch (err) {
      return (0, _helpers.asyncErr)(res, err, 'when creating operation for a bank account');
    }
  });
  return _create.apply(this, arguments);
}

function destroy(_x12, _x13) {
  return _destroy.apply(this, arguments);
}

function _destroy() {
  _destroy = _asyncToGenerator(function* (req, res) {
    try {
      let userId = req.user.id;
      let op = req.preloaded.operation;
      yield _transactions.default.destroy(userId, op.id);
      res.status(204).end();
    } catch (err) {
      return (0, _helpers.asyncErr)(res, err, 'when deleting operation');
    }
  });
  return _destroy.apply(this, arguments);
}