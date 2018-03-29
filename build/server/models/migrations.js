'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.run = undefined;

// For a given access, retrieves the custom fields and gives them to the
// changeFn, which must return a new version of the custom fields (deleted
// fields won't be kept in database). After which they're saved (it's not
// changeFn's responsability to call save/updateAttributes).
let updateCustomFields = (() => {
    var _ref = _asyncToGenerator(function* (access, changeFn) {
        let originalCustomFields = JSON.parse(access.customFields || '[]');

        // "deep copy", lol
        let newCustomFields = JSON.parse(access.customFields || '[]');
        newCustomFields = changeFn(newCustomFields);

        let pairToString = function pairToString(pair) {
            return `${pair.name}:${pair.value}`;
        };
        let buildSig = function buildSig(fields) {
            return fields.map(pairToString).join('/');
        };

        let needsUpdate = false;
        if (originalCustomFields.length !== newCustomFields.length) {
            // If one has more fields than the other, update.
            needsUpdate = true;
        } else {
            // If the name:value/name2:value2 strings are different, update.
            let originalSignature = buildSig(originalCustomFields);
            let newSignature = buildSig(newCustomFields);
            needsUpdate = originalSignature !== newSignature;
        }

        if (needsUpdate) {
            log.debug(`updating custom fields for ${access.id}`);
            yield access.updateAttributes({
                customFields: JSON.stringify(newCustomFields)
            });
        }
    });

    return function updateCustomFields(_x, _x2) {
        return _ref.apply(this, arguments);
    };
})();

/**
 * Run all the required migrations.
 *
 * To determine whether a migration has to be run or not, we are comparing its
 * index in the migrations Array above with the `migration-version` config
 * value, which indicates the next migration to run.
 */
let run = exports.run = (() => {
    var _ref21 = _asyncToGenerator(function* () {
        const migrationVersion = yield _config2.default.findOrCreateDefault('migration-version');

        // Cache to prevent loading multiple times the same data from the db.
        let cache = {};

        const firstMigrationIndex = parseInt(migrationVersion.value, 10);
        for (let m = firstMigrationIndex; m < migrations.length; m++) {
            if (!(yield migrations[m](cache))) {
                log.error(`Migration #${m} failed, aborting.`);
                return;
            }

            migrationVersion.value = (m + 1).toString();
            yield migrationVersion.save();
        }
    });

    return function run() {
        return _ref21.apply(this, arguments);
    };
})();

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

let log = (0, _helpers.makeLogger)('models/migrations');

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
let migrations = [(() => {
    var _ref2 = _asyncToGenerator(function* () {
        log.info('Removing weboob-log and weboob-installed from the db...');
        let weboobLog = yield _config2.default.byName('weboob-log');
        if (weboobLog) {
            log.info('\tDestroying Config[weboob-log].');
            yield weboobLog.destroy();
        }

        let weboobInstalled = yield _config2.default.byName('weboob-installed');
        if (weboobInstalled) {
            log.info('\tDestroying Config[weboob-installed].');
            yield weboobInstalled.destroy();
        }
        return true;
    });

    function m0() {
        return _ref2.apply(this, arguments);
    }

    return m0;
})(), (() => {
    var _ref3 = _asyncToGenerator(function* (cache) {
        log.info('Checking that operations with categories are consistent...');

        cache.operations = cache.operations || (yield _operation2.default.all());
        cache.categories = cache.categories || (yield _category2.default.all());

        let categorySet = new Set();
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = cache.categories[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                let c = _step.value;

                categorySet.add(c.id);
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

        let catNum = 0;
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
            for (var _iterator2 = cache.operations[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                let op = _step2.value;

                let needsSave = false;

                if (typeof op.categoryId !== 'undefined' && !categorySet.has(op.categoryId)) {
                    needsSave = true;
                    delete op.categoryId;
                    catNum += 1;
                }

                if (needsSave) {
                    yield op.save();
                }
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

        if (catNum) {
            log.info(`\t${catNum} operations had an inconsistent category.`);
        }
        return true;
    });

    function m1(_x3) {
        return _ref3.apply(this, arguments);
    }

    return m1;
})(), (() => {
    var _ref4 = _asyncToGenerator(function* (cache) {
        log.info('Replacing NONE_CATEGORY_ID by undefined...');

        cache.operations = cache.operations || (yield _operation2.default.all());

        let num = 0;
        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
            for (var _iterator3 = cache.operations[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                let o = _step3.value;

                if (typeof o.categoryId !== 'undefined' && o.categoryId.toString() === '-1') {
                    delete o.categoryId;
                    yield o.save();
                    num += 1;
                }
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

        if (num) {
            log.info(`\t${num} operations had -1 as categoryId.`);
        }

        return true;
    });

    function m2(_x4) {
        return _ref4.apply(this, arguments);
    }

    return m2;
})(), (() => {
    var _ref5 = _asyncToGenerator(function* (cache) {
        log.info('Migrating websites to the customFields format...');

        cache.accesses = cache.accesses || (yield _access2.default.all());

        let num = 0;

        let updateFields = function updateFields(website) {
            return function (customFields) {
                if (customFields.filter(function (field) {
                    return field.name === 'website';
                }).length) {
                    return customFields;
                }

                customFields.push({
                    name: 'website',
                    value: website
                });

                return customFields;
            };
        };

        var _iteratorNormalCompletion4 = true;
        var _didIteratorError4 = false;
        var _iteratorError4 = undefined;

        try {
            for (var _iterator4 = cache.accesses[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                let a = _step4.value;

                if (typeof a.website === 'undefined' || !a.website.length) {
                    continue;
                }

                let website = a.website;
                delete a.website;

                yield updateCustomFields(a, updateFields(website));

                yield a.save();
                num += 1;
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

        if (num) {
            log.info(`\t${num} accesses updated to the customFields format.`);
        }

        return true;
    });

    function m3(_x5) {
        return _ref5.apply(this, arguments);
    }

    return m3;
})(), (() => {
    var _ref6 = _asyncToGenerator(function* (cache) {
        log.info('Migrating HelloBank users to BNP and BNP users to the new website format.');

        cache.accesses = cache.accesses || (yield _access2.default.all());

        let updateFieldsBnp = function updateFieldsBnp(customFields) {
            if (customFields.filter(function (field) {
                return field.name === 'website';
            }).length) {
                return customFields;
            }

            customFields.push({
                name: 'website',
                value: 'pp'
            });

            log.info('\tBNP access updated to the new website format.');
            return customFields;
        };

        let updateFieldsHelloBank = function updateFieldsHelloBank(customFields) {
            customFields.push({
                name: 'website',
                value: 'hbank'
            });
            return customFields;
        };

        var _iteratorNormalCompletion5 = true;
        var _didIteratorError5 = false;
        var _iteratorError5 = undefined;

        try {
            for (var _iterator5 = cache.accesses[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                let a = _step5.value;

                if (a.bank === 'bnporc') {
                    yield updateCustomFields(a, updateFieldsBnp);
                    continue;
                }

                if (a.bank === 'hellobank') {
                    // Update access
                    yield updateCustomFields(a, updateFieldsHelloBank);

                    // Update accounts
                    let accounts = yield _account2.default.byBank({ uuid: 'hellobank' });
                    var _iteratorNormalCompletion6 = true;
                    var _didIteratorError6 = false;
                    var _iteratorError6 = undefined;

                    try {
                        for (var _iterator6 = accounts[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                            let acc = _step6.value;

                            yield acc.updateAttributes({ bank: 'bnporc' });
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

                    yield a.updateAttributes({ bank: 'bnporc' });
                    log.info("\tHelloBank access updated to use BNP's backend.");
                    continue;
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

        return true;
    });

    function m4(_x6) {
        return _ref6.apply(this, arguments);
    }

    return m4;
})(), (() => {
    var _ref7 = _asyncToGenerator(function* (cache) {
        log.info('Ensure "importDate" field is present in accounts.');

        cache.accounts = cache.accounts || (yield _account2.default.all());

        var _iteratorNormalCompletion7 = true;
        var _didIteratorError7 = false;
        var _iteratorError7 = undefined;

        try {
            for (var _iterator7 = cache.accounts[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                let a = _step7.value;

                if (typeof a.importDate !== 'undefined') {
                    continue;
                }

                log.info(`\t${a.accountNumber} has no importDate.`);

                let ops = yield _operation2.default.byAccount(a);

                let dateNumber = Date.now();
                if (ops.length) {
                    dateNumber = ops.reduce(reduceOperationsDate, Date.now());
                }

                a.importDate = new Date(dateNumber);
                yield a.save();

                log.info(`\tImport date for ${a.title} (${a.accountNumber}): ${a.importDate}`);
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

        return true;
    });

    function m5(_x7) {
        return _ref7.apply(this, arguments);
    }

    return m5;
})(), (() => {
    var _ref8 = _asyncToGenerator(function* (cache) {
        log.info('Migrate operationTypeId to type field...');
        try {
            cache.types = cache.types || (yield _operationtype2.default.all());

            if (cache.types.length) {
                let operations = yield _operation2.default.allWithOperationTypesId();
                log.info(`${operations.length} operations to migrate`);
                let typeMap = new Map();
                var _iteratorNormalCompletion8 = true;
                var _didIteratorError8 = false;
                var _iteratorError8 = undefined;

                try {
                    for (var _iterator8 = cache.types[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
                        let _ref9 = _step8.value;
                        let id = _ref9.id,
                            name = _ref9.name;

                        typeMap.set(id, name);
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

                var _iteratorNormalCompletion9 = true;
                var _didIteratorError9 = false;
                var _iteratorError9 = undefined;

                try {
                    for (var _iterator9 = operations[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
                        let operation = _step9.value;

                        if (operation.operationTypeID && typeMap.has(operation.operationTypeID)) {
                            operation.type = typeMap.get(operation.operationTypeID);
                        } else {
                            operation.type = _helpers.UNKNOWN_OPERATION_TYPE;
                        }
                        delete operation.operationTypeID;
                        yield operation.save();
                    }

                    // Delete operation types
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

                var _iteratorNormalCompletion10 = true;
                var _didIteratorError10 = false;
                var _iteratorError10 = undefined;

                try {
                    for (var _iterator10 = cache.types[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
                        let type = _step10.value;

                        yield type.destroy();
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

                delete cache.types;
            }

            return true;
        } catch (e) {
            log.error(`Error while updating operation type: ${e}`);
            return false;
        }
    });

    function m6(_x8) {
        return _ref8.apply(this, arguments);
    }

    return m6;
})(), (() => {
    var _ref10 = _asyncToGenerator(function* (cache) {
        log.info('Ensuring consistency of accounts with alerts...');

        try {
            let accountSet = new Set();

            cache.accounts = cache.accounts || (yield _account2.default.all());
            cache.alerts = cache.alerts || (yield _alert2.default.all());

            var _iteratorNormalCompletion11 = true;
            var _didIteratorError11 = false;
            var _iteratorError11 = undefined;

            try {
                for (var _iterator11 = cache.accounts[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
                    let account = _step11.value;

                    accountSet.add(account.accountNumber);
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

            let numOrphans = 0;
            var _iteratorNormalCompletion12 = true;
            var _didIteratorError12 = false;
            var _iteratorError12 = undefined;

            try {
                for (var _iterator12 = cache.alerts[Symbol.iterator](), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
                    let al = _step12.value;

                    if (typeof al.bankAccount === 'undefined') {
                        continue;
                    }
                    if (!accountSet.has(al.bankAccount)) {
                        numOrphans++;
                        yield al.destroy();
                    }
                }
                // Purge the alerts cache, next migration requiring it will rebuild
                // an updated cache.
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

            delete cache.alerts;

            if (numOrphans) {
                log.info(`\tfound and removed ${numOrphans} orphan alerts`);
            }

            return true;
        } catch (e) {
            log.error(`Error while ensuring consistency of alerts: ${e.toString()}`);
            return false;
        }
    });

    function m7(_x9) {
        return _ref10.apply(this, arguments);
    }

    return m7;
})(), (() => {
    var _ref11 = _asyncToGenerator(function* (cache) {
        log.info('Deleting banks from database');
        try {
            cache.banks = cache.banks || (yield _bank2.default.all());
            var _iteratorNormalCompletion13 = true;
            var _didIteratorError13 = false;
            var _iteratorError13 = undefined;

            try {
                for (var _iterator13 = cache.banks[Symbol.iterator](), _step13; !(_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done); _iteratorNormalCompletion13 = true) {
                    let bank = _step13.value;

                    yield bank.destroy();
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

            delete cache.banks;
            return true;
        } catch (e) {
            log.error(`Error while deleting banks: ${e.toString()}`);
            return false;
        }
    });

    function m8(_x10) {
        return _ref11.apply(this, arguments);
    }

    return m8;
})(), (() => {
    var _ref12 = _asyncToGenerator(function* () {
        log.info('Looking for a CMB access...');
        try {
            let accesses = yield _access2.default.byBank({ uuid: 'cmb' });
            var _iteratorNormalCompletion14 = true;
            var _didIteratorError14 = false;
            var _iteratorError14 = undefined;

            try {
                for (var _iterator14 = accesses[Symbol.iterator](), _step14; !(_iteratorNormalCompletion14 = (_step14 = _iterator14.next()).done); _iteratorNormalCompletion14 = true) {
                    let access = _step14.value;

                    // There is currently no other customFields, no need to update if it is defined.
                    if (typeof access.customFields === 'undefined') {
                        log.info('Found CMB access, migrating to "par" website.');
                        const updateCMB = function updateCMB() {
                            return [{ name: 'website', value: 'par' }];
                        };
                        yield updateCustomFields(access, updateCMB);
                    }
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

            return true;
        } catch (e) {
            log.error(`Error while migrating CMB accesses: ${e.toString()}`);
            return false;
        }
    });

    function m9() {
        return _ref12.apply(this, arguments);
    }

    return m9;
})(), (() => {
    var _ref13 = _asyncToGenerator(function* () {
        log.info('Looking for an s2e module...');
        try {
            let accesses = yield _access2.default.byBank({ uuid: 's2e' });
            var _iteratorNormalCompletion15 = true;
            var _didIteratorError15 = false;
            var _iteratorError15 = undefined;

            try {
                for (var _iterator15 = accesses[Symbol.iterator](), _step15; !(_iteratorNormalCompletion15 = (_step15 = _iterator15.next()).done); _iteratorNormalCompletion15 = true) {
                    let access = _step15.value;

                    let customFields = JSON.parse(access.customFields);

                    var _customFields$find = customFields.find(function (f) {
                        return f.name === 'website';
                    });

                    let website = _customFields$find.value;


                    switch (website) {
                        case 'smartphone.s2e-net.com':
                            log.info('\tMigrating s2e module to bnpere...');
                            access.bank = 'bnppere';
                            break;
                        case 'mobile.capeasi.com':
                            log.info('\tMigrating s2e module to capeasi...');
                            access.bank = 'capeasi';
                            break;
                        case 'm.esalia.com':
                            log.info('\tMigrating s2e module to esalia...');
                            access.bank = 'esalia';
                            break;
                        case 'mobi.ere.hsbc.fr':
                            log.error('\tCannot migrate module s2e.');
                            log.error('\tPlease create a new access using erehsbc module (HSBC ERE).');
                            break;
                        default:
                            log.error(`Invalid value for s2e module: ${website}`);
                    }
                    if (access.bank !== 's2e') {
                        delete access.customFields;
                        yield access.save();
                    }
                }
            } catch (err) {
                _didIteratorError15 = true;
                _iteratorError15 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion15 && _iterator15.return) {
                        _iterator15.return();
                    }
                } finally {
                    if (_didIteratorError15) {
                        throw _iteratorError15;
                    }
                }
            }

            return true;
        } catch (e) {
            log.error(`Error while migrating s2e accesses: ${e.toString()}`);
            return false;
        }
    });

    function m10() {
        return _ref13.apply(this, arguments);
    }

    return m10;
})(), (() => {
    var _ref14 = _asyncToGenerator(function* (cache) {
        log.info('Searching accounts with IBAN value set to None');
        try {
            cache.accounts = cache.accounts || (yield _account2.default.all());

            var _iteratorNormalCompletion16 = true;
            var _didIteratorError16 = false;
            var _iteratorError16 = undefined;

            try {
                for (var _iterator16 = cache.accounts.filter(function (acc) {
                    return acc.iban === 'None';
                })[Symbol.iterator](), _step16; !(_iteratorNormalCompletion16 = (_step16 = _iterator16.next()).done); _iteratorNormalCompletion16 = true) {
                    let account = _step16.value;

                    log.info(`\tDeleting iban for ${account.title} of bank ${account.bank}`);
                    delete account.iban;
                    yield account.save();
                }
            } catch (err) {
                _didIteratorError16 = true;
                _iteratorError16 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion16 && _iterator16.return) {
                        _iterator16.return();
                    }
                } finally {
                    if (_didIteratorError16) {
                        throw _iteratorError16;
                    }
                }
            }

            return true;
        } catch (e) {
            log.error(`Error while deleting iban with None value: ${e.toString()}`);
            return false;
        }
    });

    function m11(_x11) {
        return _ref14.apply(this, arguments);
    }

    return m11;
})(), (() => {
    var _ref15 = _asyncToGenerator(function* () {
        log.info("Ensuring the Config table doesn't contain any ghost settings.");
        try {
            var _iteratorNormalCompletion17 = true;
            var _didIteratorError17 = false;
            var _iteratorError17 = undefined;

            try {
                for (var _iterator17 = _config2.default.ghostSettings.keys()[Symbol.iterator](), _step17; !(_iteratorNormalCompletion17 = (_step17 = _iterator17.next()).done); _iteratorNormalCompletion17 = true) {
                    let ghostName = _step17.value;

                    let found = yield _config2.default.byName(ghostName);
                    if (found) {
                        yield found.destroy();
                        log.info(`\tRemoved ${ghostName} from the database.`);
                    }
                }
            } catch (err) {
                _didIteratorError17 = true;
                _iteratorError17 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion17 && _iterator17.return) {
                        _iterator17.return();
                    }
                } finally {
                    if (_didIteratorError17) {
                        throw _iteratorError17;
                    }
                }
            }

            return true;
        } catch (e) {
            log.error('Error while deleting the ghost settings from the Config table.');
            return false;
        }
    });

    function m12() {
        return _ref15.apply(this, arguments);
    }

    return m12;
})(), (() => {
    var _ref16 = _asyncToGenerator(function* () {
        log.info('Migrating the email configuration...');
        try {
            let found = yield _config2.default.byName('mail-config');
            if (!found) {
                log.info('Not migrating: email configuration not found.');
                return true;
            }

            var _JSON$parse = JSON.parse(found.value);

            let toEmail = _JSON$parse.toEmail;

            if (!toEmail) {
                log.info('Not migrating: recipient email not found in current configuration.');
                yield found.destroy();
                log.info('Previous configuration destroyed.');
                return true;
            }

            log.info(`Found mail config, migrating toEmail=${toEmail}.`);

            // There's a race condition hidden here: the user could have set a
            // new email address before the migration happened, at start. In
            // this case, this will just keep the email they've set.
            yield _config2.default.findOrCreateByName('email-recipient', toEmail);

            yield found.destroy();
            log.info('Done migrating recipient email configuration!');
            return true;
        } catch (e) {
            log.error('Error while migrating the email configuration: ', e.toString());
            return false;
        }
    });

    function m13() {
        return _ref16.apply(this, arguments);
    }

    return m13;
})(), (() => {
    var _ref17 = _asyncToGenerator(function* (cache) {
        try {
            log.info('Migrating empty access.customFields...');

            cache.accesses = cache.accesses || (yield _access2.default.all());

            var _iteratorNormalCompletion18 = true;
            var _didIteratorError18 = false;
            var _iteratorError18 = undefined;

            try {
                for (var _iterator18 = cache.accesses[Symbol.iterator](), _step18; !(_iteratorNormalCompletion18 = (_step18 = _iterator18.next()).done); _iteratorNormalCompletion18 = true) {
                    let access = _step18.value;

                    if (typeof access.customFields === 'undefined') {
                        continue;
                    }

                    try {
                        JSON.parse(access.customFields);
                    } catch (e) {
                        log.info(`Found invalid access.customFields for access with id=${access.id}, replacing by empty array.`);
                        access.customFields = '[]';
                        yield access.save();
                    }
                }
            } catch (err) {
                _didIteratorError18 = true;
                _iteratorError18 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion18 && _iterator18.return) {
                        _iterator18.return();
                    }
                } finally {
                    if (_didIteratorError18) {
                        throw _iteratorError18;
                    }
                }
            }

            return true;
        } catch (e) {
            log.error('Error while migrating empty access.customFields:', e.toString());
            return false;
        }
    });

    function m14(_x12) {
        return _ref17.apply(this, arguments);
    }

    return m14;
})(), (() => {
    var _ref18 = _asyncToGenerator(function* () {
        log.info('Removing weboob-version from the database...');
        try {
            let found = yield _config2.default.byName('weboob-version');
            if (found) {
                yield found.destroy();
                log.info('Found and deleted weboob-version.');
            }
            return true;
        } catch (e) {
            log.error('Error while removing weboob-version: ', e.toString());
            return false;
        }
    });

    function m15() {
        return _ref18.apply(this, arguments);
    }

    return m15;
})(), (() => {
    var _ref19 = _asyncToGenerator(function* (cache) {
        log.info('Linking operations to account by id instead of accountNumber');
        try {
            cache.operations = cache.operations || (yield _operation2.default.all());
            cache.accounts = cache.accounts || (yield _account2.default.all());

            let accountsMap = new Map();
            var _iteratorNormalCompletion19 = true;
            var _didIteratorError19 = false;
            var _iteratorError19 = undefined;

            try {
                for (var _iterator19 = cache.accounts[Symbol.iterator](), _step19; !(_iteratorNormalCompletion19 = (_step19 = _iterator19.next()).done); _iteratorNormalCompletion19 = true) {
                    let account = _step19.value;

                    if (accountsMap.has(account.accountNumber)) {
                        accountsMap.get(account.accountNumber).push(account);
                    } else {
                        accountsMap.set(account.accountNumber, [account]);
                    }
                }
            } catch (err) {
                _didIteratorError19 = true;
                _iteratorError19 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion19 && _iterator19.return) {
                        _iterator19.return();
                    }
                } finally {
                    if (_didIteratorError19) {
                        throw _iteratorError19;
                    }
                }
            }

            let newOperations = [];
            let numMigratedOps = 0;
            let numOrphanOps = 0;
            var _iteratorNormalCompletion20 = true;
            var _didIteratorError20 = false;
            var _iteratorError20 = undefined;

            try {
                for (var _iterator20 = cache.operations[Symbol.iterator](), _step20; !(_iteratorNormalCompletion20 = (_step20 = _iterator20.next()).done); _iteratorNormalCompletion20 = true) {
                    let op = _step20.value;

                    // Ignore already migrated operations.
                    if (typeof op.bankAccount === 'undefined') {
                        continue;
                    }

                    if (!accountsMap.has(op.bankAccount)) {
                        log.warn('Orphan operation, to be removed:', op);
                        numOrphanOps++;
                        yield op.destroy();
                        continue;
                    }

                    let cloneOperation = false;
                    var _iteratorNormalCompletion22 = true;
                    var _didIteratorError22 = false;
                    var _iteratorError22 = undefined;

                    try {
                        for (var _iterator22 = accountsMap.get(op.bankAccount)[Symbol.iterator](), _step22; !(_iteratorNormalCompletion22 = (_step22 = _iterator22.next()).done); _iteratorNormalCompletion22 = true) {
                            let account = _step22.value;

                            if (cloneOperation) {
                                let newOp = op.clone();
                                newOp.accountId = account.id;
                                newOp = yield _operation2.default.create(newOp);
                                newOperations.push(newOp);
                            } else {
                                cloneOperation = true;
                                op.accountId = account.id;
                                delete op.bankAccount;
                                yield op.save();
                                numMigratedOps++;
                            }
                        }
                    } catch (err) {
                        _didIteratorError22 = true;
                        _iteratorError22 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion22 && _iterator22.return) {
                                _iterator22.return();
                            }
                        } finally {
                            if (_didIteratorError22) {
                                throw _iteratorError22;
                            }
                        }
                    }
                }
            } catch (err) {
                _didIteratorError20 = true;
                _iteratorError20 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion20 && _iterator20.return) {
                        _iterator20.return();
                    }
                } finally {
                    if (_didIteratorError20) {
                        throw _iteratorError20;
                    }
                }
            }

            cache.operations = cache.operations.concat(newOperations);
            log.info(`${numMigratedOps} operations migrated`);
            log.info(`${numOrphanOps} orphan operations have been removed`);
            log.info(`${newOperations.length} new operations created`);
            log.info('All operations correctly migrated.');

            log.info('Linking alerts to account by id instead of accountNumber');
            cache.alerts = cache.alerts || (yield _alert2.default.all());
            let newAlerts = [];
            let numMigratedAlerts = 0;
            let numOrphanAlerts = 0;
            var _iteratorNormalCompletion21 = true;
            var _didIteratorError21 = false;
            var _iteratorError21 = undefined;

            try {
                for (var _iterator21 = cache.alerts[Symbol.iterator](), _step21; !(_iteratorNormalCompletion21 = (_step21 = _iterator21.next()).done); _iteratorNormalCompletion21 = true) {
                    let alert = _step21.value;

                    // Ignore already migrated alerts.
                    if (typeof alert.bankAccount === 'undefined') {
                        continue;
                    }

                    if (!accountsMap.has(alert.bankAccount)) {
                        log.warn('Orphan alert, to be removed:', alert);
                        numOrphanAlerts++;
                        yield alert.destroy();
                        continue;
                    }

                    let cloneAlert = false;
                    var _iteratorNormalCompletion23 = true;
                    var _didIteratorError23 = false;
                    var _iteratorError23 = undefined;

                    try {
                        for (var _iterator23 = accountsMap.get(alert.bankAccount)[Symbol.iterator](), _step23; !(_iteratorNormalCompletion23 = (_step23 = _iterator23.next()).done); _iteratorNormalCompletion23 = true) {
                            let account = _step23.value;

                            if (cloneAlert) {
                                let newAlert = alert.clone();
                                newAlert.accountId = account.id;
                                newAlert = yield _alert2.default.create(newAlert);
                                newAlerts.push(newAlert);
                            } else {
                                cloneAlert = true;
                                alert.accountId = account.id;
                                delete alert.bankAccount;
                                yield alert.save();
                                numMigratedAlerts++;
                            }
                        }
                    } catch (err) {
                        _didIteratorError23 = true;
                        _iteratorError23 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion23 && _iterator23.return) {
                                _iterator23.return();
                            }
                        } finally {
                            if (_didIteratorError23) {
                                throw _iteratorError23;
                            }
                        }
                    }
                }
            } catch (err) {
                _didIteratorError21 = true;
                _iteratorError21 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion21 && _iterator21.return) {
                        _iterator21.return();
                    }
                } finally {
                    if (_didIteratorError21) {
                        throw _iteratorError21;
                    }
                }
            }

            cache.alerts = cache.alerts.concat(newAlerts);
            log.info(`${numMigratedAlerts} alerts migrated`);
            log.info(`${numOrphanAlerts} orphan alerts have been removed`);
            log.info(`${newAlerts.length} new alerts created`);
            log.info('All alerts correctly migrated.');
            return true;
        } catch (e) {
            log.error('Error while linking operations and alerts to account by id: ', e.toString());
            return false;
        }
    });

    function m16(_x13) {
        return _ref19.apply(this, arguments);
    }

    return m16;
})(), (() => {
    var _ref20 = _asyncToGenerator(function* (cache) {
        log.info('Trying to apply m16 again after resolution of #733.');
        return yield migrations[16](cache);
    });

    function m17(_x14) {
        return _ref20.apply(this, arguments);
    }

    return m17;
})()];