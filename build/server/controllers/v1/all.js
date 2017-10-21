'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.import_ = exports.export_ = exports.all = undefined;

var getAllData = function () {
    var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
        var withGhostSettings = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
        var cleanPassword = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
        var ret;
        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        ret = {};
                        _context.next = 3;
                        return _account2.default.all();

                    case 3:
                        ret.accounts = _context.sent;
                        _context.next = 6;
                        return _access2.default.all();

                    case 6:
                        ret.accesses = _context.sent;


                        if (cleanPassword) {
                            ret.accesses.forEach(function (access) {
                                return delete access.password;
                            });
                        }

                        _context.next = 10;
                        return _alert2.default.all();

                    case 10:
                        ret.alerts = _context.sent;
                        _context.next = 13;
                        return _category2.default.all();

                    case 13:
                        ret.categories = _context.sent;
                        _context.next = 16;
                        return _cozyinstance2.default.all();

                    case 16:
                        ret.cozy = _context.sent;
                        _context.next = 19;
                        return _operation2.default.all();

                    case 19:
                        ret.operations = _context.sent;

                        if (!withGhostSettings) {
                            _context.next = 26;
                            break;
                        }

                        _context.next = 23;
                        return _config2.default.all();

                    case 23:
                        _context.t0 = _context.sent;
                        _context.next = 29;
                        break;

                    case 26:
                        _context.next = 28;
                        return _config2.default.allWithoutGhost();

                    case 28:
                        _context.t0 = _context.sent;

                    case 29:
                        ret.settings = _context.t0;
                        return _context.abrupt('return', ret);

                    case 31:
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
    var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(req, res) {
        var ret;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        _context2.prev = 0;
                        _context2.next = 3;
                        return getAllData();

                    case 3:
                        ret = _context2.sent;

                        res.status(200).json(ret);
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

    return function all(_x3, _x4) {
        return _ref2.apply(this, arguments);
    };
}();

// Strip away Couchdb/pouchdb metadata.


var export_ = exports.export_ = function () {
    var _ref4 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(req, res) {
        var passphrase, ret;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        _context3.prev = 0;
                        passphrase = null;

                        if (!(req.body.encrypted === 'true')) {
                            _context3.next = 8;
                            break;
                        }

                        if (!(typeof req.body.passphrase !== 'string')) {
                            _context3.next = 5;
                            break;
                        }

                        throw new _helpers.KError('missing parameter "passphrase"', 400);

                    case 5:

                        passphrase = req.body.passphrase;

                        // Check password strength

                        if (PASSPHRASE_VALIDATION_REGEXP.test(passphrase)) {
                            _context3.next = 8;
                            break;
                        }

                        throw new _helpers.KError('submitted passphrase is too weak', 400);

                    case 8:
                        _context3.next = 10;
                        return getAllData( /* ghost settings */false, !passphrase);

                    case 10:
                        ret = _context3.sent;


                        ret = cleanData(ret);
                        ret = JSON.stringify(ret, null, '   ');

                        if (passphrase) {
                            ret = encryptData(ret, passphrase);
                            res.setHeader('Content-Type', 'text/plain');
                        } else {
                            res.setHeader('Content-Type', 'application/json');
                        }

                        res.status(200).send(ret);
                        _context3.next = 21;
                        break;

                    case 17:
                        _context3.prev = 17;
                        _context3.t0 = _context3['catch'](0);

                        _context3.t0.code = ERR_MSG_LOADING_ALL;
                        return _context3.abrupt('return', (0, _helpers.asyncErr)(res, _context3.t0, 'when exporting data'));

                    case 21:
                    case 'end':
                        return _context3.stop();
                }
            }
        }, _callee3, this, [[0, 17]]);
    }));

    return function export_(_x5, _x6) {
        return _ref4.apply(this, arguments);
    };
}();

var import_ = exports.import_ = function () {
    var _ref5 = _asyncToGenerator(regeneratorRuntime.mark(function _callee4(req, res) {
        var world, accessMap, _iteratorNormalCompletion7, _didIteratorError7, _iteratorError7, _iterator7, _step7, access, accessId, created, accountMap, _iteratorNormalCompletion8, _didIteratorError8, _iteratorError8, _iterator8, _step8, account, accountId, existingCategories, existingCategoriesMap, _iteratorNormalCompletion9, _didIteratorError9, _iteratorError9, _iterator9, _step9, c, categoryMap, _iteratorNormalCompletion10, _didIteratorError10, _iteratorError10, _iterator10, _step10, category, catId, existing, _created, importedTypes, importedTypesMap, _iteratorNormalCompletion11, _didIteratorError11, _iteratorError11, _iterator11, _step11, type, _iteratorNormalCompletion12, _didIteratorError12, _iteratorError12, _iterator12, _step12, op, categoryId, key, shouldResetMigration, _iteratorNormalCompletion13, _didIteratorError13, _iteratorError13, _iterator13, _step13, setting, found, _found, migrationVersion, _iteratorNormalCompletion14, _didIteratorError14, _iteratorError14, _iterator14, _step14, a;

        return regeneratorRuntime.wrap(function _callee4$(_context4) {
            while (1) {
                switch (_context4.prev = _context4.next) {
                    case 0:
                        _context4.prev = 0;

                        if (req.body.all) {
                            _context4.next = 3;
                            break;
                        }

                        throw new _helpers.KError('missing parameter "all" in the file', 400);

                    case 3:
                        world = req.body.all;

                        if (!req.body.encrypted) {
                            _context4.next = 15;
                            break;
                        }

                        if (!(typeof req.body.passphrase !== 'string')) {
                            _context4.next = 7;
                            break;
                        }

                        throw new _helpers.KError('missing parameter "passphrase"', 400);

                    case 7:

                        world = decryptData(world, req.body.passphrase);

                        _context4.prev = 8;

                        world = JSON.parse(world);
                        _context4.next = 15;
                        break;

                    case 12:
                        _context4.prev = 12;
                        _context4.t0 = _context4['catch'](8);
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
                        _iteratorNormalCompletion7 = true;
                        _didIteratorError7 = false;
                        _iteratorError7 = undefined;
                        _context4.prev = 28;
                        _iterator7 = world.accesses[Symbol.iterator]();

                    case 30:
                        if (_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done) {
                            _context4.next = 41;
                            break;
                        }

                        access = _step7.value;
                        accessId = access.id;

                        delete access.id;

                        _context4.next = 36;
                        return _access2.default.create(access);

                    case 36:
                        created = _context4.sent;


                        accessMap[accessId] = created.id;

                    case 38:
                        _iteratorNormalCompletion7 = true;
                        _context4.next = 30;
                        break;

                    case 41:
                        _context4.next = 47;
                        break;

                    case 43:
                        _context4.prev = 43;
                        _context4.t1 = _context4['catch'](28);
                        _didIteratorError7 = true;
                        _iteratorError7 = _context4.t1;

                    case 47:
                        _context4.prev = 47;
                        _context4.prev = 48;

                        if (!_iteratorNormalCompletion7 && _iterator7.return) {
                            _iterator7.return();
                        }

                    case 50:
                        _context4.prev = 50;

                        if (!_didIteratorError7) {
                            _context4.next = 53;
                            break;
                        }

                        throw _iteratorError7;

                    case 53:
                        return _context4.finish(50);

                    case 54:
                        return _context4.finish(47);

                    case 55:
                        log.info('Done.');

                        log.info('Import accounts...');
                        accountMap = {};
                        _iteratorNormalCompletion8 = true;
                        _didIteratorError8 = false;
                        _iteratorError8 = undefined;
                        _context4.prev = 61;
                        _iterator8 = world.accounts[Symbol.iterator]();

                    case 63:
                        if (_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done) {
                            _context4.next = 77;
                            break;
                        }

                        account = _step8.value;

                        if (accessMap[account.bankAccess]) {
                            _context4.next = 67;
                            break;
                        }

                        throw new _helpers.KError('unknown access ' + account.bankAccess, 400);

                    case 67:
                        accountId = account.id;

                        delete account.id;

                        account.bankAccess = accessMap[account.bankAccess];
                        _context4.next = 72;
                        return _account2.default.create(account);

                    case 72:
                        created = _context4.sent;


                        accountMap[accountId] = created.id;

                    case 74:
                        _iteratorNormalCompletion8 = true;
                        _context4.next = 63;
                        break;

                    case 77:
                        _context4.next = 83;
                        break;

                    case 79:
                        _context4.prev = 79;
                        _context4.t2 = _context4['catch'](61);
                        _didIteratorError8 = true;
                        _iteratorError8 = _context4.t2;

                    case 83:
                        _context4.prev = 83;
                        _context4.prev = 84;

                        if (!_iteratorNormalCompletion8 && _iterator8.return) {
                            _iterator8.return();
                        }

                    case 86:
                        _context4.prev = 86;

                        if (!_didIteratorError8) {
                            _context4.next = 89;
                            break;
                        }

                        throw _iteratorError8;

                    case 89:
                        return _context4.finish(86);

                    case 90:
                        return _context4.finish(83);

                    case 91:
                        log.info('Done.');

                        log.info('Import categories...');
                        _context4.next = 95;
                        return _category2.default.all();

                    case 95:
                        existingCategories = _context4.sent;
                        existingCategoriesMap = new Map();
                        _iteratorNormalCompletion9 = true;
                        _didIteratorError9 = false;
                        _iteratorError9 = undefined;
                        _context4.prev = 100;

                        for (_iterator9 = existingCategories[Symbol.iterator](); !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
                            c = _step9.value;

                            existingCategoriesMap.set(c.title, c);
                        }

                        _context4.next = 108;
                        break;

                    case 104:
                        _context4.prev = 104;
                        _context4.t3 = _context4['catch'](100);
                        _didIteratorError9 = true;
                        _iteratorError9 = _context4.t3;

                    case 108:
                        _context4.prev = 108;
                        _context4.prev = 109;

                        if (!_iteratorNormalCompletion9 && _iterator9.return) {
                            _iterator9.return();
                        }

                    case 111:
                        _context4.prev = 111;

                        if (!_didIteratorError9) {
                            _context4.next = 114;
                            break;
                        }

                        throw _iteratorError9;

                    case 114:
                        return _context4.finish(111);

                    case 115:
                        return _context4.finish(108);

                    case 116:
                        categoryMap = {};
                        _iteratorNormalCompletion10 = true;
                        _didIteratorError10 = false;
                        _iteratorError10 = undefined;
                        _context4.prev = 120;
                        _iterator10 = world.categories[Symbol.iterator]();

                    case 122:
                        if (_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done) {
                            _context4.next = 138;
                            break;
                        }

                        category = _step10.value;
                        catId = category.id;

                        delete category.id;

                        if (!existingCategoriesMap.has(category.title)) {
                            _context4.next = 131;
                            break;
                        }

                        existing = existingCategoriesMap.get(category.title);

                        categoryMap[catId] = existing.id;
                        _context4.next = 135;
                        break;

                    case 131:
                        _context4.next = 133;
                        return _category2.default.create(category);

                    case 133:
                        _created = _context4.sent;

                        categoryMap[catId] = _created.id;

                    case 135:
                        _iteratorNormalCompletion10 = true;
                        _context4.next = 122;
                        break;

                    case 138:
                        _context4.next = 144;
                        break;

                    case 140:
                        _context4.prev = 140;
                        _context4.t4 = _context4['catch'](120);
                        _didIteratorError10 = true;
                        _iteratorError10 = _context4.t4;

                    case 144:
                        _context4.prev = 144;
                        _context4.prev = 145;

                        if (!_iteratorNormalCompletion10 && _iterator10.return) {
                            _iterator10.return();
                        }

                    case 147:
                        _context4.prev = 147;

                        if (!_didIteratorError10) {
                            _context4.next = 150;
                            break;
                        }

                        throw _iteratorError10;

                    case 150:
                        return _context4.finish(147);

                    case 151:
                        return _context4.finish(144);

                    case 152:
                        log.info('Done.');

                        // No need to import operation types.

                        // importedTypesMap is used to set type to imported operations (backward compatibility)
                        importedTypes = world.operationtypes || [];
                        importedTypesMap = new Map();
                        _iteratorNormalCompletion11 = true;
                        _didIteratorError11 = false;
                        _iteratorError11 = undefined;
                        _context4.prev = 158;

                        for (_iterator11 = importedTypes[Symbol.iterator](); !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
                            type = _step11.value;

                            importedTypesMap.set(type.id.toString(), type.name);
                        }
                        _context4.next = 166;
                        break;

                    case 162:
                        _context4.prev = 162;
                        _context4.t5 = _context4['catch'](158);
                        _didIteratorError11 = true;
                        _iteratorError11 = _context4.t5;

                    case 166:
                        _context4.prev = 166;
                        _context4.prev = 167;

                        if (!_iteratorNormalCompletion11 && _iterator11.return) {
                            _iterator11.return();
                        }

                    case 169:
                        _context4.prev = 169;

                        if (!_didIteratorError11) {
                            _context4.next = 172;
                            break;
                        }

                        throw _iteratorError11;

                    case 172:
                        return _context4.finish(169);

                    case 173:
                        return _context4.finish(166);

                    case 174:
                        log.info('Import operations...');
                        _iteratorNormalCompletion12 = true;
                        _didIteratorError12 = false;
                        _iteratorError12 = undefined;
                        _context4.prev = 178;
                        _iterator12 = world.operations[Symbol.iterator]();

                    case 180:
                        if (_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done) {
                            _context4.next = 195;
                            break;
                        }

                        op = _step12.value;
                        categoryId = op.categoryId;

                        if (!(typeof categoryId !== 'undefined')) {
                            _context4.next = 187;
                            break;
                        }

                        if (categoryMap[categoryId]) {
                            _context4.next = 186;
                            break;
                        }

                        throw new _helpers.KError('unknown category ' + categoryId, 400);

                    case 186:
                        op.categoryId = categoryMap[categoryId];

                    case 187:

                        // Set operation type base on operationId
                        if (typeof op.operationTypeID !== 'undefined') {
                            key = op.operationTypeID.toString();

                            if (importedTypesMap.has(key)) {
                                op.type = importedTypesMap.get(key);
                            } else {
                                op.type = _helpers.UNKNOWN_OPERATION_TYPE;
                            }
                            delete op.operationTypeID;
                        }

                        // Remove attachments, if there were any.
                        delete op.attachments;
                        delete op.binary;

                        _context4.next = 192;
                        return _operation2.default.create(op);

                    case 192:
                        _iteratorNormalCompletion12 = true;
                        _context4.next = 180;
                        break;

                    case 195:
                        _context4.next = 201;
                        break;

                    case 197:
                        _context4.prev = 197;
                        _context4.t6 = _context4['catch'](178);
                        _didIteratorError12 = true;
                        _iteratorError12 = _context4.t6;

                    case 201:
                        _context4.prev = 201;
                        _context4.prev = 202;

                        if (!_iteratorNormalCompletion12 && _iterator12.return) {
                            _iterator12.return();
                        }

                    case 204:
                        _context4.prev = 204;

                        if (!_didIteratorError12) {
                            _context4.next = 207;
                            break;
                        }

                        throw _iteratorError12;

                    case 207:
                        return _context4.finish(204);

                    case 208:
                        return _context4.finish(201);

                    case 209:
                        log.info('Done.');

                        log.info('Import settings...');
                        shouldResetMigration = true;
                        _iteratorNormalCompletion13 = true;
                        _didIteratorError13 = false;
                        _iteratorError13 = undefined;
                        _context4.prev = 215;
                        _iterator13 = world.settings[Symbol.iterator]();

                    case 217:
                        if (_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done) {
                            _context4.next = 250;
                            break;
                        }

                        setting = _step13.value;

                        if (!_config2.default.ghostSettings.has(setting.name)) {
                            _context4.next = 221;
                            break;
                        }

                        return _context4.abrupt('continue', 247);

                    case 221:
                        if (!(setting.name === 'migration-version')) {
                            _context4.next = 232;
                            break;
                        }

                        _context4.next = 224;
                        return _config2.default.byName('migration-version');

                    case 224:
                        found = _context4.sent;

                        if (!found) {
                            _context4.next = 232;
                            break;
                        }

                        shouldResetMigration = false;
                        found.value = setting.value;
                        log.debug('Updating migration-version index to ' + setting.value + '.');
                        _context4.next = 231;
                        return found.save();

                    case 231:
                        return _context4.abrupt('continue', 247);

                    case 232:
                        if (!(setting.name === 'defaultAccountId' && setting.value !== _defaultSettings2.default.get('defaultAccountId'))) {
                            _context4.next = 245;
                            break;
                        }

                        if (!(typeof accountMap[setting.value] === 'undefined')) {
                            _context4.next = 236;
                            break;
                        }

                        log.warn('unknown default account id: ' + setting.value + ', skipping.');
                        return _context4.abrupt('continue', 247);

                    case 236:
                        setting.value = accountMap[setting.value];

                        // Maybe overwrite the previous value, if there was one.
                        _context4.next = 239;
                        return _config2.default.byName('defaultAccountId');

                    case 239:
                        _found = _context4.sent;

                        if (!_found) {
                            _context4.next = 245;
                            break;
                        }

                        _found.value = setting.value;
                        _context4.next = 244;
                        return _found.save();

                    case 244:
                        return _context4.abrupt('continue', 247);

                    case 245:
                        _context4.next = 247;
                        return _config2.default.findOrCreateByName(setting.name, setting.value);

                    case 247:
                        _iteratorNormalCompletion13 = true;
                        _context4.next = 217;
                        break;

                    case 250:
                        _context4.next = 256;
                        break;

                    case 252:
                        _context4.prev = 252;
                        _context4.t7 = _context4['catch'](215);
                        _didIteratorError13 = true;
                        _iteratorError13 = _context4.t7;

                    case 256:
                        _context4.prev = 256;
                        _context4.prev = 257;

                        if (!_iteratorNormalCompletion13 && _iterator13.return) {
                            _iterator13.return();
                        }

                    case 259:
                        _context4.prev = 259;

                        if (!_didIteratorError13) {
                            _context4.next = 262;
                            break;
                        }

                        throw _iteratorError13;

                    case 262:
                        return _context4.finish(259);

                    case 263:
                        return _context4.finish(256);

                    case 264:
                        if (!shouldResetMigration) {
                            _context4.next = 272;
                            break;
                        }

                        // If no migration-version has been set, just reset
                        // migration-version value to 0, to force all the migrations to be
                        // run again.
                        log.info('The imported file did not provide a migration-version value. ' + 'Resetting it to 0 to run all migrations again.');
                        _context4.next = 268;
                        return _config2.default.byName('migration-version');

                    case 268:
                        migrationVersion = _context4.sent;

                        migrationVersion.value = '0';
                        _context4.next = 272;
                        return migrationVersion.save();

                    case 272:
                        log.info('Done.');

                        log.info('Import alerts...');
                        _iteratorNormalCompletion14 = true;
                        _didIteratorError14 = false;
                        _iteratorError14 = undefined;
                        _context4.prev = 277;
                        _iterator14 = world.alerts[Symbol.iterator]();

                    case 279:
                        if (_iteratorNormalCompletion14 = (_step14 = _iterator14.next()).done) {
                            _context4.next = 286;
                            break;
                        }

                        a = _step14.value;
                        _context4.next = 283;
                        return _alert2.default.create(a);

                    case 283:
                        _iteratorNormalCompletion14 = true;
                        _context4.next = 279;
                        break;

                    case 286:
                        _context4.next = 292;
                        break;

                    case 288:
                        _context4.prev = 288;
                        _context4.t8 = _context4['catch'](277);
                        _didIteratorError14 = true;
                        _iteratorError14 = _context4.t8;

                    case 292:
                        _context4.prev = 292;
                        _context4.prev = 293;

                        if (!_iteratorNormalCompletion14 && _iterator14.return) {
                            _iterator14.return();
                        }

                    case 295:
                        _context4.prev = 295;

                        if (!_didIteratorError14) {
                            _context4.next = 298;
                            break;
                        }

                        throw _iteratorError14;

                    case 298:
                        return _context4.finish(295);

                    case 299:
                        return _context4.finish(292);

                    case 300:
                        log.info('Done.');

                        log.info('Running migrations...');
                        _context4.next = 304;
                        return (0, _migrations.run)();

                    case 304:
                        log.info('Done.');

                        log.info('Import finished with success!');
                        res.status(200).end();
                        _context4.next = 312;
                        break;

                    case 309:
                        _context4.prev = 309;
                        _context4.t9 = _context4['catch'](0);
                        return _context4.abrupt('return', (0, _helpers.asyncErr)(res, _context4.t9, 'when importing data'));

                    case 312:
                    case 'end':
                        return _context4.stop();
                }
            }
        }, _callee4, this, [[0, 309], [8, 12], [28, 43, 47, 55], [48,, 50, 54], [61, 79, 83, 91], [84,, 86, 90], [100, 104, 108, 116], [109,, 111, 115], [120, 140, 144, 152], [145,, 147, 151], [158, 162, 166, 174], [167,, 169, 173], [178, 197, 201, 209], [202,, 204, 208], [215, 252, 256, 264], [257,, 259, 263], [277, 288, 292, 300], [293,, 295, 299]]);
    }));

    return function import_(_x7, _x8) {
        return _ref5.apply(this, arguments);
    };
}();

var _crypto = require('crypto');

var crypto = _interopRequireWildcard(_crypto);

var _access = require('../../models/access');

var _access2 = _interopRequireDefault(_access);

var _account = require('../../models/account');

var _account2 = _interopRequireDefault(_account);

var _alert = require('../../models/alert');

var _alert2 = _interopRequireDefault(_alert);

var _category = require('../../models/category');

var _category2 = _interopRequireDefault(_category);

var _operation = require('../../models/operation');

var _operation2 = _interopRequireDefault(_operation);

var _config = require('../../models/config');

var _config2 = _interopRequireDefault(_config);

var _cozyinstance = require('../../models/cozyinstance');

var _cozyinstance2 = _interopRequireDefault(_cozyinstance);

var _defaultSettings = require('../../shared/default-settings');

var _defaultSettings2 = _interopRequireDefault(_defaultSettings);

var _migrations = require('../../models/migrations');

var _helpers = require('../../helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

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
function cleanData(world) {

    // Cozy information is very tied to the instance.
    if (world.cozy) delete world.cozy;

    var accessMap = {};
    var nextAccessId = 0;

    world.accesses = world.accesses || [];
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = world.accesses[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var a = _step.value;

            accessMap[a.id] = nextAccessId;
            a.id = nextAccessId++;
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

    var accountMap = {};
    var nextAccountId = 0;
    world.accounts = world.accounts || [];
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
        for (var _iterator2 = world.accounts[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var _a = _step2.value;

            _a.bankAccess = accessMap[_a.bankAccess];
            accountMap[_a.id] = nextAccountId;
            _a.id = nextAccountId++;
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
        for (var _iterator3 = world.categories[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
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

    world.operations = world.operations || [];
    var _iteratorNormalCompletion4 = true;
    var _didIteratorError4 = false;
    var _iteratorError4 = undefined;

    try {
        for (var _iterator4 = world.operations[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
            var o = _step4.value;


            if (typeof o.categoryId !== 'undefined') {
                var cid = o.categoryId;
                if (typeof categoryMap[cid] === 'undefined') log.warn('unexpected category id: ' + cid);else o.categoryId = categoryMap[cid];
            }

            // Strip away id.
            delete o.id;
            cleanMeta(o);

            // Remove attachments, if there are any.
            delete o.attachments;
            delete o.binary;
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

    world.settings = world.settings || [];
    var _iteratorNormalCompletion5 = true;
    var _didIteratorError5 = false;
    var _iteratorError5 = undefined;

    try {
        for (var _iterator5 = world.settings[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
            var s = _step5.value;

            delete s.id;
            cleanMeta(s);

            // Properly save the default account id if it exists.
            if (s.name === 'defaultAccountId' && s.value !== _defaultSettings2.default.get('defaultAccountId')) {
                var accountId = s.value;
                if (typeof accountMap[accountId] === 'undefined') log.warn('unexpected default account id: ' + accountId);else s.value = accountMap[accountId];
            }
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

    world.alerts = world.alerts || [];
    var _iteratorNormalCompletion6 = true;
    var _didIteratorError6 = false;
    var _iteratorError6 = undefined;

    try {
        for (var _iterator6 = world.alerts[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
            var _a2 = _step6.value;

            delete _a2.id;
            cleanMeta(_a2);
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

    return world;
}

function encryptData(data, passphrase) {
    var cipher = crypto.createCipher(ENCRYPTION_ALGORITHM, passphrase);
    return Buffer.concat([ENCRYPTED_CONTENT_TAG, cipher.update(data), cipher.final()]).toString('base64');
}

function decryptData(data, passphrase) {
    var rawData = new Buffer(data, 'base64');
    var _ref3 = [rawData.slice(0, 3), rawData.slice(3)],
        tag = _ref3[0],
        encrypted = _ref3[1];


    if (tag.toString() !== ENCRYPTED_CONTENT_TAG.toString()) {
        throw new _helpers.KError('submitted file is not a valid kresus file', 400);
    }

    var decipher = crypto.createDecipher(ENCRYPTION_ALGORITHM, passphrase);
    return Buffer.concat([decipher.update(encrypted), decipher.final()]);
}