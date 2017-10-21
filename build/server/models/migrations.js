'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.run = undefined;

// For a given access, retrieves the custom fields and gives them to the
// changeFn, which must return a new version of the custom fields (deleted
// fields won't be kept in database). After which they're saved (it's not
// changeFn's responsability to call save/updateAttributes).
var updateCustomFields = function () {
    var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(access, changeFn) {
        var originalCustomFields, newCustomFields, pairToString, buildSig, needsUpdate, originalSignature, newSignature;
        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        originalCustomFields = JSON.parse(access.customFields || '[]');

                        // "deep copy", lol

                        newCustomFields = JSON.parse(access.customFields || '[]');

                        newCustomFields = changeFn(newCustomFields);

                        pairToString = function pairToString(pair) {
                            return pair.name + ':' + pair.value;
                        };

                        buildSig = function buildSig(fields) {
                            return fields.map(pairToString).join('/');
                        };

                        needsUpdate = false;

                        if (originalCustomFields.length !== newCustomFields.length) {
                            // If one has more fields than the other, update.
                            needsUpdate = true;
                        } else {
                            // If the name:value/name2:value2 strings are different, update.
                            originalSignature = buildSig(originalCustomFields);
                            newSignature = buildSig(newCustomFields);

                            needsUpdate = originalSignature !== newSignature;
                        }

                        if (!needsUpdate) {
                            _context.next = 11;
                            break;
                        }

                        log.debug('updating custom fields for ' + access.id);
                        _context.next = 11;
                        return access.updateAttributes({
                            customFields: JSON.stringify(newCustomFields)
                        });

                    case 11:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));

    return function updateCustomFields(_x, _x2) {
        return _ref.apply(this, arguments);
    };
}();

/**
 * Run all the required migrations.
 *
 * To determine whether a migration has to be run or not, we are comparing its
 * index in the migrations Array above with the `migration-version` config
 * value, which indicates the next migration to run.
 */
var run = exports.run = function () {
    var _ref17 = _asyncToGenerator(regeneratorRuntime.mark(function _callee16() {
        var migrationVersion, cache, firstMigrationIndex, m;
        return regeneratorRuntime.wrap(function _callee16$(_context16) {
            while (1) {
                switch (_context16.prev = _context16.next) {
                    case 0:
                        _context16.next = 2;
                        return _config2.default.findOrCreateDefault('migration-version');

                    case 2:
                        migrationVersion = _context16.sent;


                        // Cache to prevent loading multiple times the same data from the db.
                        cache = {};
                        firstMigrationIndex = parseInt(migrationVersion.value, 10);
                        m = firstMigrationIndex;

                    case 6:
                        if (!(m < migrations.length)) {
                            _context16.next = 15;
                            break;
                        }

                        _context16.next = 9;
                        return migrations[m](cache);

                    case 9:

                        migrationVersion.value = (m + 1).toString();
                        _context16.next = 12;
                        return migrationVersion.save();

                    case 12:
                        m++;
                        _context16.next = 6;
                        break;

                    case 15:
                    case 'end':
                        return _context16.stop();
                }
            }
        }, _callee16, this);
    }));

    return function run() {
        return _ref17.apply(this, arguments);
    };
}();

var _access = require('./access');

var _access2 = _interopRequireDefault(_access);

var _account = require('./account');

var _account2 = _interopRequireDefault(_account);

var _alert = require('./alert');

var _alert2 = _interopRequireDefault(_alert);

var _bank = require('./bank');

var _bank2 = _interopRequireDefault(_bank);

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

var _operation = require('./operation');

var _operation2 = _interopRequireDefault(_operation);

var _category = require('./category');

var _category2 = _interopRequireDefault(_category);

var _operationtype = require('./operationtype');

var _operationtype2 = _interopRequireDefault(_operationtype);

var _helpers = require('../helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var log = (0, _helpers.makeLogger)('models/migrations');

function reduceOperationsDate(oldest, operation) {
    return Math.min(oldest, +new Date(operation.dateImport));
}

/**
 * This is an array of all the migrations to apply on the database, in order to
 * automatically keep database schema in sync with Kresus code.
 *
 * _Note_: As only the necessary migrations are run at each startup, you should
 * NEVER update a given migration, but instead add a new migration to reflect
 * the changes you want to apply on the db. Updating an existing migration
 * might not update the database as expected.
 */
var migrations = [function () {
    var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2() {
        var weboobLog, weboobInstalled;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        log.info('Removing weboob-log and weboob-installed from the db...');
                        _context2.next = 3;
                        return _config2.default.byName('weboob-log');

                    case 3:
                        weboobLog = _context2.sent;

                        if (!weboobLog) {
                            _context2.next = 8;
                            break;
                        }

                        log.info('\tDestroying Config[weboob-log].');
                        _context2.next = 8;
                        return weboobLog.destroy();

                    case 8:
                        _context2.next = 10;
                        return _config2.default.byName('weboob-installed');

                    case 10:
                        weboobInstalled = _context2.sent;

                        if (!weboobInstalled) {
                            _context2.next = 15;
                            break;
                        }

                        log.info('\tDestroying Config[weboob-installed].');
                        _context2.next = 15;
                        return weboobInstalled.destroy();

                    case 15:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, this);
    }));

    function m0() {
        return _ref2.apply(this, arguments);
    }

    return m0;
}(), function () {
    var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(cache) {
        var categorySet, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, c, catNum, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, op, needsSave;

        return regeneratorRuntime.wrap(function _callee3$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        log.info('Checking that operations with categories are consistent...');

                        _context3.t0 = cache.operations;

                        if (_context3.t0) {
                            _context3.next = 6;
                            break;
                        }

                        _context3.next = 5;
                        return _operation2.default.all();

                    case 5:
                        _context3.t0 = _context3.sent;

                    case 6:
                        cache.operations = _context3.t0;
                        _context3.t1 = cache.categories;

                        if (_context3.t1) {
                            _context3.next = 12;
                            break;
                        }

                        _context3.next = 11;
                        return _category2.default.all();

                    case 11:
                        _context3.t1 = _context3.sent;

                    case 12:
                        cache.categories = _context3.t1;
                        categorySet = new Set();
                        _iteratorNormalCompletion = true;
                        _didIteratorError = false;
                        _iteratorError = undefined;
                        _context3.prev = 17;

                        for (_iterator = cache.categories[Symbol.iterator](); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                            c = _step.value;

                            categorySet.add(c.id);
                        }

                        _context3.next = 25;
                        break;

                    case 21:
                        _context3.prev = 21;
                        _context3.t2 = _context3['catch'](17);
                        _didIteratorError = true;
                        _iteratorError = _context3.t2;

                    case 25:
                        _context3.prev = 25;
                        _context3.prev = 26;

                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }

                    case 28:
                        _context3.prev = 28;

                        if (!_didIteratorError) {
                            _context3.next = 31;
                            break;
                        }

                        throw _iteratorError;

                    case 31:
                        return _context3.finish(28);

                    case 32:
                        return _context3.finish(25);

                    case 33:
                        catNum = 0;
                        _iteratorNormalCompletion2 = true;
                        _didIteratorError2 = false;
                        _iteratorError2 = undefined;
                        _context3.prev = 37;
                        _iterator2 = cache.operations[Symbol.iterator]();

                    case 39:
                        if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
                            _context3.next = 49;
                            break;
                        }

                        op = _step2.value;
                        needsSave = false;


                        if (typeof op.categoryId !== 'undefined' && !categorySet.has(op.categoryId)) {
                            needsSave = true;
                            delete op.categoryId;
                            catNum += 1;
                        }

                        if (!needsSave) {
                            _context3.next = 46;
                            break;
                        }

                        _context3.next = 46;
                        return op.save();

                    case 46:
                        _iteratorNormalCompletion2 = true;
                        _context3.next = 39;
                        break;

                    case 49:
                        _context3.next = 55;
                        break;

                    case 51:
                        _context3.prev = 51;
                        _context3.t3 = _context3['catch'](37);
                        _didIteratorError2 = true;
                        _iteratorError2 = _context3.t3;

                    case 55:
                        _context3.prev = 55;
                        _context3.prev = 56;

                        if (!_iteratorNormalCompletion2 && _iterator2.return) {
                            _iterator2.return();
                        }

                    case 58:
                        _context3.prev = 58;

                        if (!_didIteratorError2) {
                            _context3.next = 61;
                            break;
                        }

                        throw _iteratorError2;

                    case 61:
                        return _context3.finish(58);

                    case 62:
                        return _context3.finish(55);

                    case 63:

                        if (catNum) log.info('\t' + catNum + ' operations had an inconsistent category.');

                    case 64:
                    case 'end':
                        return _context3.stop();
                }
            }
        }, _callee3, this, [[17, 21, 25, 33], [26,, 28, 32], [37, 51, 55, 63], [56,, 58, 62]]);
    }));

    function m1(_x3) {
        return _ref3.apply(this, arguments);
    }

    return m1;
}(), function () {
    var _ref4 = _asyncToGenerator(regeneratorRuntime.mark(function _callee4(cache) {
        var num, _iteratorNormalCompletion3, _didIteratorError3, _iteratorError3, _iterator3, _step3, o;

        return regeneratorRuntime.wrap(function _callee4$(_context4) {
            while (1) {
                switch (_context4.prev = _context4.next) {
                    case 0:
                        log.info('Replacing NONE_CATEGORY_ID by undefined...');

                        _context4.t0 = cache.operations;

                        if (_context4.t0) {
                            _context4.next = 6;
                            break;
                        }

                        _context4.next = 5;
                        return _operation2.default.all();

                    case 5:
                        _context4.t0 = _context4.sent;

                    case 6:
                        cache.operations = _context4.t0;
                        num = 0;
                        _iteratorNormalCompletion3 = true;
                        _didIteratorError3 = false;
                        _iteratorError3 = undefined;
                        _context4.prev = 11;
                        _iterator3 = cache.operations[Symbol.iterator]();

                    case 13:
                        if (_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done) {
                            _context4.next = 23;
                            break;
                        }

                        o = _step3.value;

                        if (!(typeof o.categoryId !== 'undefined' && o.categoryId.toString() === '-1')) {
                            _context4.next = 20;
                            break;
                        }

                        delete o.categoryId;
                        _context4.next = 19;
                        return o.save();

                    case 19:
                        num += 1;

                    case 20:
                        _iteratorNormalCompletion3 = true;
                        _context4.next = 13;
                        break;

                    case 23:
                        _context4.next = 29;
                        break;

                    case 25:
                        _context4.prev = 25;
                        _context4.t1 = _context4['catch'](11);
                        _didIteratorError3 = true;
                        _iteratorError3 = _context4.t1;

                    case 29:
                        _context4.prev = 29;
                        _context4.prev = 30;

                        if (!_iteratorNormalCompletion3 && _iterator3.return) {
                            _iterator3.return();
                        }

                    case 32:
                        _context4.prev = 32;

                        if (!_didIteratorError3) {
                            _context4.next = 35;
                            break;
                        }

                        throw _iteratorError3;

                    case 35:
                        return _context4.finish(32);

                    case 36:
                        return _context4.finish(29);

                    case 37:

                        if (num) log.info('\t' + num + ' operations had -1 as categoryId.');

                    case 38:
                    case 'end':
                        return _context4.stop();
                }
            }
        }, _callee4, this, [[11, 25, 29, 37], [30,, 32, 36]]);
    }));

    function m2(_x4) {
        return _ref4.apply(this, arguments);
    }

    return m2;
}(), function () {
    var _ref5 = _asyncToGenerator(regeneratorRuntime.mark(function _callee5(cache) {
        var num, updateFields, _iteratorNormalCompletion4, _didIteratorError4, _iteratorError4, _iterator4, _step4, a, website;

        return regeneratorRuntime.wrap(function _callee5$(_context5) {
            while (1) {
                switch (_context5.prev = _context5.next) {
                    case 0:
                        log.info('Migrating websites to the customFields format...');

                        _context5.t0 = cache.accesses;

                        if (_context5.t0) {
                            _context5.next = 6;
                            break;
                        }

                        _context5.next = 5;
                        return _access2.default.all();

                    case 5:
                        _context5.t0 = _context5.sent;

                    case 6:
                        cache.accesses = _context5.t0;
                        num = 0;

                        updateFields = function updateFields(website) {
                            return function (customFields) {
                                if (customFields.filter(function (field) {
                                    return field.name === 'website';
                                }).length) return customFields;

                                customFields.push({
                                    name: 'website',
                                    value: website
                                });

                                return customFields;
                            };
                        };

                        _iteratorNormalCompletion4 = true;
                        _didIteratorError4 = false;
                        _iteratorError4 = undefined;
                        _context5.prev = 12;
                        _iterator4 = cache.accesses[Symbol.iterator]();

                    case 14:
                        if (_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done) {
                            _context5.next = 28;
                            break;
                        }

                        a = _step4.value;

                        if (!(typeof a.website === 'undefined' || !a.website.length)) {
                            _context5.next = 18;
                            break;
                        }

                        return _context5.abrupt('continue', 25);

                    case 18:
                        website = a.website;

                        delete a.website;

                        _context5.next = 22;
                        return updateCustomFields(a, updateFields(website));

                    case 22:
                        _context5.next = 24;
                        return a.save();

                    case 24:
                        num += 1;

                    case 25:
                        _iteratorNormalCompletion4 = true;
                        _context5.next = 14;
                        break;

                    case 28:
                        _context5.next = 34;
                        break;

                    case 30:
                        _context5.prev = 30;
                        _context5.t1 = _context5['catch'](12);
                        _didIteratorError4 = true;
                        _iteratorError4 = _context5.t1;

                    case 34:
                        _context5.prev = 34;
                        _context5.prev = 35;

                        if (!_iteratorNormalCompletion4 && _iterator4.return) {
                            _iterator4.return();
                        }

                    case 37:
                        _context5.prev = 37;

                        if (!_didIteratorError4) {
                            _context5.next = 40;
                            break;
                        }

                        throw _iteratorError4;

                    case 40:
                        return _context5.finish(37);

                    case 41:
                        return _context5.finish(34);

                    case 42:

                        if (num) log.info('\t' + num + ' accesses updated to the customFields format.');

                    case 43:
                    case 'end':
                        return _context5.stop();
                }
            }
        }, _callee5, this, [[12, 30, 34, 42], [35,, 37, 41]]);
    }));

    function m3(_x5) {
        return _ref5.apply(this, arguments);
    }

    return m3;
}(), function () {
    var _ref6 = _asyncToGenerator(regeneratorRuntime.mark(function _callee6(cache) {
        var updateFieldsBnp, updateFieldsHelloBank, _iteratorNormalCompletion5, _didIteratorError5, _iteratorError5, _iterator5, _step5, a, accounts, _iteratorNormalCompletion6, _didIteratorError6, _iteratorError6, _iterator6, _step6, acc;

        return regeneratorRuntime.wrap(function _callee6$(_context6) {
            while (1) {
                switch (_context6.prev = _context6.next) {
                    case 0:
                        log.info('Migrating HelloBank users to BNP and BNP users to the new website format.');

                        _context6.t0 = cache.accesses;

                        if (_context6.t0) {
                            _context6.next = 6;
                            break;
                        }

                        _context6.next = 5;
                        return _access2.default.all();

                    case 5:
                        _context6.t0 = _context6.sent;

                    case 6:
                        cache.accesses = _context6.t0;

                        updateFieldsBnp = function updateFieldsBnp(customFields) {
                            if (customFields.filter(function (field) {
                                return field.name === 'website';
                            }).length) return customFields;

                            customFields.push({
                                name: 'website',
                                value: 'pp'
                            });

                            log.info('\tBNP access updated to the new website format.');
                            return customFields;
                        };

                        updateFieldsHelloBank = function updateFieldsHelloBank(customFields) {
                            customFields.push({
                                name: 'website',
                                value: 'hbank'
                            });
                            return customFields;
                        };

                        _iteratorNormalCompletion5 = true;
                        _didIteratorError5 = false;
                        _iteratorError5 = undefined;
                        _context6.prev = 12;
                        _iterator5 = cache.accesses[Symbol.iterator]();

                    case 14:
                        if (_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done) {
                            _context6.next = 59;
                            break;
                        }

                        a = _step5.value;

                        if (!(a.bank === 'bnporc')) {
                            _context6.next = 20;
                            break;
                        }

                        _context6.next = 19;
                        return updateCustomFields(a, updateFieldsBnp);

                    case 19:
                        return _context6.abrupt('continue', 56);

                    case 20:
                        if (!(a.bank === 'hellobank')) {
                            _context6.next = 56;
                            break;
                        }

                        _context6.next = 23;
                        return updateCustomFields(a, updateFieldsHelloBank);

                    case 23:
                        _context6.next = 25;
                        return _account2.default.byBank({ uuid: 'hellobank' });

                    case 25:
                        accounts = _context6.sent;
                        _iteratorNormalCompletion6 = true;
                        _didIteratorError6 = false;
                        _iteratorError6 = undefined;
                        _context6.prev = 29;
                        _iterator6 = accounts[Symbol.iterator]();

                    case 31:
                        if (_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done) {
                            _context6.next = 38;
                            break;
                        }

                        acc = _step6.value;
                        _context6.next = 35;
                        return acc.updateAttributes({ bank: 'bnporc' });

                    case 35:
                        _iteratorNormalCompletion6 = true;
                        _context6.next = 31;
                        break;

                    case 38:
                        _context6.next = 44;
                        break;

                    case 40:
                        _context6.prev = 40;
                        _context6.t1 = _context6['catch'](29);
                        _didIteratorError6 = true;
                        _iteratorError6 = _context6.t1;

                    case 44:
                        _context6.prev = 44;
                        _context6.prev = 45;

                        if (!_iteratorNormalCompletion6 && _iterator6.return) {
                            _iterator6.return();
                        }

                    case 47:
                        _context6.prev = 47;

                        if (!_didIteratorError6) {
                            _context6.next = 50;
                            break;
                        }

                        throw _iteratorError6;

                    case 50:
                        return _context6.finish(47);

                    case 51:
                        return _context6.finish(44);

                    case 52:
                        _context6.next = 54;
                        return a.updateAttributes({ bank: 'bnporc' });

                    case 54:
                        log.info("\tHelloBank access updated to use BNP's backend.");
                        return _context6.abrupt('continue', 56);

                    case 56:
                        _iteratorNormalCompletion5 = true;
                        _context6.next = 14;
                        break;

                    case 59:
                        _context6.next = 65;
                        break;

                    case 61:
                        _context6.prev = 61;
                        _context6.t2 = _context6['catch'](12);
                        _didIteratorError5 = true;
                        _iteratorError5 = _context6.t2;

                    case 65:
                        _context6.prev = 65;
                        _context6.prev = 66;

                        if (!_iteratorNormalCompletion5 && _iterator5.return) {
                            _iterator5.return();
                        }

                    case 68:
                        _context6.prev = 68;

                        if (!_didIteratorError5) {
                            _context6.next = 71;
                            break;
                        }

                        throw _iteratorError5;

                    case 71:
                        return _context6.finish(68);

                    case 72:
                        return _context6.finish(65);

                    case 73:
                    case 'end':
                        return _context6.stop();
                }
            }
        }, _callee6, this, [[12, 61, 65, 73], [29, 40, 44, 52], [45,, 47, 51], [66,, 68, 72]]);
    }));

    function m4(_x6) {
        return _ref6.apply(this, arguments);
    }

    return m4;
}(), function () {
    var _ref7 = _asyncToGenerator(regeneratorRuntime.mark(function _callee7(cache) {
        var _iteratorNormalCompletion7, _didIteratorError7, _iteratorError7, _iterator7, _step7, a, ops, dateNumber;

        return regeneratorRuntime.wrap(function _callee7$(_context7) {
            while (1) {
                switch (_context7.prev = _context7.next) {
                    case 0:
                        log.info('Ensure "importDate" field is present in accounts.');

                        _context7.t0 = cache.accounts;

                        if (_context7.t0) {
                            _context7.next = 6;
                            break;
                        }

                        _context7.next = 5;
                        return _account2.default.all();

                    case 5:
                        _context7.t0 = _context7.sent;

                    case 6:
                        cache.accounts = _context7.t0;
                        _iteratorNormalCompletion7 = true;
                        _didIteratorError7 = false;
                        _iteratorError7 = undefined;
                        _context7.prev = 10;
                        _iterator7 = cache.accounts[Symbol.iterator]();

                    case 12:
                        if (_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done) {
                            _context7.next = 29;
                            break;
                        }

                        a = _step7.value;

                        if (!(typeof a.importDate !== 'undefined')) {
                            _context7.next = 16;
                            break;
                        }

                        return _context7.abrupt('continue', 26);

                    case 16:

                        log.info('\t' + a.accountNumber + ' has no importDate.');

                        _context7.next = 19;
                        return _operation2.default.byAccount(a);

                    case 19:
                        ops = _context7.sent;
                        dateNumber = Date.now();

                        if (ops.length) {
                            dateNumber = ops.reduce(reduceOperationsDate, Date.now());
                        }

                        a.importDate = new Date(dateNumber);
                        _context7.next = 25;
                        return a.save();

                    case 25:

                        log.info('\tImport date for ' + a.title + ' (' + a.accountNumber + '): ' + a.importDate);

                    case 26:
                        _iteratorNormalCompletion7 = true;
                        _context7.next = 12;
                        break;

                    case 29:
                        _context7.next = 35;
                        break;

                    case 31:
                        _context7.prev = 31;
                        _context7.t1 = _context7['catch'](10);
                        _didIteratorError7 = true;
                        _iteratorError7 = _context7.t1;

                    case 35:
                        _context7.prev = 35;
                        _context7.prev = 36;

                        if (!_iteratorNormalCompletion7 && _iterator7.return) {
                            _iterator7.return();
                        }

                    case 38:
                        _context7.prev = 38;

                        if (!_didIteratorError7) {
                            _context7.next = 41;
                            break;
                        }

                        throw _iteratorError7;

                    case 41:
                        return _context7.finish(38);

                    case 42:
                        return _context7.finish(35);

                    case 43:
                    case 'end':
                        return _context7.stop();
                }
            }
        }, _callee7, this, [[10, 31, 35, 43], [36,, 38, 42]]);
    }));

    function m5(_x7) {
        return _ref7.apply(this, arguments);
    }

    return m5;
}(), function () {
    var _ref8 = _asyncToGenerator(regeneratorRuntime.mark(function _callee8(cache) {
        var operations, typeMap, _iteratorNormalCompletion8, _didIteratorError8, _iteratorError8, _iterator8, _step8, _ref9, id, name, _iteratorNormalCompletion9, _didIteratorError9, _iteratorError9, _iterator9, _step9, operation, _iteratorNormalCompletion10, _didIteratorError10, _iteratorError10, _iterator10, _step10, type;

        return regeneratorRuntime.wrap(function _callee8$(_context8) {
            while (1) {
                switch (_context8.prev = _context8.next) {
                    case 0:
                        log.info('Migrate operationTypeId to type field...');
                        _context8.prev = 1;
                        _context8.t0 = cache.types;

                        if (_context8.t0) {
                            _context8.next = 7;
                            break;
                        }

                        _context8.next = 6;
                        return _operationtype2.default.all();

                    case 6:
                        _context8.t0 = _context8.sent;

                    case 7:
                        cache.types = _context8.t0;

                        if (!cache.types.length) {
                            _context8.next = 88;
                            break;
                        }

                        _context8.next = 11;
                        return _operation2.default.allWithOperationTypesId();

                    case 11:
                        operations = _context8.sent;

                        log.info(operations.length + ' operations to migrate');
                        typeMap = new Map();
                        _iteratorNormalCompletion8 = true;
                        _didIteratorError8 = false;
                        _iteratorError8 = undefined;
                        _context8.prev = 17;

                        for (_iterator8 = cache.types[Symbol.iterator](); !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
                            _ref9 = _step8.value;
                            id = _ref9.id, name = _ref9.name;

                            typeMap.set(id, name);
                        }

                        _context8.next = 25;
                        break;

                    case 21:
                        _context8.prev = 21;
                        _context8.t1 = _context8['catch'](17);
                        _didIteratorError8 = true;
                        _iteratorError8 = _context8.t1;

                    case 25:
                        _context8.prev = 25;
                        _context8.prev = 26;

                        if (!_iteratorNormalCompletion8 && _iterator8.return) {
                            _iterator8.return();
                        }

                    case 28:
                        _context8.prev = 28;

                        if (!_didIteratorError8) {
                            _context8.next = 31;
                            break;
                        }

                        throw _iteratorError8;

                    case 31:
                        return _context8.finish(28);

                    case 32:
                        return _context8.finish(25);

                    case 33:
                        _iteratorNormalCompletion9 = true;
                        _didIteratorError9 = false;
                        _iteratorError9 = undefined;
                        _context8.prev = 36;
                        _iterator9 = operations[Symbol.iterator]();

                    case 38:
                        if (_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done) {
                            _context8.next = 47;
                            break;
                        }

                        operation = _step9.value;

                        if (operation.operationTypeID && typeMap.has(operation.operationTypeID)) {
                            operation.type = typeMap.get(operation.operationTypeID);
                        } else {
                            operation.type = _helpers.UNKNOWN_OPERATION_TYPE;
                        }
                        delete operation.operationTypeID;
                        _context8.next = 44;
                        return operation.save();

                    case 44:
                        _iteratorNormalCompletion9 = true;
                        _context8.next = 38;
                        break;

                    case 47:
                        _context8.next = 53;
                        break;

                    case 49:
                        _context8.prev = 49;
                        _context8.t2 = _context8['catch'](36);
                        _didIteratorError9 = true;
                        _iteratorError9 = _context8.t2;

                    case 53:
                        _context8.prev = 53;
                        _context8.prev = 54;

                        if (!_iteratorNormalCompletion9 && _iterator9.return) {
                            _iterator9.return();
                        }

                    case 56:
                        _context8.prev = 56;

                        if (!_didIteratorError9) {
                            _context8.next = 59;
                            break;
                        }

                        throw _iteratorError9;

                    case 59:
                        return _context8.finish(56);

                    case 60:
                        return _context8.finish(53);

                    case 61:

                        // Delete operation types
                        _iteratorNormalCompletion10 = true;
                        _didIteratorError10 = false;
                        _iteratorError10 = undefined;
                        _context8.prev = 64;
                        _iterator10 = cache.types[Symbol.iterator]();

                    case 66:
                        if (_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done) {
                            _context8.next = 73;
                            break;
                        }

                        type = _step10.value;
                        _context8.next = 70;
                        return type.destroy();

                    case 70:
                        _iteratorNormalCompletion10 = true;
                        _context8.next = 66;
                        break;

                    case 73:
                        _context8.next = 79;
                        break;

                    case 75:
                        _context8.prev = 75;
                        _context8.t3 = _context8['catch'](64);
                        _didIteratorError10 = true;
                        _iteratorError10 = _context8.t3;

                    case 79:
                        _context8.prev = 79;
                        _context8.prev = 80;

                        if (!_iteratorNormalCompletion10 && _iterator10.return) {
                            _iterator10.return();
                        }

                    case 82:
                        _context8.prev = 82;

                        if (!_didIteratorError10) {
                            _context8.next = 85;
                            break;
                        }

                        throw _iteratorError10;

                    case 85:
                        return _context8.finish(82);

                    case 86:
                        return _context8.finish(79);

                    case 87:
                        delete cache.types;

                    case 88:
                        _context8.next = 93;
                        break;

                    case 90:
                        _context8.prev = 90;
                        _context8.t4 = _context8['catch'](1);

                        log.error('Error while updating operation type: ' + _context8.t4);

                    case 93:
                    case 'end':
                        return _context8.stop();
                }
            }
        }, _callee8, this, [[1, 90], [17, 21, 25, 33], [26,, 28, 32], [36, 49, 53, 61], [54,, 56, 60], [64, 75, 79, 87], [80,, 82, 86]]);
    }));

    function m6(_x8) {
        return _ref8.apply(this, arguments);
    }

    return m6;
}(), function () {
    var _ref10 = _asyncToGenerator(regeneratorRuntime.mark(function _callee9(cache) {
        var accountSet, _iteratorNormalCompletion11, _didIteratorError11, _iteratorError11, _iterator11, _step11, account, numOrphans, _iteratorNormalCompletion12, _didIteratorError12, _iteratorError12, _iterator12, _step12, al;

        return regeneratorRuntime.wrap(function _callee9$(_context9) {
            while (1) {
                switch (_context9.prev = _context9.next) {
                    case 0:
                        log.info('Ensuring consistency of accounts with alerts...');

                        _context9.prev = 1;
                        accountSet = new Set();
                        _context9.t0 = cache.accounts;

                        if (_context9.t0) {
                            _context9.next = 8;
                            break;
                        }

                        _context9.next = 7;
                        return _account2.default.all();

                    case 7:
                        _context9.t0 = _context9.sent;

                    case 8:
                        cache.accounts = _context9.t0;
                        _context9.t1 = cache.alerts;

                        if (_context9.t1) {
                            _context9.next = 14;
                            break;
                        }

                        _context9.next = 13;
                        return _alert2.default.all();

                    case 13:
                        _context9.t1 = _context9.sent;

                    case 14:
                        cache.alerts = _context9.t1;
                        _iteratorNormalCompletion11 = true;
                        _didIteratorError11 = false;
                        _iteratorError11 = undefined;
                        _context9.prev = 18;


                        for (_iterator11 = cache.accounts[Symbol.iterator](); !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
                            account = _step11.value;

                            accountSet.add(account.accountNumber);
                        }

                        _context9.next = 26;
                        break;

                    case 22:
                        _context9.prev = 22;
                        _context9.t2 = _context9['catch'](18);
                        _didIteratorError11 = true;
                        _iteratorError11 = _context9.t2;

                    case 26:
                        _context9.prev = 26;
                        _context9.prev = 27;

                        if (!_iteratorNormalCompletion11 && _iterator11.return) {
                            _iterator11.return();
                        }

                    case 29:
                        _context9.prev = 29;

                        if (!_didIteratorError11) {
                            _context9.next = 32;
                            break;
                        }

                        throw _iteratorError11;

                    case 32:
                        return _context9.finish(29);

                    case 33:
                        return _context9.finish(26);

                    case 34:
                        numOrphans = 0;
                        _iteratorNormalCompletion12 = true;
                        _didIteratorError12 = false;
                        _iteratorError12 = undefined;
                        _context9.prev = 38;
                        _iterator12 = cache.alerts[Symbol.iterator]();

                    case 40:
                        if (_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done) {
                            _context9.next = 49;
                            break;
                        }

                        al = _step12.value;

                        if (accountSet.has(al.bankAccount)) {
                            _context9.next = 46;
                            break;
                        }

                        numOrphans++;
                        _context9.next = 46;
                        return al.destroy();

                    case 46:
                        _iteratorNormalCompletion12 = true;
                        _context9.next = 40;
                        break;

                    case 49:
                        _context9.next = 55;
                        break;

                    case 51:
                        _context9.prev = 51;
                        _context9.t3 = _context9['catch'](38);
                        _didIteratorError12 = true;
                        _iteratorError12 = _context9.t3;

                    case 55:
                        _context9.prev = 55;
                        _context9.prev = 56;

                        if (!_iteratorNormalCompletion12 && _iterator12.return) {
                            _iterator12.return();
                        }

                    case 58:
                        _context9.prev = 58;

                        if (!_didIteratorError12) {
                            _context9.next = 61;
                            break;
                        }

                        throw _iteratorError12;

                    case 61:
                        return _context9.finish(58);

                    case 62:
                        return _context9.finish(55);

                    case 63:
                        // Purge the alerts cache, next migration requiring it will rebuild
                        // an updated cache.
                        delete cache.alerts;

                        if (numOrphans) log.info('\tfound and removed ' + numOrphans + ' orphan alerts');
                        _context9.next = 70;
                        break;

                    case 67:
                        _context9.prev = 67;
                        _context9.t4 = _context9['catch'](1);

                        log.error('Error while ensuring consistency of alerts: ' + _context9.t4.toString());

                    case 70:
                    case 'end':
                        return _context9.stop();
                }
            }
        }, _callee9, this, [[1, 67], [18, 22, 26, 34], [27,, 29, 33], [38, 51, 55, 63], [56,, 58, 62]]);
    }));

    function m7(_x9) {
        return _ref10.apply(this, arguments);
    }

    return m7;
}(), function () {
    var _ref11 = _asyncToGenerator(regeneratorRuntime.mark(function _callee10(cache) {
        var _iteratorNormalCompletion13, _didIteratorError13, _iteratorError13, _iterator13, _step13, bank;

        return regeneratorRuntime.wrap(function _callee10$(_context10) {
            while (1) {
                switch (_context10.prev = _context10.next) {
                    case 0:
                        log.info('Deleting banks from database');
                        _context10.prev = 1;
                        _context10.t0 = cache.banks;

                        if (_context10.t0) {
                            _context10.next = 7;
                            break;
                        }

                        _context10.next = 6;
                        return _bank2.default.all();

                    case 6:
                        _context10.t0 = _context10.sent;

                    case 7:
                        cache.banks = _context10.t0;
                        _iteratorNormalCompletion13 = true;
                        _didIteratorError13 = false;
                        _iteratorError13 = undefined;
                        _context10.prev = 11;
                        _iterator13 = cache.banks[Symbol.iterator]();

                    case 13:
                        if (_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done) {
                            _context10.next = 20;
                            break;
                        }

                        bank = _step13.value;
                        _context10.next = 17;
                        return bank.destroy();

                    case 17:
                        _iteratorNormalCompletion13 = true;
                        _context10.next = 13;
                        break;

                    case 20:
                        _context10.next = 26;
                        break;

                    case 22:
                        _context10.prev = 22;
                        _context10.t1 = _context10['catch'](11);
                        _didIteratorError13 = true;
                        _iteratorError13 = _context10.t1;

                    case 26:
                        _context10.prev = 26;
                        _context10.prev = 27;

                        if (!_iteratorNormalCompletion13 && _iterator13.return) {
                            _iterator13.return();
                        }

                    case 29:
                        _context10.prev = 29;

                        if (!_didIteratorError13) {
                            _context10.next = 32;
                            break;
                        }

                        throw _iteratorError13;

                    case 32:
                        return _context10.finish(29);

                    case 33:
                        return _context10.finish(26);

                    case 34:
                        delete cache.banks;
                        _context10.next = 40;
                        break;

                    case 37:
                        _context10.prev = 37;
                        _context10.t2 = _context10['catch'](1);

                        log.error('Error while deleting banks: ' + _context10.t2.toString());

                    case 40:
                    case 'end':
                        return _context10.stop();
                }
            }
        }, _callee10, this, [[1, 37], [11, 22, 26, 34], [27,, 29, 33]]);
    }));

    function m8(_x10) {
        return _ref11.apply(this, arguments);
    }

    return m8;
}(), function () {
    var _ref12 = _asyncToGenerator(regeneratorRuntime.mark(function _callee11() {
        var accesses, _iteratorNormalCompletion14, _didIteratorError14, _iteratorError14, _iterator14, _step14, access, updateCMB;

        return regeneratorRuntime.wrap(function _callee11$(_context11) {
            while (1) {
                switch (_context11.prev = _context11.next) {
                    case 0:
                        log.info('Looking for a CMB access...');
                        _context11.prev = 1;
                        _context11.next = 4;
                        return _access2.default.byBank({ uuid: 'cmb' });

                    case 4:
                        accesses = _context11.sent;
                        _iteratorNormalCompletion14 = true;
                        _didIteratorError14 = false;
                        _iteratorError14 = undefined;
                        _context11.prev = 8;
                        _iterator14 = accesses[Symbol.iterator]();

                    case 10:
                        if (_iteratorNormalCompletion14 = (_step14 = _iterator14.next()).done) {
                            _context11.next = 20;
                            break;
                        }

                        access = _step14.value;

                        if (!(typeof access.customFields === 'undefined')) {
                            _context11.next = 17;
                            break;
                        }

                        log.info('Found CMB access, migrating to "par" website.');

                        updateCMB = function updateCMB() {
                            return [{ name: 'website', value: 'par' }];
                        };

                        _context11.next = 17;
                        return updateCustomFields(access, updateCMB);

                    case 17:
                        _iteratorNormalCompletion14 = true;
                        _context11.next = 10;
                        break;

                    case 20:
                        _context11.next = 26;
                        break;

                    case 22:
                        _context11.prev = 22;
                        _context11.t0 = _context11['catch'](8);
                        _didIteratorError14 = true;
                        _iteratorError14 = _context11.t0;

                    case 26:
                        _context11.prev = 26;
                        _context11.prev = 27;

                        if (!_iteratorNormalCompletion14 && _iterator14.return) {
                            _iterator14.return();
                        }

                    case 29:
                        _context11.prev = 29;

                        if (!_didIteratorError14) {
                            _context11.next = 32;
                            break;
                        }

                        throw _iteratorError14;

                    case 32:
                        return _context11.finish(29);

                    case 33:
                        return _context11.finish(26);

                    case 34:
                        _context11.next = 39;
                        break;

                    case 36:
                        _context11.prev = 36;
                        _context11.t1 = _context11['catch'](1);

                        log.error('Error while migrating CMB accesses: ' + _context11.t1.toString());

                    case 39:
                    case 'end':
                        return _context11.stop();
                }
            }
        }, _callee11, this, [[1, 36], [8, 22, 26, 34], [27,, 29, 33]]);
    }));

    function m9() {
        return _ref12.apply(this, arguments);
    }

    return m9;
}(), function () {
    var _ref13 = _asyncToGenerator(regeneratorRuntime.mark(function _callee12() {
        var accesses, _iteratorNormalCompletion15, _didIteratorError15, _iteratorError15, _iterator15, _step15, access, customFields, _customFields$find, website;

        return regeneratorRuntime.wrap(function _callee12$(_context12) {
            while (1) {
                switch (_context12.prev = _context12.next) {
                    case 0:
                        log.info('Looking for an s2e module...');
                        _context12.prev = 1;
                        _context12.next = 4;
                        return _access2.default.byBank({ uuid: 's2e' });

                    case 4:
                        accesses = _context12.sent;
                        _iteratorNormalCompletion15 = true;
                        _didIteratorError15 = false;
                        _iteratorError15 = undefined;
                        _context12.prev = 8;
                        _iterator15 = accesses[Symbol.iterator]();

                    case 10:
                        if (_iteratorNormalCompletion15 = (_step15 = _iterator15.next()).done) {
                            _context12.next = 37;
                            break;
                        }

                        access = _step15.value;
                        customFields = JSON.parse(access.customFields);
                        _customFields$find = customFields.find(function (f) {
                            return f.name === 'website';
                        }), website = _customFields$find.value;
                        _context12.t0 = website;
                        _context12.next = _context12.t0 === 'smartphone.s2e-net.com' ? 17 : _context12.t0 === 'mobile.capeasi.com' ? 20 : _context12.t0 === 'm.esalia.com' ? 23 : _context12.t0 === 'mobi.ere.hsbc.fr' ? 26 : 29;
                        break;

                    case 17:
                        log.info('\tMigrating s2e module to bnpere...');
                        access.bank = 'bnppere';
                        return _context12.abrupt('break', 30);

                    case 20:
                        log.info('\tMigrating s2e module to capeasi...');
                        access.bank = 'capeasi';
                        return _context12.abrupt('break', 30);

                    case 23:
                        log.info('\tMigrating s2e module to esalia...');
                        access.bank = 'esalia';
                        return _context12.abrupt('break', 30);

                    case 26:
                        log.error('\tCannot migrate module s2e.');
                        log.error('\tPlease create a new access using erehsbc module (HSBC ERE).');
                        return _context12.abrupt('break', 30);

                    case 29:
                        log.error('Invalid value for s2e module: ' + website);

                    case 30:
                        if (!(access.bank !== 's2e')) {
                            _context12.next = 34;
                            break;
                        }

                        delete access.customFields;
                        _context12.next = 34;
                        return access.save();

                    case 34:
                        _iteratorNormalCompletion15 = true;
                        _context12.next = 10;
                        break;

                    case 37:
                        _context12.next = 43;
                        break;

                    case 39:
                        _context12.prev = 39;
                        _context12.t1 = _context12['catch'](8);
                        _didIteratorError15 = true;
                        _iteratorError15 = _context12.t1;

                    case 43:
                        _context12.prev = 43;
                        _context12.prev = 44;

                        if (!_iteratorNormalCompletion15 && _iterator15.return) {
                            _iterator15.return();
                        }

                    case 46:
                        _context12.prev = 46;

                        if (!_didIteratorError15) {
                            _context12.next = 49;
                            break;
                        }

                        throw _iteratorError15;

                    case 49:
                        return _context12.finish(46);

                    case 50:
                        return _context12.finish(43);

                    case 51:
                        _context12.next = 56;
                        break;

                    case 53:
                        _context12.prev = 53;
                        _context12.t2 = _context12['catch'](1);

                        log.error('Error while migrating s2e accesses: ' + _context12.t2.toString());

                    case 56:
                    case 'end':
                        return _context12.stop();
                }
            }
        }, _callee12, this, [[1, 53], [8, 39, 43, 51], [44,, 46, 50]]);
    }));

    function m10() {
        return _ref13.apply(this, arguments);
    }

    return m10;
}(), function () {
    var _ref14 = _asyncToGenerator(regeneratorRuntime.mark(function _callee13(cache) {
        var _iteratorNormalCompletion16, _didIteratorError16, _iteratorError16, _iterator16, _step16, account;

        return regeneratorRuntime.wrap(function _callee13$(_context13) {
            while (1) {
                switch (_context13.prev = _context13.next) {
                    case 0:
                        log.info('Searching accounts with IBAN value set to None');
                        _context13.prev = 1;
                        _context13.t0 = cache.accounts;

                        if (_context13.t0) {
                            _context13.next = 7;
                            break;
                        }

                        _context13.next = 6;
                        return _account2.default.all();

                    case 6:
                        _context13.t0 = _context13.sent;

                    case 7:
                        cache.accounts = _context13.t0;
                        _iteratorNormalCompletion16 = true;
                        _didIteratorError16 = false;
                        _iteratorError16 = undefined;
                        _context13.prev = 11;
                        _iterator16 = cache.accounts.filter(function (acc) {
                            return acc.iban === 'None';
                        })[Symbol.iterator]();

                    case 13:
                        if (_iteratorNormalCompletion16 = (_step16 = _iterator16.next()).done) {
                            _context13.next = 22;
                            break;
                        }

                        account = _step16.value;

                        log.info('\tDeleting iban for ' + account.title + ' of bank ' + account.bank);
                        delete account.iban;
                        _context13.next = 19;
                        return account.save();

                    case 19:
                        _iteratorNormalCompletion16 = true;
                        _context13.next = 13;
                        break;

                    case 22:
                        _context13.next = 28;
                        break;

                    case 24:
                        _context13.prev = 24;
                        _context13.t1 = _context13['catch'](11);
                        _didIteratorError16 = true;
                        _iteratorError16 = _context13.t1;

                    case 28:
                        _context13.prev = 28;
                        _context13.prev = 29;

                        if (!_iteratorNormalCompletion16 && _iterator16.return) {
                            _iterator16.return();
                        }

                    case 31:
                        _context13.prev = 31;

                        if (!_didIteratorError16) {
                            _context13.next = 34;
                            break;
                        }

                        throw _iteratorError16;

                    case 34:
                        return _context13.finish(31);

                    case 35:
                        return _context13.finish(28);

                    case 36:
                        _context13.next = 41;
                        break;

                    case 38:
                        _context13.prev = 38;
                        _context13.t2 = _context13['catch'](1);

                        log.error('Error while deleting iban with None value: ' + _context13.t2.toString());

                    case 41:
                    case 'end':
                        return _context13.stop();
                }
            }
        }, _callee13, this, [[1, 38], [11, 24, 28, 36], [29,, 31, 35]]);
    }));

    function m11(_x11) {
        return _ref14.apply(this, arguments);
    }

    return m11;
}(), function () {
    var _ref15 = _asyncToGenerator(regeneratorRuntime.mark(function _callee14() {
        var _iteratorNormalCompletion17, _didIteratorError17, _iteratorError17, _iterator17, _step17, ghostName, found;

        return regeneratorRuntime.wrap(function _callee14$(_context14) {
            while (1) {
                switch (_context14.prev = _context14.next) {
                    case 0:
                        log.info("Ensuring the Config table doesn't contain any ghost settings.");
                        _context14.prev = 1;
                        _iteratorNormalCompletion17 = true;
                        _didIteratorError17 = false;
                        _iteratorError17 = undefined;
                        _context14.prev = 5;
                        _iterator17 = _config2.default.ghostSettings.keys()[Symbol.iterator]();

                    case 7:
                        if (_iteratorNormalCompletion17 = (_step17 = _iterator17.next()).done) {
                            _context14.next = 19;
                            break;
                        }

                        ghostName = _step17.value;
                        _context14.next = 11;
                        return _config2.default.byName(ghostName);

                    case 11:
                        found = _context14.sent;

                        if (!found) {
                            _context14.next = 16;
                            break;
                        }

                        _context14.next = 15;
                        return found.destroy();

                    case 15:
                        log.info('\tRemoved ' + ghostName + ' from the database.');

                    case 16:
                        _iteratorNormalCompletion17 = true;
                        _context14.next = 7;
                        break;

                    case 19:
                        _context14.next = 25;
                        break;

                    case 21:
                        _context14.prev = 21;
                        _context14.t0 = _context14['catch'](5);
                        _didIteratorError17 = true;
                        _iteratorError17 = _context14.t0;

                    case 25:
                        _context14.prev = 25;
                        _context14.prev = 26;

                        if (!_iteratorNormalCompletion17 && _iterator17.return) {
                            _iterator17.return();
                        }

                    case 28:
                        _context14.prev = 28;

                        if (!_didIteratorError17) {
                            _context14.next = 31;
                            break;
                        }

                        throw _iteratorError17;

                    case 31:
                        return _context14.finish(28);

                    case 32:
                        return _context14.finish(25);

                    case 33:
                        _context14.next = 38;
                        break;

                    case 35:
                        _context14.prev = 35;
                        _context14.t1 = _context14['catch'](1);

                        log.error('Error while deleting the ghost settings from the Config table.');

                    case 38:
                    case 'end':
                        return _context14.stop();
                }
            }
        }, _callee14, this, [[1, 35], [5, 21, 25, 33], [26,, 28, 32]]);
    }));

    function m12() {
        return _ref15.apply(this, arguments);
    }

    return m12;
}(), function () {
    var _ref16 = _asyncToGenerator(regeneratorRuntime.mark(function _callee15() {
        var found, _JSON$parse, toEmail;

        return regeneratorRuntime.wrap(function _callee15$(_context15) {
            while (1) {
                switch (_context15.prev = _context15.next) {
                    case 0:
                        log.info('Migrating the email configuration...');
                        _context15.prev = 1;
                        _context15.next = 4;
                        return _config2.default.byName('mail-config');

                    case 4:
                        found = _context15.sent;

                        if (found) {
                            _context15.next = 8;
                            break;
                        }

                        log.info('Not migrating: email configuration not found.');
                        return _context15.abrupt('return');

                    case 8:
                        _JSON$parse = JSON.parse(found.value), toEmail = _JSON$parse.toEmail;

                        if (toEmail) {
                            _context15.next = 15;
                            break;
                        }

                        log.info('Not migrating: recipient email not found in current configuration.');
                        _context15.next = 13;
                        return found.destroy();

                    case 13:
                        log.info('Previous configuration destroyed.');
                        return _context15.abrupt('return');

                    case 15:

                        log.info('Found mail config, migrating toEmail=' + toEmail + '.');

                        // There's a race condition hidden here: the user could have set a
                        // new email address before the migration happened, at start. In
                        // this case, this will just keep the email they've set.
                        _context15.next = 18;
                        return _config2.default.findOrCreateByName('email-recipient', toEmail);

                    case 18:
                        _context15.next = 20;
                        return found.destroy();

                    case 20:
                        log.info('Done migrating recipient email configuration!');
                        _context15.next = 26;
                        break;

                    case 23:
                        _context15.prev = 23;
                        _context15.t0 = _context15['catch'](1);

                        log.error('Error while migrating the email configuration: ', _context15.t0.toString());

                    case 26:
                    case 'end':
                        return _context15.stop();
                }
            }
        }, _callee15, this, [[1, 23]]);
    }));

    function m13() {
        return _ref16.apply(this, arguments);
    }

    return m13;
}()];