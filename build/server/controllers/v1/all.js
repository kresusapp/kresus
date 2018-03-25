'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.import_ = exports.export_ = exports.all = undefined;

let getAllData = (() => {
    var _ref = _asyncToGenerator(function* (isExport = false, cleanPassword = true) {
        let ret = {};
        ret.accounts = yield _account2.default.all();
        ret.accesses = yield _access2.default.all();

        if (cleanPassword) {
            ret.accesses.forEach(function (access) {
                return delete access.password;
            });
        }

        ret.alerts = yield _alert2.default.all();
        ret.categories = yield _category2.default.all();
        ret.operations = yield _operation2.default.all();
        ret.settings = isExport ? yield _config2.default.allWithoutGhost() : yield _config2.default.all();

        return ret;
    });

    return function getAllData() {
        return _ref.apply(this, arguments);
    };
})();

let all = exports.all = (() => {
    var _ref2 = _asyncToGenerator(function* (req, res) {
        try {
            let ret = yield getAllData();
            res.status(200).json(ret);
        } catch (err) {
            err.code = ERR_MSG_LOADING_ALL;
            return (0, _helpers.asyncErr)(res, err, 'when loading all data');
        }
    });

    return function all(_x, _x2) {
        return _ref2.apply(this, arguments);
    };
})();

// Strip away Couchdb/pouchdb metadata.


let export_ = exports.export_ = (() => {
    var _ref4 = _asyncToGenerator(function* (req, res) {
        try {
            let passphrase = null;

            if (req.body.encrypted === 'true') {
                if (typeof req.body.passphrase !== 'string') {
                    throw new _helpers.KError('missing parameter "passphrase"', 400);
                }

                passphrase = req.body.passphrase;

                // Check password strength
                if (!PASSPHRASE_VALIDATION_REGEXP.test(passphrase)) {
                    throw new _helpers.KError('submitted passphrase is too weak', 400);
                }
            }

            let ret = yield getAllData( /* ghost settings */false, !passphrase);

            ret = cleanData(ret);
            ret = JSON.stringify(ret, null, '   ');

            if (passphrase) {
                ret = encryptData(ret, passphrase);
                res.setHeader('Content-Type', 'text/plain');
            } else {
                res.setHeader('Content-Type', 'application/json');
            }

            res.status(200).send(ret);
        } catch (err) {
            err.code = ERR_MSG_LOADING_ALL;
            return (0, _helpers.asyncErr)(res, err, 'when exporting data');
        }
    });

    return function export_(_x3, _x4) {
        return _ref4.apply(this, arguments);
    };
})();

let import_ = exports.import_ = (() => {
    var _ref5 = _asyncToGenerator(function* (req, res) {
        try {
            if (!req.body.all) {
                throw new _helpers.KError('missing parameter "all" in the file', 400);
            }

            let world = req.body.all;
            if (req.body.encrypted) {
                if (typeof req.body.passphrase !== 'string') {
                    throw new _helpers.KError('missing parameter "passphrase"', 400);
                }

                world = decryptData(world, req.body.passphrase);

                try {
                    world = JSON.parse(world);
                } catch (err) {
                    throw new _helpers.KError('Invalid json file or bad passphrase.', 400);
                }
            }

            world.accesses = world.accesses || [];
            world.accounts = world.accounts || [];
            world.alerts = world.alerts || [];
            world.categories = world.categories || [];
            world.operationtypes = world.operationtypes || [];
            world.operations = world.operations || [];
            world.settings = world.settings || [];

            log.info(`Importing:
            accesses:        ${world.accesses.length}
            accounts:        ${world.accounts.length}
            alerts:          ${world.alerts.length}
            categories:      ${world.categories.length}
            operation-types: ${world.operationtypes.length}
            settings:        ${world.settings.length}
            operations:      ${world.operations.length}
        `);

            log.info('Import accesses...');
            let accessMap = {};
            var _iteratorNormalCompletion7 = true;
            var _didIteratorError7 = false;
            var _iteratorError7 = undefined;

            try {
                for (var _iterator7 = world.accesses[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                    let access = _step7.value;

                    let accessId = access.id;
                    delete access.id;

                    let created = yield _access2.default.create(access);

                    accessMap[accessId] = created.id;
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

            log.info('Done.');

            log.info('Import accounts...');
            let accountIdToAccount = new Map();
            let accountNumberToAccount = new Map();
            var _iteratorNormalCompletion8 = true;
            var _didIteratorError8 = false;
            var _iteratorError8 = undefined;

            try {
                for (var _iterator8 = world.accounts[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
                    let account = _step8.value;

                    if (typeof accessMap[account.bankAccess] === 'undefined') {
                        log.warn('Ignoring orphan account:\n', account);
                        continue;
                    }

                    let accountId = account.id;
                    delete account.id;

                    account.bankAccess = accessMap[account.bankAccess];
                    let created = yield _account2.default.create(account);

                    accountIdToAccount.set(accountId, created.id);
                    accountNumberToAccount.set(created.accountNumber, created.id);
                }
            } catch (err) {
                _didIteratorError8 = true;
                _iteratorError8 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion8 && _iterator8.return) {
                        _iterator8.return();
                    }
                } finally {
                    if (_didIteratorError8) {
                        throw _iteratorError8;
                    }
                }
            }

            log.info('Done.');

            log.info('Import categories...');
            let existingCategories = yield _category2.default.all();
            let existingCategoriesMap = new Map();
            var _iteratorNormalCompletion9 = true;
            var _didIteratorError9 = false;
            var _iteratorError9 = undefined;

            try {
                for (var _iterator9 = existingCategories[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
                    let c = _step9.value;

                    existingCategoriesMap.set(c.title, c);
                }
            } catch (err) {
                _didIteratorError9 = true;
                _iteratorError9 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion9 && _iterator9.return) {
                        _iterator9.return();
                    }
                } finally {
                    if (_didIteratorError9) {
                        throw _iteratorError9;
                    }
                }
            }

            let categoryMap = {};
            var _iteratorNormalCompletion10 = true;
            var _didIteratorError10 = false;
            var _iteratorError10 = undefined;

            try {
                for (var _iterator10 = world.categories[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
                    let category = _step10.value;

                    let catId = category.id;
                    delete category.id;
                    if (existingCategoriesMap.has(category.title)) {
                        let existing = existingCategoriesMap.get(category.title);
                        categoryMap[catId] = existing.id;
                    } else {
                        let created = yield _category2.default.create(category);
                        categoryMap[catId] = created.id;
                    }
                }
            } catch (err) {
                _didIteratorError10 = true;
                _iteratorError10 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion10 && _iterator10.return) {
                        _iterator10.return();
                    }
                } finally {
                    if (_didIteratorError10) {
                        throw _iteratorError10;
                    }
                }
            }

            log.info('Done.');

            // No need to import operation types.

            // importedTypesMap is used to set type to imported operations (backward compatibility)
            let importedTypes = world.operationtypes || [];
            let importedTypesMap = new Map();
            var _iteratorNormalCompletion11 = true;
            var _didIteratorError11 = false;
            var _iteratorError11 = undefined;

            try {
                for (var _iterator11 = importedTypes[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
                    let type = _step11.value;

                    importedTypesMap.set(type.id.toString(), type.name);
                }
            } catch (err) {
                _didIteratorError11 = true;
                _iteratorError11 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion11 && _iterator11.return) {
                        _iterator11.return();
                    }
                } finally {
                    if (_didIteratorError11) {
                        throw _iteratorError11;
                    }
                }
            }

            log.info('Import operations...');
            var _iteratorNormalCompletion12 = true;
            var _didIteratorError12 = false;
            var _iteratorError12 = undefined;

            try {
                for (var _iterator12 = world.operations[Symbol.iterator](), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
                    let op = _step12.value;

                    // Map operation to account.
                    if (typeof op.accountId !== 'undefined') {
                        if (!accountIdToAccount.has(op.accountId)) {
                            log.warn('Ignoring orphan operation:\n', op);
                            continue;
                        }
                        op.accountId = accountIdToAccount.get(op.accountId);
                    } else {
                        if (!accountNumberToAccount.has(op.bankAccount)) {
                            log.warn('Ignoring orphan operation:\n', op);
                            continue;
                        }
                        op.accountId = accountNumberToAccount.get(op.bankAccount);
                    }

                    // Remove bankAccount as the operation is now linked to account with accountId prop.
                    delete op.bankAccount;

                    let categoryId = op.categoryId;
                    if (typeof categoryId !== 'undefined') {
                        if (typeof categoryMap[categoryId] === 'undefined') {
                            log.warn('Unknown category, unsetting for operation:\n', op);
                        }

                        op.categoryId = categoryMap[categoryId];
                    }

                    // Set operation type base on operationId
                    if (typeof op.operationTypeID !== 'undefined') {
                        let key = op.operationTypeID.toString();
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

                    yield _operation2.default.create(op);
                }
            } catch (err) {
                _didIteratorError12 = true;
                _iteratorError12 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion12 && _iterator12.return) {
                        _iterator12.return();
                    }
                } finally {
                    if (_didIteratorError12) {
                        throw _iteratorError12;
                    }
                }
            }

            log.info('Done.');

            log.info('Import settings...');
            let shouldResetMigration = true;
            var _iteratorNormalCompletion13 = true;
            var _didIteratorError13 = false;
            var _iteratorError13 = undefined;

            try {
                for (var _iterator13 = world.settings[Symbol.iterator](), _step13; !(_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done); _iteratorNormalCompletion13 = true) {
                    let setting = _step13.value;

                    if (_config2.default.ghostSettings.has(setting.name)) {
                        continue;
                    }

                    if (setting.name === 'migration-version') {
                        // Overwrite previous value of migration-version setting.
                        let found = yield _config2.default.byName('migration-version');
                        if (found) {
                            shouldResetMigration = false;
                            found.value = setting.value;
                            log.debug(`Updating migration-version index to ${setting.value}.`);
                            yield found.save();
                            continue;
                        }
                    }

                    if (setting.name === 'defaultAccountId' && setting.value !== _defaultSettings2.default.get('defaultAccountId')) {
                        if (!accountIdToAccount.has(setting.value)) {
                            log.warn(`unknown default account id: ${setting.value}, skipping.`);
                            continue;
                        }
                        setting.value = accountIdToAccount.get(setting.value);

                        // Maybe overwrite the previous value, if there was one.
                        let found = yield _config2.default.byName('defaultAccountId');
                        if (found) {
                            found.value = setting.value;
                            yield found.save();
                            continue;
                        }
                    }

                    // Note that former existing values are not overwritten!
                    yield _config2.default.findOrCreateByName(setting.name, setting.value);
                }
            } catch (err) {
                _didIteratorError13 = true;
                _iteratorError13 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion13 && _iterator13.return) {
                        _iterator13.return();
                    }
                } finally {
                    if (_didIteratorError13) {
                        throw _iteratorError13;
                    }
                }
            }

            if (shouldResetMigration) {
                // If no migration-version has been set, just reset
                // migration-version value to 0, to force all the migrations to be
                // run again.
                log.info('The imported file did not provide a migration-version value. ' + 'Resetting it to 0 to run all migrations again.');
                let migrationVersion = yield _config2.default.byName('migration-version');
                migrationVersion.value = '0';
                yield migrationVersion.save();
            }
            log.info('Done.');

            log.info('Import alerts...');
            var _iteratorNormalCompletion14 = true;
            var _didIteratorError14 = false;
            var _iteratorError14 = undefined;

            try {
                for (var _iterator14 = world.alerts[Symbol.iterator](), _step14; !(_iteratorNormalCompletion14 = (_step14 = _iterator14.next()).done); _iteratorNormalCompletion14 = true) {
                    let a = _step14.value;

                    // Map alert to account.
                    if (typeof a.accountId !== 'undefined') {
                        if (!accountIdToAccount.has(a.accountId)) {
                            log.warning('Ignoring orphan alert:\n', a);
                            continue;
                        }
                        a.accountId = accountIdToAccount.get(a.accountId);
                    } else {
                        if (!accountNumberToAccount.has(a.bankAccount)) {
                            log.warning('Ignoring orphan alert:\n', a);
                            continue;
                        }
                        a.accountId = accountNumberToAccount.get(a.bankAccount);
                    }

                    // Remove bankAccount as the alert is now linked to account with accountId prop.
                    delete a.bankAccount;
                    yield _alert2.default.create(a);
                }
            } catch (err) {
                _didIteratorError14 = true;
                _iteratorError14 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion14 && _iterator14.return) {
                        _iterator14.return();
                    }
                } finally {
                    if (_didIteratorError14) {
                        throw _iteratorError14;
                    }
                }
            }

            log.info('Done.');

            log.info('Running migrations...');
            yield (0, _migrations.run)();
            log.info('Done.');

            log.info('Import finished with success!');
            res.status(200).end();
        } catch (err) {
            return (0, _helpers.asyncErr)(res, err, 'when importing data');
        }
    });

    return function import_(_x5, _x6) {
        return _ref5.apply(this, arguments);
    };
})();

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

var _defaultSettings = require('../../shared/default-settings');

var _defaultSettings2 = _interopRequireDefault(_defaultSettings);

var _migrations = require('../../models/migrations');

var _helpers = require('../../helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

let log = (0, _helpers.makeLogger)('controllers/all');

const ERR_MSG_LOADING_ALL = 'Error when loading all Kresus data';
const ENCRYPTION_ALGORITHM = 'aes-256-ctr';
const PASSPHRASE_VALIDATION_REGEXP = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
const ENCRYPTED_CONTENT_TAG = new Buffer('KRE');

function cleanMeta(obj) {
    delete obj._id;
    delete obj._rev;
    delete obj.docType;
}

// Sync function
function cleanData(world) {
    let accessMap = {};
    let nextAccessId = 0;

    world.accesses = world.accesses || [];
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = world.accesses[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            let a = _step.value;

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

    let accountMap = {};
    let nextAccountId = 0;
    world.accounts = world.accounts || [];
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
        for (var _iterator2 = world.accounts[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            let a = _step2.value;

            a.bankAccess = accessMap[a.bankAccess];
            accountMap[a.id] = nextAccountId;
            a.id = nextAccountId++;
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

    let categoryMap = {};
    let nextCatId = 0;
    world.categories = world.categories || [];
    var _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
    var _iteratorError3 = undefined;

    try {
        for (var _iterator3 = world.categories[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            let c = _step3.value;

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
            let o = _step4.value;

            if (typeof o.categoryId !== 'undefined') {
                let cid = o.categoryId;
                if (typeof categoryMap[cid] === 'undefined') {
                    log.warn(`unexpected category id: ${cid}`);
                } else {
                    o.categoryId = categoryMap[cid];
                }
            }

            o.accountId = accountMap[o.accountId];

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
            let s = _step5.value;

            delete s.id;
            cleanMeta(s);

            // Properly save the default account id if it exists.
            if (s.name === 'defaultAccountId' && s.value !== _defaultSettings2.default.get('defaultAccountId')) {
                let accountId = s.value;
                if (typeof accountMap[accountId] === 'undefined') {
                    log.warn(`unexpected default account id: ${accountId}`);
                } else {
                    s.value = accountMap[accountId];
                }
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
            let a = _step6.value;

            a.accountId = accountMap[a.accountId];
            delete a.id;
            cleanMeta(a);
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
    let cipher = crypto.createCipher(ENCRYPTION_ALGORITHM, passphrase);
    return Buffer.concat([ENCRYPTED_CONTENT_TAG, cipher.update(data), cipher.final()]).toString('base64');
}

function decryptData(data, passphrase) {
    let rawData = new Buffer(data, 'base64');
    var _ref3 = [rawData.slice(0, 3), rawData.slice(3)];
    let tag = _ref3[0],
        encrypted = _ref3[1];


    if (tag.toString() !== ENCRYPTED_CONTENT_TAG.toString()) {
        throw new _helpers.KError('submitted file is not a valid kresus file', 400);
    }

    let decipher = crypto.createDecipher(ENCRYPTION_ALGORITHM, passphrase);
    return Buffer.concat([decipher.update(encrypted), decipher.final()]);
}