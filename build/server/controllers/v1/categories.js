'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.destroy = exports.update = exports.preloadCategory = exports.create = undefined;

let create = exports.create = (() => {
    var _ref = _asyncToGenerator(function* (req, res) {
        try {
            let cat = req.body;

            // Missing parameters
            if (typeof cat.title === 'undefined') {
                throw new _helpers.KError('Missing category title', 400);
            }
            if (typeof cat.color === 'undefined') {
                throw new _helpers.KError('Missing category color', 400);
            }

            if (typeof cat.parentId !== 'undefined') {
                let parent = yield _category2.default.find(cat.parentId);
                if (!parent) {
                    throw new _helpers.KError(`Category ${cat.parentId} not found`, 404);
                }
            }
            let created = yield _category2.default.create(cat);
            res.status(200).json(created);
        } catch (err) {
            return (0, _helpers.asyncErr)(res, err, 'when creating category');
        }
    });

    return function create(_x, _x2) {
        return _ref.apply(this, arguments);
    };
})();

let preloadCategory = exports.preloadCategory = (() => {
    var _ref2 = _asyncToGenerator(function* (req, res, next, id) {
        try {
            let category;
            category = yield _category2.default.find(id);

            if (!category) {
                throw new _helpers.KError('Category not found', 404);
            }

            req.preloaded = { category };
            return next();
        } catch (err) {
            return (0, _helpers.asyncErr)(res, err, 'when preloading a category');
        }
    });

    return function preloadCategory(_x3, _x4, _x5, _x6) {
        return _ref2.apply(this, arguments);
    };
})();

let update = exports.update = (() => {
    var _ref3 = _asyncToGenerator(function* (req, res) {
        try {
            let params = req.body;

            // missing parameters
            if (typeof params.title === 'undefined') {
                throw new _helpers.KError('Missing title parameter', 400);
            }
            if (typeof params.color === 'undefined') {
                throw new _helpers.KError('Missing color parameter', 400);
            }

            let category = req.preloaded.category;
            let newCat = yield category.updateAttributes(params);
            res.status(200).json(newCat);
        } catch (err) {
            return (0, _helpers.asyncErr)(res, err, 'when updating a category');
        }
    });

    return function update(_x7, _x8) {
        return _ref3.apply(this, arguments);
    };
})();

let destroy = exports.destroy = (() => {
    var _ref4 = _asyncToGenerator(function* (req, res) {
        try {
            let replaceby = req.body.replaceByCategoryId;
            if (typeof replaceby === 'undefined') {
                throw new _helpers.KError('Missing parameter replaceby', 400);
            }

            let former = req.preloaded.category;

            let categoryId;
            if (replaceby.toString() !== '') {
                log.debug(`Replacing category ${former.id} by ${replaceby}...`);
                let categoryToReplaceBy = yield _category2.default.find(replaceby);
                if (!categoryToReplaceBy) {
                    throw new _helpers.KError('Replacement category not found', 404);
                }
                categoryId = replaceby;
            } else {
                log.debug('No replacement category, replacing by None.');
                categoryId = null;
            }

            let operations = yield _operation2.default.byCategory(former.id);
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = operations[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    let op = _step.value;

                    yield op.updateAttributes({ categoryId });
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }

            yield former.destroy();
            res.status(200).end();
        } catch (err) {
            return (0, _helpers.asyncErr)(res, err, 'when deleting a category');
        }
    });

    return function destroy(_x9, _x10) {
        return _ref4.apply(this, arguments);
    };
})();

var _category = require('../../models/category');

var _category2 = _interopRequireDefault(_category);

var _operation = require('../../models/operation');

var _operation2 = _interopRequireDefault(_operation);

var _helpers = require('../../helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

let log = (0, _helpers.makeLogger)('controllers/categories');