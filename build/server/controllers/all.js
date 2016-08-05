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

var getAllData = function () {
    var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
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
        return _ref.apply(this, arguments);
    };
}();

var all = exports.all = function () {
    var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(req, res) {
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
        return _ref2.apply(this, arguments);
    };
}();

// Strip away Couchdb/pouchdb metadata.


var _crypto = require('crypto');

var crypto = _interopRequireWildcard(_crypto);

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

var _migrations = require('../models/migrations');

var _helpers = require('../helpers');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var log = (0, _helpers.makeLogger)('controllers/all');

var ERR_MSG_LOADING_ALL = 'Error when loading all Kresus data';
var ENCRYPTION_ALGORITHM = 'aes-256-ctr';
var PASSPHRASE_VALIDATION_REGEXP = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
var ENCRYPTED_CONTENT_TAG = new Buffer('KRE');

function cleanMeta(obj) {
    delete obj._id;
    delete obj._rev;
}

// Sync function
function cleanData(world, savePassword) {

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

            if (!savePassword) {
                // Strip away password
                delete a.password;
            }

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
            var _a = _step2.value;

            _a.bankAccess = accessMap[_a.bankAccess];
            // Strip away id
            delete _a.id;
            cleanMeta(_a);
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
            var _o = _step5.value;


            if (typeof _o.categoryId !== 'undefined') {
                var cid = _o.categoryId;
                if (typeof categoryMap[cid] === 'undefined') log.warn('unexpected category id: ' + cid);else _o.categoryId = categoryMap[cid];
            }

            if (typeof _o.operationTypeID !== 'undefined') {
                var oid = _o.operationTypeID;
                if (typeof opTypeMap[oid] === 'undefined') log.warn('unexpected operation type id: ' + oid);else _o.operationTypeID = opTypeMap[oid];
            }

            // Strip away id
            delete _o.id;
            cleanMeta(_o);
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
            var _a2 = _step7.value;

            delete _a2.id;
            cleanMeta(_a2);
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

function encryptData(data, passphrase) {
    var cipher = crypto.createCipher(ENCRYPTION_ALGORITHM, passphrase);
    return Buffer.concat([ENCRYPTED_CONTENT_TAG, cipher.update(data), cipher.final()]).toString('base64');
}

function decryptData(data, passphrase) {
    var rawData = new Buffer(data, 'base64');
    var tag = rawData.slice(0, 3);
    var encrypted = rawData.slice(3);


    if (tag.toString() !== ENCRYPTED_CONTENT_TAG.toString()) {
        throw new _helpers.KError('submitted file is not a valid kresus file', 400);
    }

    var decipher = crypto.createDecipher(ENCRYPTION_ALGORITHM, passphrase);
    return Buffer.concat([decipher.update(encrypted), decipher.final()]);
}

module.exports.oldExport = function () {
    var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(req, res) {
        var ret;
        return _regenerator2.default.wrap(function _callee3$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        _context3.prev = 0;
                        _context3.next = 3;
                        return getAllData();

                    case 3:
                        ret = _context3.sent;
                        _context3.next = 6;
                        return _access2.default.all();

                    case 6:
                        ret.accesses = _context3.sent;

                        ret = cleanData(ret);
                        res.setHeader('Content-Type', 'application/json');
                        res.status(200).send((0, _stringify2.default)(ret, null, '   '));
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
        return _ref3.apply(this, arguments);
    };
}();

module.exports.export = function () {
    var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4(req, res) {
        var passphrase, ret;
        return _regenerator2.default.wrap(function _callee4$(_context4) {
            while (1) {
                switch (_context4.prev = _context4.next) {
                    case 0:
                        _context4.prev = 0;
                        passphrase = null;

                        if (!req.body.encrypted) {
                            _context4.next = 8;
                            break;
                        }

                        if (!(typeof req.body.passphrase !== 'string')) {
                            _context4.next = 5;
                            break;
                        }

                        throw new _helpers.KError('missing parameter "passphrase"', 400);

                    case 5:

                        passphrase = req.body.passphrase;
                        // Check password strength

                        if (PASSPHRASE_VALIDATION_REGEXP.test(passphrase)) {
                            _context4.next = 8;
                            break;
                        }

                        throw new _helpers.KError('submitted passphrase is too weak', 400);

                    case 8:
                        _context4.next = 10;
                        return getAllData();

                    case 10:
                        ret = _context4.sent;
                        _context4.next = 13;
                        return _access2.default.all();

                    case 13:
                        ret.accesses = _context4.sent;

                        // Only save user password if encryption is enabled.
                        ret = cleanData(ret, !!passphrase);
                        ret = (0, _stringify2.default)(ret, null, '   ');

                        if (passphrase) {
                            ret = encryptData(ret, passphrase);
                            res.setHeader('Content-Type', 'text/plain');
                        } else {
                            res.setHeader('Content-Type', 'application/json');
                        }

                        res.status(200).send(ret);
                        _context4.next = 24;
                        break;

                    case 20:
                        _context4.prev = 20;
                        _context4.t0 = _context4['catch'](0);

                        _context4.t0.code = ERR_MSG_LOADING_ALL;
                        return _context4.abrupt('return', (0, _helpers.asyncErr)(res, _context4.t0, 'when exporting data'));

                    case 24:
                    case 'end':
                        return _context4.stop();
                }
            }
        }, _callee4, this, [[0, 20]]);
    }));

    return function (_x5, _x6) {
        return _ref4.apply(this, arguments);
    };
}();

module.exports.import = function () {
    var _ref5 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee5(req, res) {
        var world, accessMap, _iteratorNormalCompletion8, _didIteratorError8, _iteratorError8, _iterator8, _step8, access, accessId, created, _iteratorNormalCompletion9, _didIteratorError9, _iteratorError9, _iterator9, _step9, account, existingCategories, existingCategoriesMap, _iteratorNormalCompletion10, _didIteratorError10, _iteratorError10, _iterator10, _step10, c, categoryMap, _iteratorNormalCompletion11, _didIteratorError11, _iteratorError11, _iterator11, _step11, category, catId, existing, _created, existingTypes, existingTypesMap, _iteratorNormalCompletion12, _didIteratorError12, _iteratorError12, _iterator12, _step12, t, opTypeMap, _iteratorNormalCompletion13, _didIteratorError13, _iteratorError13, _iterator13, _step13, type, opTypeId, _existing, _created2, _iteratorNormalCompletion14, _didIteratorError14, _iteratorError14, _iterator14, _step14, op, categoryId, operationTypeID, _iteratorNormalCompletion15, _didIteratorError15, _iteratorError15, _iterator15, _step15, setting, _iteratorNormalCompletion16, _didIteratorError16, _iteratorError16, _iterator16, _step16, a;

        return _regenerator2.default.wrap(function _callee5$(_context5) {
            while (1) {
                switch (_context5.prev = _context5.next) {
                    case 0:
                        _context5.prev = 0;

                        if (req.body.all) {
                            _context5.next = 3;
                            break;
                        }

                        throw new _helpers.KError('missing parameter "all" in the file', 400);

                    case 3:
                        world = req.body.all;

                        if (!req.body.encrypted) {
                            _context5.next = 15;
                            break;
                        }

                        if (!(typeof req.body.passphrase !== 'string')) {
                            _context5.next = 7;
                            break;
                        }

                        throw new _helpers.KError('missing parameter "passphrase"', 400);

                    case 7:

                        world = decryptData(world, req.body.passphrase);

                        _context5.prev = 8;

                        world = JSON.parse(world);
                        _context5.next = 15;
                        break;

                    case 12:
                        _context5.prev = 12;
                        _context5.t0 = _context5['catch'](8);
                        throw new _helpers.KError('Invalid json file or bad passphrase.', 400);

                    case 15:

                        world.accesses = world.accesses || [];
                        world.accounts = world.accounts || [];
                        world.alerts = world.alerts || [];
                        world.categories = world.categories || [];
                        world.operationtypes = world.operationtypes || [];
                        world.operations = world.operations || [];
                        world.settings = world.settings || [];

                        log.info('Importing:\n            accesses:        ' + world.accesses.length + '\n            accounts:        ' + world.accounts.length + '\n            alerts:          ' + world.alerts.length + '\n            categories:      ' + world.categories.length + '\n            operation-types: ' + world.operationtypes.length + '\n            settings:        ' + world.settings.length + '\n            operations:      ' + world.operations.length + '\n        ');

                        log.info('Import accesses...');
                        accessMap = {};
                        _iteratorNormalCompletion8 = true;
                        _didIteratorError8 = false;
                        _iteratorError8 = undefined;
                        _context5.prev = 28;
                        _iterator8 = (0, _getIterator3.default)(world.accesses);

                    case 30:
                        if (_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done) {
                            _context5.next = 41;
                            break;
                        }

                        access = _step8.value;
                        accessId = access.id;

                        delete access.id;
                        _context5.next = 36;
                        return _access2.default.create(access);

                    case 36:
                        created = _context5.sent;

                        accessMap[accessId] = created.id;

                    case 38:
                        _iteratorNormalCompletion8 = true;
                        _context5.next = 30;
                        break;

                    case 41:
                        _context5.next = 47;
                        break;

                    case 43:
                        _context5.prev = 43;
                        _context5.t1 = _context5['catch'](28);
                        _didIteratorError8 = true;
                        _iteratorError8 = _context5.t1;

                    case 47:
                        _context5.prev = 47;
                        _context5.prev = 48;

                        if (!_iteratorNormalCompletion8 && _iterator8.return) {
                            _iterator8.return();
                        }

                    case 50:
                        _context5.prev = 50;

                        if (!_didIteratorError8) {
                            _context5.next = 53;
                            break;
                        }

                        throw _iteratorError8;

                    case 53:
                        return _context5.finish(50);

                    case 54:
                        return _context5.finish(47);

                    case 55:
                        log.info('Done.');

                        log.info('Import accounts...');
                        _iteratorNormalCompletion9 = true;
                        _didIteratorError9 = false;
                        _iteratorError9 = undefined;
                        _context5.prev = 60;
                        _iterator9 = (0, _getIterator3.default)(world.accounts);

                    case 62:
                        if (_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done) {
                            _context5.next = 72;
                            break;
                        }

                        account = _step9.value;

                        if (accessMap[account.bankAccess]) {
                            _context5.next = 66;
                            break;
                        }

                        throw new _helpers.KError('unknown access ' + account.bankAccess, 400);

                    case 66:
                        account.bankAccess = accessMap[account.bankAccess];
                        _context5.next = 69;
                        return _account2.default.create(account);

                    case 69:
                        _iteratorNormalCompletion9 = true;
                        _context5.next = 62;
                        break;

                    case 72:
                        _context5.next = 78;
                        break;

                    case 74:
                        _context5.prev = 74;
                        _context5.t2 = _context5['catch'](60);
                        _didIteratorError9 = true;
                        _iteratorError9 = _context5.t2;

                    case 78:
                        _context5.prev = 78;
                        _context5.prev = 79;

                        if (!_iteratorNormalCompletion9 && _iterator9.return) {
                            _iterator9.return();
                        }

                    case 81:
                        _context5.prev = 81;

                        if (!_didIteratorError9) {
                            _context5.next = 84;
                            break;
                        }

                        throw _iteratorError9;

                    case 84:
                        return _context5.finish(81);

                    case 85:
                        return _context5.finish(78);

                    case 86:
                        log.info('Done.');

                        log.info('Import categories...');
                        _context5.next = 90;
                        return _category2.default.all();

                    case 90:
                        existingCategories = _context5.sent;
                        existingCategoriesMap = new _map2.default();
                        _iteratorNormalCompletion10 = true;
                        _didIteratorError10 = false;
                        _iteratorError10 = undefined;
                        _context5.prev = 95;

                        for (_iterator10 = (0, _getIterator3.default)(existingCategories); !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
                            c = _step10.value;

                            existingCategoriesMap.set(c.title, c);
                        }

                        _context5.next = 103;
                        break;

                    case 99:
                        _context5.prev = 99;
                        _context5.t3 = _context5['catch'](95);
                        _didIteratorError10 = true;
                        _iteratorError10 = _context5.t3;

                    case 103:
                        _context5.prev = 103;
                        _context5.prev = 104;

                        if (!_iteratorNormalCompletion10 && _iterator10.return) {
                            _iterator10.return();
                        }

                    case 106:
                        _context5.prev = 106;

                        if (!_didIteratorError10) {
                            _context5.next = 109;
                            break;
                        }

                        throw _iteratorError10;

                    case 109:
                        return _context5.finish(106);

                    case 110:
                        return _context5.finish(103);

                    case 111:
                        categoryMap = {};
                        _iteratorNormalCompletion11 = true;
                        _didIteratorError11 = false;
                        _iteratorError11 = undefined;
                        _context5.prev = 115;
                        _iterator11 = (0, _getIterator3.default)(world.categories);

                    case 117:
                        if (_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done) {
                            _context5.next = 133;
                            break;
                        }

                        category = _step11.value;
                        catId = category.id;

                        delete category.id;

                        if (!existingCategoriesMap.has(category.title)) {
                            _context5.next = 126;
                            break;
                        }

                        existing = existingCategoriesMap.get(category.title);

                        categoryMap[catId] = existing.id;
                        _context5.next = 130;
                        break;

                    case 126:
                        _context5.next = 128;
                        return _category2.default.create(category);

                    case 128:
                        _created = _context5.sent;

                        categoryMap[catId] = _created.id;

                    case 130:
                        _iteratorNormalCompletion11 = true;
                        _context5.next = 117;
                        break;

                    case 133:
                        _context5.next = 139;
                        break;

                    case 135:
                        _context5.prev = 135;
                        _context5.t4 = _context5['catch'](115);
                        _didIteratorError11 = true;
                        _iteratorError11 = _context5.t4;

                    case 139:
                        _context5.prev = 139;
                        _context5.prev = 140;

                        if (!_iteratorNormalCompletion11 && _iterator11.return) {
                            _iterator11.return();
                        }

                    case 142:
                        _context5.prev = 142;

                        if (!_didIteratorError11) {
                            _context5.next = 145;
                            break;
                        }

                        throw _iteratorError11;

                    case 145:
                        return _context5.finish(142);

                    case 146:
                        return _context5.finish(139);

                    case 147:
                        log.info('Done.');

                        log.info('Import operation types...');
                        _context5.next = 151;
                        return _operationtype2.default.all();

                    case 151:
                        existingTypes = _context5.sent;
                        existingTypesMap = new _map2.default();
                        _iteratorNormalCompletion12 = true;
                        _didIteratorError12 = false;
                        _iteratorError12 = undefined;
                        _context5.prev = 156;

                        for (_iterator12 = (0, _getIterator3.default)(existingTypes); !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
                            t = _step12.value;

                            existingTypesMap.set(+t.weboobvalue, t);
                        }

                        _context5.next = 164;
                        break;

                    case 160:
                        _context5.prev = 160;
                        _context5.t5 = _context5['catch'](156);
                        _didIteratorError12 = true;
                        _iteratorError12 = _context5.t5;

                    case 164:
                        _context5.prev = 164;
                        _context5.prev = 165;

                        if (!_iteratorNormalCompletion12 && _iterator12.return) {
                            _iterator12.return();
                        }

                    case 167:
                        _context5.prev = 167;

                        if (!_didIteratorError12) {
                            _context5.next = 170;
                            break;
                        }

                        throw _iteratorError12;

                    case 170:
                        return _context5.finish(167);

                    case 171:
                        return _context5.finish(164);

                    case 172:
                        opTypeMap = {};
                        _iteratorNormalCompletion13 = true;
                        _didIteratorError13 = false;
                        _iteratorError13 = undefined;
                        _context5.prev = 176;
                        _iterator13 = (0, _getIterator3.default)(world.operationtypes);

                    case 178:
                        if (_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done) {
                            _context5.next = 194;
                            break;
                        }

                        type = _step13.value;
                        opTypeId = type.id;

                        delete type.id;

                        if (!existingTypesMap.has(+type.weboobvalue)) {
                            _context5.next = 187;
                            break;
                        }

                        _existing = existingTypesMap.get(+type.weboobvalue);

                        opTypeMap[opTypeId] = _existing.id;
                        _context5.next = 191;
                        break;

                    case 187:
                        _context5.next = 189;
                        return _operationtype2.default.create(type);

                    case 189:
                        _created2 = _context5.sent;

                        opTypeMap[opTypeId] = _created2.id;

                    case 191:
                        _iteratorNormalCompletion13 = true;
                        _context5.next = 178;
                        break;

                    case 194:
                        _context5.next = 200;
                        break;

                    case 196:
                        _context5.prev = 196;
                        _context5.t6 = _context5['catch'](176);
                        _didIteratorError13 = true;
                        _iteratorError13 = _context5.t6;

                    case 200:
                        _context5.prev = 200;
                        _context5.prev = 201;

                        if (!_iteratorNormalCompletion13 && _iterator13.return) {
                            _iterator13.return();
                        }

                    case 203:
                        _context5.prev = 203;

                        if (!_didIteratorError13) {
                            _context5.next = 206;
                            break;
                        }

                        throw _iteratorError13;

                    case 206:
                        return _context5.finish(203);

                    case 207:
                        return _context5.finish(200);

                    case 208:
                        log.info('Done.');

                        log.info('Import operations...');
                        _iteratorNormalCompletion14 = true;
                        _didIteratorError14 = false;
                        _iteratorError14 = undefined;
                        _context5.prev = 213;
                        _iterator14 = (0, _getIterator3.default)(world.operations);

                    case 215:
                        if (_iteratorNormalCompletion14 = (_step14 = _iterator14.next()).done) {
                            _context5.next = 232;
                            break;
                        }

                        op = _step14.value;
                        categoryId = op.categoryId;

                        if (!(typeof categoryId !== 'undefined')) {
                            _context5.next = 222;
                            break;
                        }

                        if (categoryMap[categoryId]) {
                            _context5.next = 221;
                            break;
                        }

                        throw new _helpers.KError('unknown category ' + categoryId, 400);

                    case 221:
                        op.categoryId = categoryMap[categoryId];

                    case 222:
                        operationTypeID = op.operationTypeID;

                        if (!(typeof operationTypeID !== 'undefined')) {
                            _context5.next = 227;
                            break;
                        }

                        if (opTypeMap[operationTypeID]) {
                            _context5.next = 226;
                            break;
                        }

                        throw new _helpers.KError('unknown type ' + op.operationTypeID, 400);

                    case 226:
                        op.operationTypeID = opTypeMap[operationTypeID];

                    case 227:
                        _context5.next = 229;
                        return _operation2.default.create(op);

                    case 229:
                        _iteratorNormalCompletion14 = true;
                        _context5.next = 215;
                        break;

                    case 232:
                        _context5.next = 238;
                        break;

                    case 234:
                        _context5.prev = 234;
                        _context5.t7 = _context5['catch'](213);
                        _didIteratorError14 = true;
                        _iteratorError14 = _context5.t7;

                    case 238:
                        _context5.prev = 238;
                        _context5.prev = 239;

                        if (!_iteratorNormalCompletion14 && _iterator14.return) {
                            _iterator14.return();
                        }

                    case 241:
                        _context5.prev = 241;

                        if (!_didIteratorError14) {
                            _context5.next = 244;
                            break;
                        }

                        throw _iteratorError14;

                    case 244:
                        return _context5.finish(241);

                    case 245:
                        return _context5.finish(238);

                    case 246:
                        log.info('Done.');

                        log.info('Import settings...');
                        _iteratorNormalCompletion15 = true;
                        _didIteratorError15 = false;
                        _iteratorError15 = undefined;
                        _context5.prev = 251;
                        _iterator15 = (0, _getIterator3.default)(world.settings);

                    case 253:
                        if (_iteratorNormalCompletion15 = (_step15 = _iterator15.next()).done) {
                            _context5.next = 262;
                            break;
                        }

                        setting = _step15.value;

                        if (!(setting.name === 'weboob-log' || setting.name === 'weboob-installed')) {
                            _context5.next = 257;
                            break;
                        }

                        return _context5.abrupt('continue', 259);

                    case 257:
                        _context5.next = 259;
                        return _config2.default.findOrCreateByName(setting.name, setting.value);

                    case 259:
                        _iteratorNormalCompletion15 = true;
                        _context5.next = 253;
                        break;

                    case 262:
                        _context5.next = 268;
                        break;

                    case 264:
                        _context5.prev = 264;
                        _context5.t8 = _context5['catch'](251);
                        _didIteratorError15 = true;
                        _iteratorError15 = _context5.t8;

                    case 268:
                        _context5.prev = 268;
                        _context5.prev = 269;

                        if (!_iteratorNormalCompletion15 && _iterator15.return) {
                            _iterator15.return();
                        }

                    case 271:
                        _context5.prev = 271;

                        if (!_didIteratorError15) {
                            _context5.next = 274;
                            break;
                        }

                        throw _iteratorError15;

                    case 274:
                        return _context5.finish(271);

                    case 275:
                        return _context5.finish(268);

                    case 276:
                        log.info('Done.');

                        log.info('Import alerts...');
                        _iteratorNormalCompletion16 = true;
                        _didIteratorError16 = false;
                        _iteratorError16 = undefined;
                        _context5.prev = 281;
                        _iterator16 = (0, _getIterator3.default)(world.alerts);

                    case 283:
                        if (_iteratorNormalCompletion16 = (_step16 = _iterator16.next()).done) {
                            _context5.next = 290;
                            break;
                        }

                        a = _step16.value;
                        _context5.next = 287;
                        return _alert2.default.create(a);

                    case 287:
                        _iteratorNormalCompletion16 = true;
                        _context5.next = 283;
                        break;

                    case 290:
                        _context5.next = 296;
                        break;

                    case 292:
                        _context5.prev = 292;
                        _context5.t9 = _context5['catch'](281);
                        _didIteratorError16 = true;
                        _iteratorError16 = _context5.t9;

                    case 296:
                        _context5.prev = 296;
                        _context5.prev = 297;

                        if (!_iteratorNormalCompletion16 && _iterator16.return) {
                            _iterator16.return();
                        }

                    case 299:
                        _context5.prev = 299;

                        if (!_didIteratorError16) {
                            _context5.next = 302;
                            break;
                        }

                        throw _iteratorError16;

                    case 302:
                        return _context5.finish(299);

                    case 303:
                        return _context5.finish(296);

                    case 304:
                        log.info('Done.');

                        log.info('Running migrations...');
                        _context5.next = 308;
                        return (0, _migrations.run)();

                    case 308:
                        log.info('Done.');

                        log.info('Import finished with success!');
                        res.sendStatus(200);
                        _context5.next = 316;
                        break;

                    case 313:
                        _context5.prev = 313;
                        _context5.t10 = _context5['catch'](0);
                        return _context5.abrupt('return', (0, _helpers.asyncErr)(res, _context5.t10, 'when importing data'));

                    case 316:
                    case 'end':
                        return _context5.stop();
                }
            }
        }, _callee5, this, [[0, 313], [8, 12], [28, 43, 47, 55], [48,, 50, 54], [60, 74, 78, 86], [79,, 81, 85], [95, 99, 103, 111], [104,, 106, 110], [115, 135, 139, 147], [140,, 142, 146], [156, 160, 164, 172], [165,, 167, 171], [176, 196, 200, 208], [201,, 203, 207], [213, 234, 238, 246], [239,, 241, 245], [251, 264, 268, 276], [269,, 271, 275], [281, 292, 296, 304], [297,, 299, 303]]);
    }));

    return function (_x7, _x8) {
        return _ref5.apply(this, arguments);
    };
}();