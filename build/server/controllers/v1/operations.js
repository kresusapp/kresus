'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.destroy = exports.create = exports.merge = exports.update = undefined;

let preload = (() => {
    var _ref = _asyncToGenerator(function* (varName, req, res, next, operationID) {
        try {
            let operation = yield _operation2.default.find(operationID);
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

    return function preload(_x, _x2, _x3, _x4, _x5) {
        return _ref.apply(this, arguments);
    };
})();

let update = exports.update = (() => {
    var _ref2 = _asyncToGenerator(function* (req, res) {
        try {
            let attr = req.body;

            // We can only update the category id, operation type, custom label or budget date
            // of an operation.
            if (typeof attr.categoryId === 'undefined' && typeof attr.type === 'undefined' && typeof attr.customLabel === 'undefined' && typeof attr.budgetDate === 'undefined') {
                throw new _helpers.KError('Missing parameter', 400);
            }

            if (typeof attr.categoryId !== 'undefined') {
                if (attr.categoryId === '') {
                    delete req.preloaded.operation.categoryId;
                } else {
                    let newCategory = yield _category2.default.find(attr.categoryId);
                    if (!newCategory) {
                        throw new _helpers.KError('Category not found', 404);
                    } else {
                        req.preloaded.operation.categoryId = attr.categoryId;
                    }
                }
            }

            if (typeof attr.type !== 'undefined') {
                if (_operationtype2.default.isKnown(attr.type)) {
                    req.preloaded.operation.type = attr.type;
                } else {
                    req.preloaded.operation.type = _helpers.UNKNOWN_OPERATION_TYPE;
                }
            }

            if (typeof attr.customLabel !== 'undefined') {
                if (attr.customLabel === '') {
                    delete req.preloaded.operation.customLabel;
                } else {
                    req.preloaded.operation.customLabel = attr.customLabel;
                }
            }

            if (typeof attr.budgetDate !== 'undefined') {
                if (attr.budgetDate === null) {
                    req.preloaded.operation.budgetDate = null;
                } else {
                    req.preloaded.operation.budgetDate = new Date(attr.budgetDate);
                }
            }

            yield req.preloaded.operation.save();
            res.status(200).end();
        } catch (err) {
            return (0, _helpers.asyncErr)(res, err, 'when updating attributes of operation');
        }
    });

    return function update(_x6, _x7) {
        return _ref2.apply(this, arguments);
    };
})();

let merge = exports.merge = (() => {
    var _ref3 = _asyncToGenerator(function* (req, res) {
        try {
            // @operation is the one to keep, @otherOperation is the one to delete.
            let otherOp = req.preloaded.otherOperation;
            let op = req.preloaded.operation;

            // Transfer various fields upon deletion
            let needsSave = op.mergeWith(otherOp);

            if (needsSave) {
                op = yield op.save();
            }
            yield otherOp.destroy();
            res.status(200).json(op);
        } catch (err) {
            return (0, _helpers.asyncErr)(res, err, 'when merging two operations');
        }
    });

    return function merge(_x8, _x9) {
        return _ref3.apply(this, arguments);
    };
})();

// Create a new operation


let create = exports.create = (() => {
    var _ref4 = _asyncToGenerator(function* (req, res) {
        try {
            let operation = req.body;
            if (!_operation2.default.isOperation(operation)) {
                throw new _helpers.KError('Not an operation', 400);
            }
            // We fill the missing fields
            operation.raw = operation.title;
            operation.customLabel = operation.title;
            operation.dateImport = (0, _moment2.default)().format('YYYY-MM-DDTHH:mm:ss.000Z');
            operation.createdByUser = true;
            let op = yield _operation2.default.create(operation);
            res.status(201).json(op);
        } catch (err) {
            return (0, _helpers.asyncErr)(res, err, 'when creating operation for a bank account');
        }
    });

    return function create(_x10, _x11) {
        return _ref4.apply(this, arguments);
    };
})();

// Delete an operation


let destroy = exports.destroy = (() => {
    var _ref5 = _asyncToGenerator(function* (req, res) {
        try {
            let op = req.preloaded.operation;
            yield op.destroy();
            res.status(204).end();
        } catch (err) {
            return (0, _helpers.asyncErr)(res, err, 'when deleting operation');
        }
    });

    return function destroy(_x12, _x13) {
        return _ref5.apply(this, arguments);
    };
})();

exports.preloadOperation = preloadOperation;
exports.preloadOtherOperation = preloadOtherOperation;

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _category = require('../../models/category');

var _category2 = _interopRequireDefault(_category);

var _operation = require('../../models/operation');

var _operation2 = _interopRequireDefault(_operation);

var _operationtype = require('../../models/operationtype');

var _operationtype2 = _interopRequireDefault(_operationtype);

var _helpers = require('../../helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function preloadOperation(req, res, next, operationID) {
    preload('operation', req, res, next, operationID);
}

function preloadOtherOperation(req, res, next, otherOperationID) {
    preload('otherOperation', req, res, next, otherOperationID);
}