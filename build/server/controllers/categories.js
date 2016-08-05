'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.update = exports.preloadCategory = exports.create = undefined;

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var create = exports.create = function () {
    var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(req, res) {
        var cat, parent, created;
        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        _context.prev = 0;
                        cat = req.body;

                        // Missing parameters

                        if (!(typeof cat.title === 'undefined')) {
                            _context.next = 4;
                            break;
                        }

                        throw new _helpers.KError('Missing category title', 400);

                    case 4:
                        if (!(typeof cat.color === 'undefined')) {
                            _context.next = 6;
                            break;
                        }

                        throw new _helpers.KError('Missing category color', 400);

                    case 6:
                        if (!(typeof cat.parentId !== 'undefined')) {
                            _context.next = 12;
                            break;
                        }

                        _context.next = 9;
                        return _category2.default.find(cat.parentId);

                    case 9:
                        parent = _context.sent;

                        if (parent) {
                            _context.next = 12;
                            break;
                        }

                        throw new _helpers.KError('Category ' + cat.parentId + ' not found', 404);

                    case 12:
                        _context.next = 14;
                        return _category2.default.create(cat);

                    case 14:
                        created = _context.sent;

                        res.status(200).send(created);
                        _context.next = 21;
                        break;

                    case 18:
                        _context.prev = 18;
                        _context.t0 = _context['catch'](0);
                        return _context.abrupt('return', (0, _helpers.asyncErr)(res, _context.t0, 'when creating category'));

                    case 21:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this, [[0, 18]]);
    }));

    return function create(_x, _x2) {
        return _ref.apply(this, arguments);
    };
}();

var preloadCategory = exports.preloadCategory = function () {
    var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(req, res, next, id) {
        var category;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        _context2.prev = 0;
                        category = void 0;
                        _context2.next = 4;
                        return _category2.default.find(id);

                    case 4:
                        category = _context2.sent;

                        if (category) {
                            _context2.next = 7;
                            break;
                        }

                        throw new _helpers.KError('Category not found', 404);

                    case 7:

                        req.preloaded = { category: category };
                        next();
                        _context2.next = 14;
                        break;

                    case 11:
                        _context2.prev = 11;
                        _context2.t0 = _context2['catch'](0);
                        return _context2.abrupt('return', (0, _helpers.asyncErr)(res, _context2.t0, 'when preloading a category'));

                    case 14:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, this, [[0, 11]]);
    }));

    return function preloadCategory(_x3, _x4, _x5, _x6) {
        return _ref2.apply(this, arguments);
    };
}();

var update = exports.update = function () {
    var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(req, res) {
        var params, category, newCat;
        return _regenerator2.default.wrap(function _callee3$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        _context3.prev = 0;
                        params = req.body;

                        // missing parameters

                        if (!(typeof params.title === 'undefined')) {
                            _context3.next = 4;
                            break;
                        }

                        throw new _helpers.KError('Missing title parameter', 400);

                    case 4:
                        if (!(typeof params.color === 'undefined')) {
                            _context3.next = 6;
                            break;
                        }

                        throw new _helpers.KError('Missing color parameter', 400);

                    case 6:
                        category = req.preloaded.category;
                        _context3.next = 9;
                        return category.updateAttributes(params);

                    case 9:
                        newCat = _context3.sent;

                        res.status(200).send(newCat);
                        _context3.next = 16;
                        break;

                    case 13:
                        _context3.prev = 13;
                        _context3.t0 = _context3['catch'](0);
                        return _context3.abrupt('return', (0, _helpers.asyncErr)(res, _context3.t0, 'when updating a category'));

                    case 16:
                    case 'end':
                        return _context3.stop();
                }
            }
        }, _callee3, this, [[0, 13]]);
    }));

    return function update(_x7, _x8) {
        return _ref3.apply(this, arguments);
    };
}();

var _category = require('../models/category');

var _category2 = _interopRequireDefault(_category);

var _operation = require('../models/operation');

var _operation2 = _interopRequireDefault(_operation);

var _helpers = require('../helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var log = (0, _helpers.makeLogger)('controllers/categories');

module.exports.delete = function () {
    var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4(req, res) {
        var replaceby, former, categoryId, categoryToReplaceBy, operations, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, op;

        return _regenerator2.default.wrap(function _callee4$(_context4) {
            while (1) {
                switch (_context4.prev = _context4.next) {
                    case 0:
                        _context4.prev = 0;
                        replaceby = req.body.replaceByCategoryId;

                        if (!(typeof replaceby === 'undefined')) {
                            _context4.next = 4;
                            break;
                        }

                        throw new _helpers.KError('Missing parameter replaceby', 400);

                    case 4:
                        former = req.preloaded.category;
                        categoryId = void 0;

                        if (!(replaceby.toString() !== '')) {
                            _context4.next = 16;
                            break;
                        }

                        log.debug('Replacing category ' + former.id + ' by ' + replaceby + '...');
                        _context4.next = 10;
                        return _category2.default.find(replaceby);

                    case 10:
                        categoryToReplaceBy = _context4.sent;

                        if (categoryToReplaceBy) {
                            _context4.next = 13;
                            break;
                        }

                        throw new _helpers.KError('Replacement category not found', 404);

                    case 13:
                        categoryId = replaceby;
                        _context4.next = 18;
                        break;

                    case 16:
                        log.debug('No replacement category, replacing by None.');
                        categoryId = null;

                    case 18:
                        _context4.next = 20;
                        return _operation2.default.byCategory(former.id);

                    case 20:
                        operations = _context4.sent;
                        _iteratorNormalCompletion = true;
                        _didIteratorError = false;
                        _iteratorError = undefined;
                        _context4.prev = 24;
                        _iterator = (0, _getIterator3.default)(operations);

                    case 26:
                        if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                            _context4.next = 33;
                            break;
                        }

                        op = _step.value;
                        _context4.next = 30;
                        return op.updateAttributes({ categoryId: categoryId });

                    case 30:
                        _iteratorNormalCompletion = true;
                        _context4.next = 26;
                        break;

                    case 33:
                        _context4.next = 39;
                        break;

                    case 35:
                        _context4.prev = 35;
                        _context4.t0 = _context4['catch'](24);
                        _didIteratorError = true;
                        _iteratorError = _context4.t0;

                    case 39:
                        _context4.prev = 39;
                        _context4.prev = 40;

                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }

                    case 42:
                        _context4.prev = 42;

                        if (!_didIteratorError) {
                            _context4.next = 45;
                            break;
                        }

                        throw _iteratorError;

                    case 45:
                        return _context4.finish(42);

                    case 46:
                        return _context4.finish(39);

                    case 47:
                        _context4.next = 49;
                        return former.destroy();

                    case 49:
                        res.sendStatus(200);
                        _context4.next = 55;
                        break;

                    case 52:
                        _context4.prev = 52;
                        _context4.t1 = _context4['catch'](0);
                        return _context4.abrupt('return', (0, _helpers.asyncErr)(res, _context4.t1, 'when deleting a category'));

                    case 55:
                    case 'end':
                        return _context4.stop();
                }
            }
        }, _callee4, this, [[0, 52], [24, 35, 39, 47], [40,, 42, 46]]);
    }));

    return function (_x9, _x10) {
        return _ref4.apply(this, arguments);
    };
}();