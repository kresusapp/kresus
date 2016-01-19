'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.all = undefined;

var _map = require('babel-runtime/core-js/map');

var _map2 = _interopRequireDefault(_map);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _bank = require('../models/bank');

var _bank2 = _interopRequireDefault(_bank);

var _access = require('../models/access');

var _access2 = _interopRequireDefault(_access);

var _account = require('../models/account');

var _account2 = _interopRequireDefault(_account);

var _alert = require('../models/alert');

var _alert2 = _interopRequireDefault(_alert);

var _category = require('../models/category');

var _category2 = _interopRequireDefault(_category);

var _operation = require('../models/operation');

var _operation2 = _interopRequireDefault(_operation);

var _operationtype = require('../models/operationtype');

var _operationtype2 = _interopRequireDefault(_operationtype);

var _config = require('../models/config');

var _config2 = _interopRequireDefault(_config);

var _cozyinstance = require('../models/cozyinstance');

var _cozyinstance2 = _interopRequireDefault(_cozyinstance);

var _helpers = require('../helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var log = (0, _helpers.makeLogger)('controllers/all');

var ERR_MSG_LOADING_ALL = 'Error when loading all Kresus data';

var getAllData = function () {
    var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
        var ret;
        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        ret = {};
                        _context.next = 3;
                        return _account2.default.all();

                    case 3:
                        ret.accounts = _context.sent;
                        _context.next = 6;
                        return _alert2.default.all();

                    case 6:
                        ret.alerts = _context.sent;
                        _context.next = 9;
                        return _bank2.default.all();

                    case 9:
                        ret.banks = _context.sent;
                        _context.next = 12;
                        return _category2.default.all();

                    case 12:
                        ret.categories = _context.sent;
                        _context.next = 15;
                        return _cozyinstance2.default.all();

                    case 15:
                        ret.cozy = _context.sent;
                        _context.next = 18;
                        return _operation2.default.all();

                    case 18:
                        ret.operations = _context.sent;
                        _context.next = 21;
                        return _operationtype2.default.all();

                    case 21:
                        ret.operationtypes = _context.sent;
                        _context.next = 24;
                        return _config2.default.all();

                    case 24:
                        ret.settings = _context.sent;
                        return _context.abrupt('return', ret);

                    case 26:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));
    return function getAllData() {
        return ref.apply(this, arguments);
    };
}();

var all = exports.all = function () {
    var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(req, res) {
        var ret;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        _context2.prev = 0;
                        _context2.next = 3;
                        return getAllData();

                    case 3:
                        ret = _context2.sent;

                        res.status(200).send(ret);
                        _context2.next = 11;
                        break;

                    case 7:
                        _context2.prev = 7;
                        _context2.t0 = _context2['catch'](0);

                        _context2.t0.code = ERR_MSG_LOADING_ALL;
                        return _context2.abrupt('return', (0, _helpers.asyncErr)(res, _context2.t0, 'when loading all data'));

                    case 11:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, this, [[0, 7]]);
    }));
    return function all(_x, _x2) {
        return ref.apply(this, arguments);
    };
}();

// Strip away Couchdb/pouchdb metadata.

function cleanMeta(obj) {
    delete obj._id;
    delete obj._rev;
}

// Sync function
function cleanData(world) {

    // Bank information is static and shouldn't be exported.
    delete world.banks;

    // Cozy information is very tied to the instance.
    if (world.cozy) delete world.cozy;

    var accessMap = {};
    var nextAccessId = 0;

    world.accesses = world.accesses || [];
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = (0, _getIterator3.default)(world.accesses), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var a = _step.value;

            accessMap[a.id] = nextAccessId;
            a.id = nextAccessId++;
            // Strip away password
            delete a.password;
            cleanMeta(a);
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

    world.accounts = world.accounts || [];
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
        for (var _iterator2 = (0, _getIterator3.default)(world.accounts), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var a = _step2.value;

            a.bankAccess = accessMap[a.bankAccess];
            // Strip away id
            delete a.id;
            cleanMeta(a);
        }
    } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion2 && _iterator2.return) {
                _iterator2.return();
            }
        } finally {
            if (_didIteratorError2) {
                throw _iteratorError2;
            }
        }
    }

    var categoryMap = {};
    var nextCatId = 0;
    world.categories = world.categories || [];
    var _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
    var _iteratorError3 = undefined;

    try {
        for (var _iterator3 = (0, _getIterator3.default)(world.categories), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var c = _step3.value;

            categoryMap[c.id] = nextCatId;
            c.id = nextCatId++;
            cleanMeta(c);
        }
    } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion3 && _iterator3.return) {
                _iterator3.return();
            }
        } finally {
            if (_didIteratorError3) {
                throw _iteratorError3;
            }
        }
    }

    var opTypeMap = {};
    var nextOpTypeId = 0;
    world.operationtypes = world.operationtypes || [];
    var _iteratorNormalCompletion4 = true;
    var _didIteratorError4 = false;
    var _iteratorError4 = undefined;

    try {
        for (var _iterator4 = (0, _getIterator3.default)(world.operationtypes), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
            var o = _step4.value;

            opTypeMap[o.id] = nextOpTypeId;
            o.id = nextOpTypeId++;
            cleanMeta(o);
        }
    } catch (err) {
        _didIteratorError4 = true;
        _iteratorError4 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion4 && _iterator4.return) {
                _iterator4.return();
            }
        } finally {
            if (_didIteratorError4) {
                throw _iteratorError4;
            }
        }
    }

    world.operations = world.operations || [];
    var _iteratorNormalCompletion5 = true;
    var _didIteratorError5 = false;
    var _iteratorError5 = undefined;

    try {
        for (var _iterator5 = (0, _getIterator3.default)(world.operations), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
            var o = _step5.value;

            if (typeof o.categoryId !== 'undefined') {
                var cid = o.categoryId;
                if (typeof categoryMap[cid] === 'undefined') log.warn('unexpected category id: ' + cid);else o.categoryId = categoryMap[cid];
            }

            if (typeof o.operationTypeID !== 'undefined') {
                var oid = o.operationTypeID;
                if (typeof opTypeMap[oid] === 'undefined') log.warn('unexpected operation type id: ' + oid);else o.operationTypeID = opTypeMap[oid];
            }

            // Strip away id
            delete o.id;
            cleanMeta(o);
        }
    } catch (err) {
        _didIteratorError5 = true;
        _iteratorError5 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion5 && _iterator5.return) {
                _iterator5.return();
            }
        } finally {
            if (_didIteratorError5) {
                throw _iteratorError5;
            }
        }
    }

    world.settings = world.settings || [];
    var _iteratorNormalCompletion6 = true;
    var _didIteratorError6 = false;
    var _iteratorError6 = undefined;

    try {
        for (var _iterator6 = (0, _getIterator3.default)(world.settings), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
            var s = _step6.value;

            delete s.id;
            cleanMeta(s);
        }
    } catch (err) {
        _didIteratorError6 = true;
        _iteratorError6 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion6 && _iterator6.return) {
                _iterator6.return();
            }
        } finally {
            if (_didIteratorError6) {
                throw _iteratorError6;
            }
        }
    }

    world.alerts = world.alerts || [];
    var _iteratorNormalCompletion7 = true;
    var _didIteratorError7 = false;
    var _iteratorError7 = undefined;

    try {
        for (var _iterator7 = (0, _getIterator3.default)(world.alerts), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
            var a = _step7.value;

            delete a.id;
            cleanMeta(a);
        }
    } catch (err) {
        _didIteratorError7 = true;
        _iteratorError7 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion7 && _iterator7.return) {
                _iterator7.return();
            }
        } finally {
            if (_didIteratorError7) {
                throw _iteratorError7;
            }
        }
    }

    return world;
}

module.exports.export = function () {
    var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(req, res) {
        var _ret;

        return _regenerator2.default.wrap(function _callee3$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        _context3.prev = 0;
                        _context3.next = 3;
                        return getAllData();

                    case 3:
                        _ret = _context3.sent;
                        _context3.next = 6;
                        return _access2.default.all();

                    case 6:
                        _ret.accesses = _context3.sent;

                        _ret = cleanData(_ret);
                        res.setHeader('Content-Type', 'application/json');
                        res.status(200).send((0, _stringify2.default)(_ret, null, '   '));
                        _context3.next = 16;
                        break;

                    case 12:
                        _context3.prev = 12;
                        _context3.t0 = _context3['catch'](0);

                        _context3.t0.code = ERR_MSG_LOADING_ALL;
                        return _context3.abrupt('return', (0, _helpers.asyncErr)(res, _context3.t0, 'when exporting data'));

                    case 16:
                    case 'end':
                        return _context3.stop();
                }
            }
        }, _callee3, this, [[0, 12]]);
    }));
    return function (_x3, _x4) {
        return ref.apply(this, arguments);
    };
}();

module.exports.import = function () {
    var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4(req, res) {
        var world, accessMap, _iteratorNormalCompletion8, _didIteratorError8, _iteratorError8, _iterator8, _step8, access, accessId, created, _iteratorNormalCompletion9, _didIteratorError9, _iteratorError9, _iterator9, _step9, account, existingCategories, existingCategoriesMap, _iteratorNormalCompletion10, _didIteratorError10, _iteratorError10, _iterator10, _step10, c, categoryMap, _iteratorNormalCompletion11, _didIteratorError11, _iteratorError11, _iterator11, _step11, category, catId, existing, existingTypes, existingTypesMap, _iteratorNormalCompletion12, _didIteratorError12, _iteratorError12, _iterator12, _step12, t, opTypeMap, _iteratorNormalCompletion13, _didIteratorError13, _iteratorError13, _iterator13, _step13, type, opTypeId, _iteratorNormalCompletion14, _didIteratorError14, _iteratorError14, _iterator14, _step14, op, categoryId, operationTypeID, _iteratorNormalCompletion15, _didIteratorError15, _iteratorError15, _iterator15, _step15, setting, _iteratorNormalCompletion16, _didIteratorError16, _iteratorError16, _iterator16, _step16, a;

        return _regenerator2.default.wrap(function _callee4$(_context4) {
            while (1) {
                switch (_context4.prev = _context4.next) {
                    case 0:
                        if (req.body.all) {
                            _context4.next = 2;
                            break;
                        }

                        return _context4.abrupt('return', (0, _helpers.sendErr)(res, 'missing parameter all', 400, "missing parameter 'all' in the file"));

                    case 2:
                        world = req.body.all;

                        world.accesses = world.accesses || [];
                        world.accounts = world.accounts || [];
                        world.alerts = world.alerts || [];
                        world.categories = world.categories || [];
                        world.operationtypes = world.operationtypes || [];
                        world.operations = world.operations || [];
                        world.settings = world.settings || [];

                        _context4.prev = 10;

                        log.info('Importing:\n            accesses:        ' + world.accesses.length + '\n            accounts:        ' + world.accounts.length + '\n            alerts:          ' + world.alerts.length + '\n            categories:      ' + world.categories.length + '\n            operation-types: ' + world.operationtypes.length + '\n            settings:        ' + world.settings.length + '\n            operations:      ' + world.operations.length + '\n        ');

                        log.info('Import accesses...');
                        accessMap = {};
                        _iteratorNormalCompletion8 = true;
                        _didIteratorError8 = false;
                        _iteratorError8 = undefined;
                        _context4.prev = 17;
                        _iterator8 = (0, _getIterator3.default)(world.accesses);

                    case 19:
                        if (_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done) {
                            _context4.next = 30;
                            break;
                        }

                        access = _step8.value;
                        accessId = access.id;

                        delete access.id;
                        _context4.next = 25;
                        return _access2.default.create(access);

                    case 25:
                        created = _context4.sent;

                        accessMap[accessId] = created.id;

                    case 27:
                        _iteratorNormalCompletion8 = true;
                        _context4.next = 19;
                        break;

                    case 30:
                        _context4.next = 36;
                        break;

                    case 32:
                        _context4.prev = 32;
                        _context4.t0 = _context4['catch'](17);
                        _didIteratorError8 = true;
                        _iteratorError8 = _context4.t0;

                    case 36:
                        _context4.prev = 36;
                        _context4.prev = 37;

                        if (!_iteratorNormalCompletion8 && _iterator8.return) {
                            _iterator8.return();
                        }

                    case 39:
                        _context4.prev = 39;

                        if (!_didIteratorError8) {
                            _context4.next = 42;
                            break;
                        }

                        throw _iteratorError8;

                    case 42:
                        return _context4.finish(39);

                    case 43:
                        return _context4.finish(36);

                    case 44:
                        log.info('Done.');

                        log.info('Import accounts...');
                        _iteratorNormalCompletion9 = true;
                        _didIteratorError9 = false;
                        _iteratorError9 = undefined;
                        _context4.prev = 49;
                        _iterator9 = (0, _getIterator3.default)(world.accounts);

                    case 51:
                        if (_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done) {
                            _context4.next = 61;
                            break;
                        }

                        account = _step9.value;

                        if (accessMap[account.bankAccess]) {
                            _context4.next = 55;
                            break;
                        }

                        throw { status: 400,
                            message: 'unknown bank access ' + account.bankAccess };

                    case 55:
                        account.bankAccess = accessMap[account.bankAccess];
                        _context4.next = 58;
                        return _account2.default.create(account);

                    case 58:
                        _iteratorNormalCompletion9 = true;
                        _context4.next = 51;
                        break;

                    case 61:
                        _context4.next = 67;
                        break;

                    case 63:
                        _context4.prev = 63;
                        _context4.t1 = _context4['catch'](49);
                        _didIteratorError9 = true;
                        _iteratorError9 = _context4.t1;

                    case 67:
                        _context4.prev = 67;
                        _context4.prev = 68;

                        if (!_iteratorNormalCompletion9 && _iterator9.return) {
                            _iterator9.return();
                        }

                    case 70:
                        _context4.prev = 70;

                        if (!_didIteratorError9) {
                            _context4.next = 73;
                            break;
                        }

                        throw _iteratorError9;

                    case 73:
                        return _context4.finish(70);

                    case 74:
                        return _context4.finish(67);

                    case 75:
                        log.info('Done.');

                        log.info('Import categories...');
                        _context4.next = 79;
                        return _category2.default.all();

                    case 79:
                        existingCategories = _context4.sent;
                        existingCategoriesMap = new _map2.default();
                        _iteratorNormalCompletion10 = true;
                        _didIteratorError10 = false;
                        _iteratorError10 = undefined;
                        _context4.prev = 84;

                        for (_iterator10 = (0, _getIterator3.default)(existingCategories); !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
                            c = _step10.value;

                            existingCategoriesMap.set(c.title, c);
                        }

                        _context4.next = 92;
                        break;

                    case 88:
                        _context4.prev = 88;
                        _context4.t2 = _context4['catch'](84);
                        _didIteratorError10 = true;
                        _iteratorError10 = _context4.t2;

                    case 92:
                        _context4.prev = 92;
                        _context4.prev = 93;

                        if (!_iteratorNormalCompletion10 && _iterator10.return) {
                            _iterator10.return();
                        }

                    case 95:
                        _context4.prev = 95;

                        if (!_didIteratorError10) {
                            _context4.next = 98;
                            break;
                        }

                        throw _iteratorError10;

                    case 98:
                        return _context4.finish(95);

                    case 99:
                        return _context4.finish(92);

                    case 100:
                        categoryMap = {};
                        _iteratorNormalCompletion11 = true;
                        _didIteratorError11 = false;
                        _iteratorError11 = undefined;
                        _context4.prev = 104;
                        _iterator11 = (0, _getIterator3.default)(world.categories);

                    case 106:
                        if (_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done) {
                            _context4.next = 122;
                            break;
                        }

                        category = _step11.value;
                        catId = category.id;

                        delete category.id;

                        if (!existingCategoriesMap.has(category.title)) {
                            _context4.next = 115;
                            break;
                        }

                        existing = existingCategoriesMap.get(category.title);

                        categoryMap[catId] = existing.id;
                        _context4.next = 119;
                        break;

                    case 115:
                        _context4.next = 117;
                        return _category2.default.create(category);

                    case 117:
                        created = _context4.sent;

                        categoryMap[catId] = created.id;

                    case 119:
                        _iteratorNormalCompletion11 = true;
                        _context4.next = 106;
                        break;

                    case 122:
                        _context4.next = 128;
                        break;

                    case 124:
                        _context4.prev = 124;
                        _context4.t3 = _context4['catch'](104);
                        _didIteratorError11 = true;
                        _iteratorError11 = _context4.t3;

                    case 128:
                        _context4.prev = 128;
                        _context4.prev = 129;

                        if (!_iteratorNormalCompletion11 && _iterator11.return) {
                            _iterator11.return();
                        }

                    case 131:
                        _context4.prev = 131;

                        if (!_didIteratorError11) {
                            _context4.next = 134;
                            break;
                        }

                        throw _iteratorError11;

                    case 134:
                        return _context4.finish(131);

                    case 135:
                        return _context4.finish(128);

                    case 136:
                        log.info('Done.');

                        log.info('Import operation types...');
                        _context4.next = 140;
                        return _operationtype2.default.all();

                    case 140:
                        existingTypes = _context4.sent;
                        existingTypesMap = new _map2.default();
                        _iteratorNormalCompletion12 = true;
                        _didIteratorError12 = false;
                        _iteratorError12 = undefined;
                        _context4.prev = 145;

                        for (_iterator12 = (0, _getIterator3.default)(existingTypes); !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
                            t = _step12.value;

                            existingTypesMap.set(+t.weboobvalue, t);
                        }

                        _context4.next = 153;
                        break;

                    case 149:
                        _context4.prev = 149;
                        _context4.t4 = _context4['catch'](145);
                        _didIteratorError12 = true;
                        _iteratorError12 = _context4.t4;

                    case 153:
                        _context4.prev = 153;
                        _context4.prev = 154;

                        if (!_iteratorNormalCompletion12 && _iterator12.return) {
                            _iterator12.return();
                        }

                    case 156:
                        _context4.prev = 156;

                        if (!_didIteratorError12) {
                            _context4.next = 159;
                            break;
                        }

                        throw _iteratorError12;

                    case 159:
                        return _context4.finish(156);

                    case 160:
                        return _context4.finish(153);

                    case 161:
                        opTypeMap = {};
                        _iteratorNormalCompletion13 = true;
                        _didIteratorError13 = false;
                        _iteratorError13 = undefined;
                        _context4.prev = 165;
                        _iterator13 = (0, _getIterator3.default)(world.operationtypes);

                    case 167:
                        if (_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done) {
                            _context4.next = 183;
                            break;
                        }

                        type = _step13.value;
                        opTypeId = type.id;

                        delete type.id;

                        if (!existingTypesMap.has(+type.weboobvalue)) {
                            _context4.next = 176;
                            break;
                        }

                        existing = existingTypesMap.get(+type.weboobvalue);

                        opTypeMap[opTypeId] = existing.id;
                        _context4.next = 180;
                        break;

                    case 176:
                        _context4.next = 178;
                        return _operationtype2.default.create(type);

                    case 178:
                        created = _context4.sent;

                        opTypeMap[opTypeId] = created.id;

                    case 180:
                        _iteratorNormalCompletion13 = true;
                        _context4.next = 167;
                        break;

                    case 183:
                        _context4.next = 189;
                        break;

                    case 185:
                        _context4.prev = 185;
                        _context4.t5 = _context4['catch'](165);
                        _didIteratorError13 = true;
                        _iteratorError13 = _context4.t5;

                    case 189:
                        _context4.prev = 189;
                        _context4.prev = 190;

                        if (!_iteratorNormalCompletion13 && _iterator13.return) {
                            _iterator13.return();
                        }

                    case 192:
                        _context4.prev = 192;

                        if (!_didIteratorError13) {
                            _context4.next = 195;
                            break;
                        }

                        throw _iteratorError13;

                    case 195:
                        return _context4.finish(192);

                    case 196:
                        return _context4.finish(189);

                    case 197:
                        log.info('Done.');

                        log.info('Import operations...');
                        _iteratorNormalCompletion14 = true;
                        _didIteratorError14 = false;
                        _iteratorError14 = undefined;
                        _context4.prev = 202;
                        _iterator14 = (0, _getIterator3.default)(world.operations);

                    case 204:
                        if (_iteratorNormalCompletion14 = (_step14 = _iterator14.next()).done) {
                            _context4.next = 221;
                            break;
                        }

                        op = _step14.value;
                        categoryId = op.categoryId;

                        if (!(typeof categoryId !== 'undefined')) {
                            _context4.next = 211;
                            break;
                        }

                        if (categoryMap[categoryId]) {
                            _context4.next = 210;
                            break;
                        }

                        throw { status: 400,
                            message: 'unknown category ' + categoryId };

                    case 210:
                        op.categoryId = categoryMap[categoryId];

                    case 211:
                        operationTypeID = op.operationTypeID;

                        if (!(typeof operationTypeID !== 'undefined')) {
                            _context4.next = 216;
                            break;
                        }

                        if (opTypeMap[operationTypeID]) {
                            _context4.next = 215;
                            break;
                        }

                        throw { status: 400,
                            message: 'unknown type ' + op.operationTypeID };

                    case 215:
                        op.operationTypeID = opTypeMap[operationTypeID];

                    case 216:
                        _context4.next = 218;
                        return _operation2.default.create(op);

                    case 218:
                        _iteratorNormalCompletion14 = true;
                        _context4.next = 204;
                        break;

                    case 221:
                        _context4.next = 227;
                        break;

                    case 223:
                        _context4.prev = 223;
                        _context4.t6 = _context4['catch'](202);
                        _didIteratorError14 = true;
                        _iteratorError14 = _context4.t6;

                    case 227:
                        _context4.prev = 227;
                        _context4.prev = 228;

                        if (!_iteratorNormalCompletion14 && _iterator14.return) {
                            _iterator14.return();
                        }

                    case 230:
                        _context4.prev = 230;

                        if (!_didIteratorError14) {
                            _context4.next = 233;
                            break;
                        }

                        throw _iteratorError14;

                    case 233:
                        return _context4.finish(230);

                    case 234:
                        return _context4.finish(227);

                    case 235:
                        log.info('Done.');

                        log.info('Import settings...');
                        _iteratorNormalCompletion15 = true;
                        _didIteratorError15 = false;
                        _iteratorError15 = undefined;
                        _context4.prev = 240;
                        _iterator15 = (0, _getIterator3.default)(world.settings);

                    case 242:
                        if (_iteratorNormalCompletion15 = (_step15 = _iterator15.next()).done) {
                            _context4.next = 251;
                            break;
                        }

                        setting = _step15.value;

                        if (!(setting.name === 'weboob-log' || setting.name === 'weboob-installed')) {
                            _context4.next = 246;
                            break;
                        }

                        return _context4.abrupt('continue', 248);

                    case 246:
                        _context4.next = 248;
                        return _config2.default.findOrCreateByName(setting.name, setting.value);

                    case 248:
                        _iteratorNormalCompletion15 = true;
                        _context4.next = 242;
                        break;

                    case 251:
                        _context4.next = 257;
                        break;

                    case 253:
                        _context4.prev = 253;
                        _context4.t7 = _context4['catch'](240);
                        _didIteratorError15 = true;
                        _iteratorError15 = _context4.t7;

                    case 257:
                        _context4.prev = 257;
                        _context4.prev = 258;

                        if (!_iteratorNormalCompletion15 && _iterator15.return) {
                            _iterator15.return();
                        }

                    case 260:
                        _context4.prev = 260;

                        if (!_didIteratorError15) {
                            _context4.next = 263;
                            break;
                        }

                        throw _iteratorError15;

                    case 263:
                        return _context4.finish(260);

                    case 264:
                        return _context4.finish(257);

                    case 265:
                        log.info('Done.');

                        log.info('Import alerts...');
                        _iteratorNormalCompletion16 = true;
                        _didIteratorError16 = false;
                        _iteratorError16 = undefined;
                        _context4.prev = 270;
                        _iterator16 = (0, _getIterator3.default)(world.alerts);

                    case 272:
                        if (_iteratorNormalCompletion16 = (_step16 = _iterator16.next()).done) {
                            _context4.next = 279;
                            break;
                        }

                        a = _step16.value;
                        _context4.next = 276;
                        return _alert2.default.create(a);

                    case 276:
                        _iteratorNormalCompletion16 = true;
                        _context4.next = 272;
                        break;

                    case 279:
                        _context4.next = 285;
                        break;

                    case 281:
                        _context4.prev = 281;
                        _context4.t8 = _context4['catch'](270);
                        _didIteratorError16 = true;
                        _iteratorError16 = _context4.t8;

                    case 285:
                        _context4.prev = 285;
                        _context4.prev = 286;

                        if (!_iteratorNormalCompletion16 && _iterator16.return) {
                            _iterator16.return();
                        }

                    case 288:
                        _context4.prev = 288;

                        if (!_didIteratorError16) {
                            _context4.next = 291;
                            break;
                        }

                        throw _iteratorError16;

                    case 291:
                        return _context4.finish(288);

                    case 292:
                        return _context4.finish(285);

                    case 293:
                        log.info('Done.');

                        log.info('Import finished with success!');
                        res.sendStatus(200);
                        _context4.next = 301;
                        break;

                    case 298:
                        _context4.prev = 298;
                        _context4.t9 = _context4['catch'](10);
                        return _context4.abrupt('return', (0, _helpers.asyncErr)(res, _context4.t9, 'when importing data'));

                    case 301:
                    case 'end':
                        return _context4.stop();
                }
            }
        }, _callee4, this, [[10, 298], [17, 32, 36, 44], [37,, 39, 43], [49, 63, 67, 75], [68,, 70, 74], [84, 88, 92, 100], [93,, 95, 99], [104, 124, 128, 136], [129,, 131, 135], [145, 149, 153, 161], [154,, 156, 160], [165, 185, 189, 197], [190,, 192, 196], [202, 223, 227, 235], [228,, 230, 234], [240, 253, 257, 265], [258,, 260, 264], [270, 281, 285, 293], [286,, 288, 292]]);
    }));
    return function (_x5, _x6) {
        return ref.apply(this, arguments);
    };
}();