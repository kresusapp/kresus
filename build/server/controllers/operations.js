'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.create = exports.file = exports.merge = exports.update = undefined;
exports.preloadOperation = preloadOperation;
exports.preloadOtherOperation = preloadOtherOperation;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _category = require('../models/category');

var _category2 = _interopRequireDefault(_category);

var _operation2 = require('../models/operation');

var _operation3 = _interopRequireDefault(_operation2);

var _operationtype = require('../models/operationtype');

var _operationtype2 = _interopRequireDefault(_operationtype);

var _helpers = require('../helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var preload = function () {
    var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(varName, req, res, next, operationID) {
        var operation;
        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        _context.prev = 0;
                        _context.next = 3;
                        return _operation3.default.find(operationID);

                    case 3:
                        operation = _context.sent;

                        if (operation) {
                            _context.next = 6;
                            break;
                        }

                        throw { status: 404, message: 'bank operation not found' };

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
        return ref.apply(this, arguments);
    };
}();

function preloadOperation(req, res, next, operationID) {
    preload('operation', req, res, next, operationID);
}

function preloadOtherOperation(req, res, next, otherOperationID) {
    preload('otherOperation', req, res, next, otherOperationID);
}

var update = exports.update = function () {
    var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(req, res) {
        var attr, newCategory, newType;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        attr = req.body;

                        // We can only update the category id, operation type or custom label of an
                        // operation.

                        if (!(typeof attr.categoryId === 'undefined' && typeof attr.operationTypeID === 'undefined' && typeof attr.customLabel === 'undefined')) {
                            _context2.next = 3;
                            break;
                        }

                        return _context2.abrupt('return', (0, _helpers.sendErr)(res, 'missing parameter', 400, 'Missing parameter'));

                    case 3:
                        _context2.prev = 3;

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

                        throw {
                            status: 404,
                            message: 'Category not found when updating an operation'
                        };

                    case 16:
                        req.preloaded.operation.categoryId = attr.categoryId;

                    case 17:
                        if (!(typeof attr.operationTypeID !== 'undefined')) {
                            _context2.next = 26;
                            break;
                        }

                        _context2.next = 20;
                        return _operationtype2.default.find(attr.operationTypeID);

                    case 20:
                        newType = _context2.sent;

                        if (newType) {
                            _context2.next = 25;
                            break;
                        }

                        throw {
                            status: 404,
                            message: 'Type not found when updating an operation'
                        };

                    case 25:
                        req.preloaded.operation.operationTypeID = attr.operationTypeID;

                    case 26:

                        if (typeof attr.customLabel !== 'undefined') {
                            if (attr.customLabel === '') {
                                delete req.preloaded.operation.customLabel;
                            } else {
                                req.preloaded.operation.customLabel = attr.customLabel;
                            }
                        }

                        _context2.next = 29;
                        return req.preloaded.operation.save();

                    case 29:
                        res.sendStatus(200);
                        _context2.next = 35;
                        break;

                    case 32:
                        _context2.prev = 32;
                        _context2.t0 = _context2['catch'](3);
                        return _context2.abrupt('return', (0, _helpers.asyncErr)(res, _context2.t0, 'when upadting attributes of operation'));

                    case 35:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, this, [[3, 32]]);
    }));
    return function update(_x6, _x7) {
        return ref.apply(this, arguments);
    };
}();

var merge = exports.merge = function () {
    var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(req, res) {
        var otherOp, op, needsSave;
        return _regenerator2.default.wrap(function _callee3$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:

                        // @operation is the one to keep, @otherOperation is the one to delete.
                        otherOp = req.preloaded.otherOperation;
                        op = req.preloaded.operation;

                        // Transfer various fields upon deletion

                        needsSave = op.mergeWith(otherOp);
                        _context3.prev = 3;

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
                        _context3.t0 = _context3['catch'](3);
                        return _context3.abrupt('return', (0, _helpers.asyncErr)(res, _context3.t0, 'when merging two operations'));

                    case 16:
                    case 'end':
                        return _context3.stop();
                }
            }
        }, _callee3, this, [[3, 13]]);
    }));
    return function merge(_x8, _x9) {
        return ref.apply(this, arguments);
    };
}();

var file = exports.file = function () {
    var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee5(req, res) {
        var _this = this;

        var operationId, binaryPath, id, pwd, basic, options;
        return _regenerator2.default.wrap(function _callee5$(_context5) {
            while (1) {
                switch (_context5.prev = _context5.next) {
                    case 0:
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
                        _context5.prev = 7;
                        return _context5.delegateYield(_regenerator2.default.mark(function _callee4() {
                            var operation, request;
                            return _regenerator2.default.wrap(function _callee4$(_context4) {
                                while (1) {
                                    switch (_context4.prev = _context4.next) {
                                        case 0:
                                            _context4.next = 2;
                                            return _operation3.default.find(operationId);

                                        case 2:
                                            operation = _context4.sent;
                                            request = _http2.default.get(options, function (stream) {
                                                if (stream.statusCode === 200) {
                                                    var fileMime = operation.binary.fileMime || 'application/pdf';
                                                    res.set('Content-Type', fileMime);
                                                    res.on('close', request.abort.bind(request));
                                                    stream.pipe(res);
                                                } else if (stream.statusCode === 404) {
                                                    res.status(404).send('File not found');
                                                } else {
                                                    res.sendStatus(stream.statusCode);
                                                }
                                            });

                                        case 4:
                                        case 'end':
                                            return _context4.stop();
                                    }
                                }
                            }, _callee4, _this);
                        })(), 't0', 9);

                    case 9:
                        _context5.next = 14;
                        break;

                    case 11:
                        _context5.prev = 11;
                        _context5.t1 = _context5['catch'](7);
                        return _context5.abrupt('return', (0, _helpers.asyncErr)(res, _context5.t1, "when getting an operation's attachment"));

                    case 14:
                    case 'end':
                        return _context5.stop();
                }
            }
        }, _callee5, this, [[7, 11]]);
    }));
    return function file(_x10, _x11) {
        return ref.apply(this, arguments);
    };
}();

// Create a new operation

var create = exports.create = function () {
    var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee6(req, res) {
        var _operation, op;

        return _regenerator2.default.wrap(function _callee6$(_context6) {
            while (1) {
                switch (_context6.prev = _context6.next) {
                    case 0:
                        _context6.prev = 0;
                        _operation = req.body;

                        if (_operation3.default.isOperation(_operation)) {
                            _context6.next = 4;
                            break;
                        }

                        return _context6.abrupt('return', res.status(400).send({ message: 'Not an operation' }));

                    case 4:
                        // We fill the missing fields
                        _operation.raw = _operation.title;
                        _operation.dateImport = (0, _moment2.default)().format('YYYY-MM-DDTHH:mm:ss.000Z');
                        _operation.createdByUser = true;
                        _context6.next = 9;
                        return _operation3.default.create(_operation);

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
        return ref.apply(this, arguments);
    };
}();