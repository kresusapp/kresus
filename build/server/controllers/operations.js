'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.create = exports.file = exports.merge = exports.update = undefined;

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var preload = function () {
    var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(varName, req, res, next, operationID) {
        var operation;
        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        _context.prev = 0;
                        _context.next = 3;
                        return _operation2.default.find(operationID);

                    case 3:
                        operation = _context.sent;

                        if (operation) {
                            _context.next = 6;
                            break;
                        }

                        throw new _helpers.KError('bank operation not found', 404);

                    case 6:
                        req.preloaded = req.preloaded || {};
                        req.preloaded[varName] = operation;
                        next();
                        _context.next = 14;
                        break;

                    case 11:
                        _context.prev = 11;
                        _context.t0 = _context['catch'](0);
                        return _context.abrupt('return', (0, _helpers.asyncErr)(res, _context.t0, 'when preloading an operation'));

                    case 14:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this, [[0, 11]]);
    }));

    return function preload(_x, _x2, _x3, _x4, _x5) {
        return _ref.apply(this, arguments);
    };
}();

var update = exports.update = function () {
    var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(req, res) {
        var attr, newCategory;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        _context2.prev = 0;
                        attr = req.body;

                        // We can only update the category id, operation type or custom label
                        // of an operation.

                        if (!(typeof attr.categoryId === 'undefined' && typeof attr.type === 'undefined' && typeof attr.customLabel === 'undefined')) {
                            _context2.next = 4;
                            break;
                        }

                        throw new _helpers.KError('Missing parameter', 400);

                    case 4:
                        if (!(typeof attr.categoryId !== 'undefined')) {
                            _context2.next = 17;
                            break;
                        }

                        if (!(attr.categoryId === '')) {
                            _context2.next = 9;
                            break;
                        }

                        delete req.preloaded.operation.categoryId;
                        _context2.next = 17;
                        break;

                    case 9:
                        _context2.next = 11;
                        return _category2.default.find(attr.categoryId);

                    case 11:
                        newCategory = _context2.sent;

                        if (newCategory) {
                            _context2.next = 16;
                            break;
                        }

                        throw new _helpers.KError('Category not found', 404);

                    case 16:
                        req.preloaded.operation.categoryId = attr.categoryId;

                    case 17:

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

                        _context2.next = 21;
                        return req.preloaded.operation.save();

                    case 21:
                        res.sendStatus(200);
                        _context2.next = 27;
                        break;

                    case 24:
                        _context2.prev = 24;
                        _context2.t0 = _context2['catch'](0);
                        return _context2.abrupt('return', (0, _helpers.asyncErr)(res, _context2.t0, 'when upadting attributes of operation'));

                    case 27:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, this, [[0, 24]]);
    }));

    return function update(_x6, _x7) {
        return _ref2.apply(this, arguments);
    };
}();

var merge = exports.merge = function () {
    var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(req, res) {
        var otherOp, op, needsSave;
        return _regenerator2.default.wrap(function _callee3$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        _context3.prev = 0;

                        // @operation is the one to keep, @otherOperation is the one to delete.
                        otherOp = req.preloaded.otherOperation;
                        op = req.preloaded.operation;

                        // Transfer various fields upon deletion

                        needsSave = op.mergeWith(otherOp);

                        if (!needsSave) {
                            _context3.next = 8;
                            break;
                        }

                        _context3.next = 7;
                        return op.save();

                    case 7:
                        op = _context3.sent;

                    case 8:
                        _context3.next = 10;
                        return otherOp.destroy();

                    case 10:
                        res.status(200).send(op);
                        _context3.next = 16;
                        break;

                    case 13:
                        _context3.prev = 13;
                        _context3.t0 = _context3['catch'](0);
                        return _context3.abrupt('return', (0, _helpers.asyncErr)(res, _context3.t0, 'when merging two operations'));

                    case 16:
                    case 'end':
                        return _context3.stop();
                }
            }
        }, _callee3, this, [[0, 13]]);
    }));

    return function merge(_x8, _x9) {
        return _ref3.apply(this, arguments);
    };
}();

var file = exports.file = function () {
    var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee5(req, res) {
        var _this = this;

        var _ret;

        return _regenerator2.default.wrap(function _callee5$(_context5) {
            while (1) {
                switch (_context5.prev = _context5.next) {
                    case 0:
                        _context5.prev = 0;
                        return _context5.delegateYield(_regenerator2.default.mark(function _callee4() {
                            var operationId, binaryPath, id, pwd, basic, options, operation, request;
                            return _regenerator2.default.wrap(function _callee4$(_context4) {
                                while (1) {
                                    switch (_context4.prev = _context4.next) {
                                        case 0:
                                            if (!(req.preloaded.operation.binary && req.preloaded.operation.binary.fileName === '__dev_example_file')) {
                                                _context4.next = 4;
                                                break;
                                            }

                                            res.set('Content-Type', 'text/plain');
                                            res.status(200).send('This is an example file for developer mode.');
                                            return _context4.abrupt('return', {
                                                v: true
                                            });

                                        case 4:
                                            operationId = req.preloaded.operation.id;
                                            binaryPath = '/data/' + operationId + '/binaries/file';
                                            id = process.env.NAME;
                                            pwd = process.env.TOKEN;
                                            basic = id + ':' + pwd;

                                            basic = 'Basic ' + new Buffer(basic).toString('base64');

                                            options = {
                                                host: 'localhost',
                                                port: 9101,
                                                path: binaryPath,
                                                headers: {
                                                    Authorization: basic
                                                }
                                            };
                                            _context4.next = 13;
                                            return _operation2.default.find(operationId);

                                        case 13:
                                            operation = _context4.sent;
                                            request = _http2.default.get(options, function (stream) {
                                                if (stream.statusCode === 200) {
                                                    var fileMime = operation.binary.fileMime || 'application/pdf';
                                                    res.set('Content-Type', fileMime);
                                                    res.on('close', request.abort.bind(request));
                                                    stream.pipe(res);
                                                } else if (stream.statusCode === 404) {
                                                    throw new _helpers.KError('File not found', 404);
                                                } else {
                                                    throw new _helpers.KError('Unknown error', stream.statusCode);
                                                }
                                            });

                                        case 15:
                                        case 'end':
                                            return _context4.stop();
                                    }
                                }
                            }, _callee4, _this);
                        })(), 't0', 2);

                    case 2:
                        _ret = _context5.t0;

                        if (!((typeof _ret === 'undefined' ? 'undefined' : (0, _typeof3.default)(_ret)) === "object")) {
                            _context5.next = 5;
                            break;
                        }

                        return _context5.abrupt('return', _ret.v);

                    case 5:
                        _context5.next = 10;
                        break;

                    case 7:
                        _context5.prev = 7;
                        _context5.t1 = _context5['catch'](0);
                        return _context5.abrupt('return', (0, _helpers.asyncErr)(res, _context5.t1, "when getting an operation's attachment"));

                    case 10:
                    case 'end':
                        return _context5.stop();
                }
            }
        }, _callee5, this, [[0, 7]]);
    }));

    return function file(_x10, _x11) {
        return _ref4.apply(this, arguments);
    };
}();

// Create a new operation


var create = exports.create = function () {
    var _ref5 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee6(req, res) {
        var operation, op;
        return _regenerator2.default.wrap(function _callee6$(_context6) {
            while (1) {
                switch (_context6.prev = _context6.next) {
                    case 0:
                        _context6.prev = 0;
                        operation = req.body;

                        if (_operation2.default.isOperation(operation)) {
                            _context6.next = 4;
                            break;
                        }

                        throw new _helpers.KError('Not an operation', 400);

                    case 4:
                        // We fill the missing fields
                        operation.raw = operation.title;
                        operation.dateImport = (0, _moment2.default)().format('YYYY-MM-DDTHH:mm:ss.000Z');
                        operation.createdByUser = true;
                        _context6.next = 9;
                        return _operation2.default.create(operation);

                    case 9:
                        op = _context6.sent;

                        res.status(201).send(op);
                        _context6.next = 16;
                        break;

                    case 13:
                        _context6.prev = 13;
                        _context6.t0 = _context6['catch'](0);
                        return _context6.abrupt('return', (0, _helpers.asyncErr)(res, _context6.t0, 'when creating operation for a bank account'));

                    case 16:
                    case 'end':
                        return _context6.stop();
                }
            }
        }, _callee6, this, [[0, 13]]);
    }));

    return function create(_x12, _x13) {
        return _ref5.apply(this, arguments);
    };
}();

// Delete an operation


exports.preloadOperation = preloadOperation;
exports.preloadOtherOperation = preloadOtherOperation;

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _category = require('../models/category');

var _category2 = _interopRequireDefault(_category);

var _operation = require('../models/operation');

var _operation2 = _interopRequireDefault(_operation);

var _operationtype = require('../models/operationtype');

var _operationtype2 = _interopRequireDefault(_operationtype);

var _helpers = require('../helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function preloadOperation(req, res, next, operationID) {
    preload('operation', req, res, next, operationID);
}

function preloadOtherOperation(req, res, next, otherOperationID) {
    preload('otherOperation', req, res, next, otherOperationID);
}

module.exports.destroy = function () {
    var _ref6 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee7(req, res) {
        var op;
        return _regenerator2.default.wrap(function _callee7$(_context7) {
            while (1) {
                switch (_context7.prev = _context7.next) {
                    case 0:
                        _context7.prev = 0;
                        op = req.preloaded.operation;
                        _context7.next = 4;
                        return op.destroy();

                    case 4:
                        res.sendStatus(204);
                        _context7.next = 10;
                        break;

                    case 7:
                        _context7.prev = 7;
                        _context7.t0 = _context7['catch'](0);
                        return _context7.abrupt('return', (0, _helpers.asyncErr)(res, _context7.t0, 'when deleting operation'));

                    case 10:
                    case 'end':
                        return _context7.stop();
                }
            }
        }, _callee7, this, [[0, 7]]);
    }));

    return function (_x14, _x15) {
        return _ref6.apply(this, arguments);
    };
}();