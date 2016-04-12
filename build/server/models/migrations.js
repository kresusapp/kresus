'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.run = undefined;

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _set = require('babel-runtime/core-js/set');

var _set2 = _interopRequireDefault(_set);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

// For a given access, retrieves the custom fields and gives them to the
// changeFn, which must return a new version of the custom fields (deleted
// fields won't be kept in database). After which they're saved (it's not
// changeFn's responsability to call save/updateAttributes).

var updateCustomFields = function () {
    var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(access, changeFn) {
        var originalCustomFields, newCustomFields, pairToString, buildSig, needsUpdate, originalSignature, newSignature;
        return _regenerator2.default.wrap(function _callee$(_context) {
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
                            customFields: (0, _stringify2.default)(newCustomFields)
                        });

                    case 11:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));
    return function updateCustomFields(_x, _x2) {
        return ref.apply(this, arguments);
    };
}();

var run = exports.run = function () {
    var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee7() {
        var _iteratorNormalCompletion9, _didIteratorError9, _iteratorError9, _iterator9, _step9, m;

        return _regenerator2.default.wrap(function _callee7$(_context7) {
            while (1) {
                switch (_context7.prev = _context7.next) {
                    case 0:
                        _iteratorNormalCompletion9 = true;
                        _didIteratorError9 = false;
                        _iteratorError9 = undefined;
                        _context7.prev = 3;
                        _iterator9 = (0, _getIterator3.default)(migrations);

                    case 5:
                        if (_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done) {
                            _context7.next = 12;
                            break;
                        }

                        m = _step9.value;
                        _context7.next = 9;
                        return m();

                    case 9:
                        _iteratorNormalCompletion9 = true;
                        _context7.next = 5;
                        break;

                    case 12:
                        _context7.next = 18;
                        break;

                    case 14:
                        _context7.prev = 14;
                        _context7.t0 = _context7['catch'](3);
                        _didIteratorError9 = true;
                        _iteratorError9 = _context7.t0;

                    case 18:
                        _context7.prev = 18;
                        _context7.prev = 19;

                        if (!_iteratorNormalCompletion9 && _iterator9.return) {
                            _iterator9.return();
                        }

                    case 21:
                        _context7.prev = 21;

                        if (!_didIteratorError9) {
                            _context7.next = 24;
                            break;
                        }

                        throw _iteratorError9;

                    case 24:
                        return _context7.finish(21);

                    case 25:
                        return _context7.finish(18);

                    case 26:
                    case 'end':
                        return _context7.stop();
                }
            }
        }, _callee7, this, [[3, 14, 18, 26], [19,, 21, 25]]);
    }));
    return function run() {
        return ref.apply(this, arguments);
    };
}();

var _access = require('./access');

var _access2 = _interopRequireDefault(_access);

var _account = require('./account');

var _account2 = _interopRequireDefault(_account);

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

var log = (0, _helpers.makeLogger)('models/migrations');

var migrations = [function () {
    var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2() {
        var weboobLog, weboobInstalled;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
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

    function m1() {
        return ref.apply(this, arguments);
    }

    return m1;
}(), function () {
    var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3() {
        var ops, categories, types, typeSet, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, t, categorySet, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, c, typeNum, catNum, _iteratorNormalCompletion3, _didIteratorError3, _iteratorError3, _iterator3, _step3, op, needsSave;

        return _regenerator2.default.wrap(function _callee3$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        log.info('Checking that operations with types and categories are\nconsistent...');
                        _context3.next = 3;
                        return _operation2.default.all();

                    case 3:
                        ops = _context3.sent;
                        _context3.next = 6;
                        return _category2.default.all();

                    case 6:
                        categories = _context3.sent;
                        _context3.next = 9;
                        return _operationtype2.default.all();

                    case 9:
                        types = _context3.sent;
                        typeSet = new _set2.default();
                        _iteratorNormalCompletion = true;
                        _didIteratorError = false;
                        _iteratorError = undefined;
                        _context3.prev = 14;

                        for (_iterator = (0, _getIterator3.default)(types); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                            t = _step.value;

                            typeSet.add(t.id);
                        }

                        _context3.next = 22;
                        break;

                    case 18:
                        _context3.prev = 18;
                        _context3.t0 = _context3['catch'](14);
                        _didIteratorError = true;
                        _iteratorError = _context3.t0;

                    case 22:
                        _context3.prev = 22;
                        _context3.prev = 23;

                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }

                    case 25:
                        _context3.prev = 25;

                        if (!_didIteratorError) {
                            _context3.next = 28;
                            break;
                        }

                        throw _iteratorError;

                    case 28:
                        return _context3.finish(25);

                    case 29:
                        return _context3.finish(22);

                    case 30:
                        categorySet = new _set2.default();
                        _iteratorNormalCompletion2 = true;
                        _didIteratorError2 = false;
                        _iteratorError2 = undefined;
                        _context3.prev = 34;

                        for (_iterator2 = (0, _getIterator3.default)(categories); !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                            c = _step2.value;

                            categorySet.add(c.id);
                        }

                        _context3.next = 42;
                        break;

                    case 38:
                        _context3.prev = 38;
                        _context3.t1 = _context3['catch'](34);
                        _didIteratorError2 = true;
                        _iteratorError2 = _context3.t1;

                    case 42:
                        _context3.prev = 42;
                        _context3.prev = 43;

                        if (!_iteratorNormalCompletion2 && _iterator2.return) {
                            _iterator2.return();
                        }

                    case 45:
                        _context3.prev = 45;

                        if (!_didIteratorError2) {
                            _context3.next = 48;
                            break;
                        }

                        throw _iteratorError2;

                    case 48:
                        return _context3.finish(45);

                    case 49:
                        return _context3.finish(42);

                    case 50:
                        typeNum = 0;
                        catNum = 0;
                        _iteratorNormalCompletion3 = true;
                        _didIteratorError3 = false;
                        _iteratorError3 = undefined;
                        _context3.prev = 55;
                        _iterator3 = (0, _getIterator3.default)(ops);

                    case 57:
                        if (_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done) {
                            _context3.next = 68;
                            break;
                        }

                        op = _step3.value;
                        needsSave = false;


                        if (typeof op.operationTypeID !== 'undefined' && !typeSet.has(op.operationTypeID)) {
                            needsSave = true;
                            delete op.operationTypeID;
                            typeNum += 1;
                        }

                        if (typeof op.categoryId !== 'undefined' && !categorySet.has(op.categoryId)) {
                            needsSave = true;
                            delete op.categoryId;
                            catNum += 1;
                        }

                        if (!needsSave) {
                            _context3.next = 65;
                            break;
                        }

                        _context3.next = 65;
                        return op.save();

                    case 65:
                        _iteratorNormalCompletion3 = true;
                        _context3.next = 57;
                        break;

                    case 68:
                        _context3.next = 74;
                        break;

                    case 70:
                        _context3.prev = 70;
                        _context3.t2 = _context3['catch'](55);
                        _didIteratorError3 = true;
                        _iteratorError3 = _context3.t2;

                    case 74:
                        _context3.prev = 74;
                        _context3.prev = 75;

                        if (!_iteratorNormalCompletion3 && _iterator3.return) {
                            _iterator3.return();
                        }

                    case 77:
                        _context3.prev = 77;

                        if (!_didIteratorError3) {
                            _context3.next = 80;
                            break;
                        }

                        throw _iteratorError3;

                    case 80:
                        return _context3.finish(77);

                    case 81:
                        return _context3.finish(74);

                    case 82:

                        if (typeNum) log.info('\t' + typeNum + ' operations had an inconsistent type.');
                        if (catNum) log.info('\t' + catNum + ' operations had an inconsistent category.');

                    case 84:
                    case 'end':
                        return _context3.stop();
                }
            }
        }, _callee3, this, [[14, 18, 22, 30], [23,, 25, 29], [34, 38, 42, 50], [43,, 45, 49], [55, 70, 74, 82], [75,, 77, 81]]);
    }));

    function m2() {
        return ref.apply(this, arguments);
    }

    return m2;
}(), function () {
    var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4() {
        var ops, num, _iteratorNormalCompletion4, _didIteratorError4, _iteratorError4, _iterator4, _step4, o;

        return _regenerator2.default.wrap(function _callee4$(_context4) {
            while (1) {
                switch (_context4.prev = _context4.next) {
                    case 0:
                        log.info('Replacing NONE_CATEGORY_ID by undefined...');
                        _context4.next = 3;
                        return _operation2.default.all();

                    case 3:
                        ops = _context4.sent;
                        num = 0;
                        _iteratorNormalCompletion4 = true;
                        _didIteratorError4 = false;
                        _iteratorError4 = undefined;
                        _context4.prev = 8;
                        _iterator4 = (0, _getIterator3.default)(ops);

                    case 10:
                        if (_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done) {
                            _context4.next = 20;
                            break;
                        }

                        o = _step4.value;

                        if (!(typeof o.categoryId !== 'undefined' && o.categoryId.toString() === '-1')) {
                            _context4.next = 17;
                            break;
                        }

                        delete o.categoryId;
                        _context4.next = 16;
                        return o.save();

                    case 16:
                        num += 1;

                    case 17:
                        _iteratorNormalCompletion4 = true;
                        _context4.next = 10;
                        break;

                    case 20:
                        _context4.next = 26;
                        break;

                    case 22:
                        _context4.prev = 22;
                        _context4.t0 = _context4['catch'](8);
                        _didIteratorError4 = true;
                        _iteratorError4 = _context4.t0;

                    case 26:
                        _context4.prev = 26;
                        _context4.prev = 27;

                        if (!_iteratorNormalCompletion4 && _iterator4.return) {
                            _iterator4.return();
                        }

                    case 29:
                        _context4.prev = 29;

                        if (!_didIteratorError4) {
                            _context4.next = 32;
                            break;
                        }

                        throw _iteratorError4;

                    case 32:
                        return _context4.finish(29);

                    case 33:
                        return _context4.finish(26);

                    case 34:

                        if (num) log.info('\t' + num + ' operations had -1 as categoryId.');

                    case 35:
                    case 'end':
                        return _context4.stop();
                }
            }
        }, _callee4, this, [[8, 22, 26, 34], [27,, 29, 33]]);
    }));

    function m3() {
        return ref.apply(this, arguments);
    }

    return m3;
}(), function () {
    var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee5() {
        var accesses, num, updateFields, _iteratorNormalCompletion5, _didIteratorError5, _iteratorError5, _iterator5, _step5, a, website;

        return _regenerator2.default.wrap(function _callee5$(_context5) {
            while (1) {
                switch (_context5.prev = _context5.next) {
                    case 0:
                        log.info('Migrating websites to the customFields format...');

                        _context5.next = 3;
                        return _access2.default.all();

                    case 3:
                        accesses = _context5.sent;
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

                        _iteratorNormalCompletion5 = true;
                        _didIteratorError5 = false;
                        _iteratorError5 = undefined;
                        _context5.prev = 9;
                        _iterator5 = (0, _getIterator3.default)(accesses);

                    case 11:
                        if (_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done) {
                            _context5.next = 25;
                            break;
                        }

                        a = _step5.value;

                        if (!(typeof a.website === 'undefined' || !a.website.length)) {
                            _context5.next = 15;
                            break;
                        }

                        return _context5.abrupt('continue', 22);

                    case 15:
                        website = a.website;

                        delete a.website;

                        _context5.next = 19;
                        return updateCustomFields(a, updateFields(website));

                    case 19:
                        _context5.next = 21;
                        return a.save();

                    case 21:
                        num += 1;

                    case 22:
                        _iteratorNormalCompletion5 = true;
                        _context5.next = 11;
                        break;

                    case 25:
                        _context5.next = 31;
                        break;

                    case 27:
                        _context5.prev = 27;
                        _context5.t0 = _context5['catch'](9);
                        _didIteratorError5 = true;
                        _iteratorError5 = _context5.t0;

                    case 31:
                        _context5.prev = 31;
                        _context5.prev = 32;

                        if (!_iteratorNormalCompletion5 && _iterator5.return) {
                            _iterator5.return();
                        }

                    case 34:
                        _context5.prev = 34;

                        if (!_didIteratorError5) {
                            _context5.next = 37;
                            break;
                        }

                        throw _iteratorError5;

                    case 37:
                        return _context5.finish(34);

                    case 38:
                        return _context5.finish(31);

                    case 39:

                        if (num) log.info('\t' + num + ' accesses updated to the customFields format.');

                    case 40:
                    case 'end':
                        return _context5.stop();
                }
            }
        }, _callee5, this, [[9, 27, 31, 39], [32,, 34, 38]]);
    }));

    function m4() {
        return ref.apply(this, arguments);
    }

    return m4;
}(), function () {
    var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee6() {
        var accesses, updateFieldsBnp, updateFieldsHelloBank, _iteratorNormalCompletion6, _didIteratorError6, _iteratorError6, _iterator6, _step6, a, accounts, _iteratorNormalCompletion8, _didIteratorError8, _iteratorError8, _iterator8, _step8, acc, banks, _iteratorNormalCompletion7, _didIteratorError7, _iteratorError7, _iterator7, _step7, b;

        return _regenerator2.default.wrap(function _callee6$(_context6) {
            while (1) {
                switch (_context6.prev = _context6.next) {
                    case 0:
                        log.info('Migrating HelloBank users to BNP and BNP users to the new\nwebsite format.');
                        _context6.next = 3;
                        return _access2.default.all();

                    case 3:
                        accesses = _context6.sent;

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

                        _iteratorNormalCompletion6 = true;
                        _didIteratorError6 = false;
                        _iteratorError6 = undefined;
                        _context6.prev = 9;
                        _iterator6 = (0, _getIterator3.default)(accesses);

                    case 11:
                        if (_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done) {
                            _context6.next = 56;
                            break;
                        }

                        a = _step6.value;

                        if (!(a.bank === 'bnporc')) {
                            _context6.next = 17;
                            break;
                        }

                        _context6.next = 16;
                        return updateCustomFields(a, updateFieldsBnp);

                    case 16:
                        return _context6.abrupt('continue', 53);

                    case 17:
                        if (!(a.bank === 'hellobank')) {
                            _context6.next = 53;
                            break;
                        }

                        _context6.next = 20;
                        return updateCustomFields(a, updateFieldsHelloBank);

                    case 20:
                        _context6.next = 22;
                        return _account2.default.byBank({ uuid: 'hellobank' });

                    case 22:
                        accounts = _context6.sent;
                        _iteratorNormalCompletion8 = true;
                        _didIteratorError8 = false;
                        _iteratorError8 = undefined;
                        _context6.prev = 26;
                        _iterator8 = (0, _getIterator3.default)(accounts);

                    case 28:
                        if (_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done) {
                            _context6.next = 35;
                            break;
                        }

                        acc = _step8.value;
                        _context6.next = 32;
                        return acc.updateAttributes({ bank: 'bnporc' });

                    case 32:
                        _iteratorNormalCompletion8 = true;
                        _context6.next = 28;
                        break;

                    case 35:
                        _context6.next = 41;
                        break;

                    case 37:
                        _context6.prev = 37;
                        _context6.t0 = _context6['catch'](26);
                        _didIteratorError8 = true;
                        _iteratorError8 = _context6.t0;

                    case 41:
                        _context6.prev = 41;
                        _context6.prev = 42;

                        if (!_iteratorNormalCompletion8 && _iterator8.return) {
                            _iterator8.return();
                        }

                    case 44:
                        _context6.prev = 44;

                        if (!_didIteratorError8) {
                            _context6.next = 47;
                            break;
                        }

                        throw _iteratorError8;

                    case 47:
                        return _context6.finish(44);

                    case 48:
                        return _context6.finish(41);

                    case 49:
                        _context6.next = 51;
                        return a.updateAttributes({ bank: 'bnporc' });

                    case 51:
                        log.info('\tHelloBank access updated to use BNP\'s backend.');
                        return _context6.abrupt('continue', 53);

                    case 53:
                        _iteratorNormalCompletion6 = true;
                        _context6.next = 11;
                        break;

                    case 56:
                        _context6.next = 62;
                        break;

                    case 58:
                        _context6.prev = 58;
                        _context6.t1 = _context6['catch'](9);
                        _didIteratorError6 = true;
                        _iteratorError6 = _context6.t1;

                    case 62:
                        _context6.prev = 62;
                        _context6.prev = 63;

                        if (!_iteratorNormalCompletion6 && _iterator6.return) {
                            _iterator6.return();
                        }

                    case 65:
                        _context6.prev = 65;

                        if (!_didIteratorError6) {
                            _context6.next = 68;
                            break;
                        }

                        throw _iteratorError6;

                    case 68:
                        return _context6.finish(65);

                    case 69:
                        return _context6.finish(62);

                    case 70:
                        _context6.next = 72;
                        return _bank2.default.all();

                    case 72:
                        banks = _context6.sent;
                        _iteratorNormalCompletion7 = true;
                        _didIteratorError7 = false;
                        _iteratorError7 = undefined;
                        _context6.prev = 76;
                        _iterator7 = (0, _getIterator3.default)(banks);

                    case 78:
                        if (_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done) {
                            _context6.next = 89;
                            break;
                        }

                        b = _step7.value;

                        if (!(b.uuid !== 'hellobank')) {
                            _context6.next = 82;
                            break;
                        }

                        return _context6.abrupt('continue', 86);

                    case 82:
                        log.info('\tRemoving HelloBank from the list of banks...');
                        _context6.next = 85;
                        return b.destroy();

                    case 85:
                        log.info('\tdone!');

                    case 86:
                        _iteratorNormalCompletion7 = true;
                        _context6.next = 78;
                        break;

                    case 89:
                        _context6.next = 95;
                        break;

                    case 91:
                        _context6.prev = 91;
                        _context6.t2 = _context6['catch'](76);
                        _didIteratorError7 = true;
                        _iteratorError7 = _context6.t2;

                    case 95:
                        _context6.prev = 95;
                        _context6.prev = 96;

                        if (!_iteratorNormalCompletion7 && _iterator7.return) {
                            _iterator7.return();
                        }

                    case 98:
                        _context6.prev = 98;

                        if (!_didIteratorError7) {
                            _context6.next = 101;
                            break;
                        }

                        throw _iteratorError7;

                    case 101:
                        return _context6.finish(98);

                    case 102:
                        return _context6.finish(95);

                    case 103:
                    case 'end':
                        return _context6.stop();
                }
            }
        }, _callee6, this, [[9, 58, 62, 70], [26, 37, 41, 49], [42,, 44, 48], [63,, 65, 69], [76, 91, 95, 103], [96,, 98, 102]]);
    }));

    function m5() {
        return ref.apply(this, arguments);
    }

    return m5;
}()];