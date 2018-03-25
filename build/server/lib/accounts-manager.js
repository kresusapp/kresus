'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

// Effectively does a merge of two accounts that have been identified to be duplicates.
// - known is the former Account instance (known in Kresus's database).
// - provided is the new Account instance provided by the source backend.
let mergeAccounts = (() => {
    var _ref = _asyncToGenerator(function* (known, provided) {
        let newProps = {
            accountNumber: provided.accountNumber,
            title: provided.title,
            iban: provided.iban,
            currency: provided.currency
        };

        yield known.updateAttributes(newProps);
    });

    return function mergeAccounts(_x, _x2) {
        return _ref.apply(this, arguments);
    };
})();

// Returns a list of all the accounts returned by the backend, associated to
// the given bankAccess.


let retrieveAllAccountsByAccess = (() => {
    var _ref2 = _asyncToGenerator(function* (access, forceUpdate = false) {
        if (!access.hasPassword()) {
            log.warn("Skipping accounts fetching -- password isn't present");
            let errcode = (0, _helpers.getErrorCode)('NO_PASSWORD');
            throw new _helpers.KError("Access' password is not set", 500, errcode);
        }

        log.info(`Retrieve all accounts from access ${access.bank} with login ${access.login}`);

        let isDebugEnabled = yield _config2.default.findOrCreateDefaultBooleanValue('weboob-enable-debug');
        let sourceAccounts = yield handler(access).fetchAccounts({
            access,
            debug: isDebugEnabled,
            update: forceUpdate
        });

        let accounts = [];
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
            for (var _iterator2 = sourceAccounts[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                let accountWeboob = _step2.value;

                let account = {
                    accountNumber: accountWeboob.accountNumber,
                    bank: access.bank,
                    bankAccess: access.id,
                    iban: accountWeboob.iban,
                    title: accountWeboob.title,
                    initialAmount: accountWeboob.balance,
                    lastChecked: new Date(),
                    importDate: new Date()
                };
                if (_helpers.currency.isKnown(accountWeboob.currency)) {
                    account.currency = accountWeboob.currency;
                }
                accounts.push(account);
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

        log.info(`-> ${accounts.length} bank account(s) found`);

        return accounts;
    });

    return function retrieveAllAccountsByAccess(_x3) {
        return _ref2.apply(this, arguments);
    };
})();

// Sends notification for a given access, considering a list of newOperations
// and an accountMap (mapping accountId -> account).


let notifyNewOperations = (() => {
    var _ref3 = _asyncToGenerator(function* (access, newOperations, accountMap) {
        let newOpsPerAccount = new Map();

        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
            for (var _iterator3 = newOperations[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                let newOp = _step3.value;

                let opAccountId = newOp.accountId;
                if (!newOpsPerAccount.has(opAccountId)) {
                    newOpsPerAccount.set(opAccountId, [newOp]);
                } else {
                    newOpsPerAccount.get(opAccountId).push(newOp);
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

        let bank = _bank2.default.byUuid(access.bank);
        (0, _helpers.assert)(bank, 'The bank must be known');

        var _iteratorNormalCompletion4 = true;
        var _didIteratorError4 = false;
        var _iteratorError4 = undefined;

        try {
            for (var _iterator4 = newOpsPerAccount.entries()[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                let _ref4 = _step4.value;

                var _ref5 = _slicedToArray(_ref4, 2);

                let accountId = _ref5[0];
                let ops = _ref5[1];

                var _accountMap$get = accountMap.get(accountId);

                let account = _accountMap$get.account;

                /* eslint-disable camelcase */

                let params = {
                    account_title: `${bank.name} - ${account.title}`,
                    smart_count: ops.length
                };

                if (ops.length === 1) {
                    // Send a notification with the operation content
                    let formatCurrency = _helpers.currency.makeFormat(account.currency);
                    params.operation_details = `${ops[0].title} ${formatCurrency(ops[0].amount)}`;
                }

                _notifications2.default.send((0, _helpers.translate)('server.notification.new_operation', params));
                /* eslint-enable camelcase */
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
    });

    return function notifyNewOperations(_x4, _x5, _x6) {
        return _ref3.apply(this, arguments);
    };
})();

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _access = require('../models/access');

var _access2 = _interopRequireDefault(_access);

var _account = require('../models/account');

var _account2 = _interopRequireDefault(_account);

var _bank = require('../models/bank');

var _bank2 = _interopRequireDefault(_bank);

var _config = require('../models/config');

var _config2 = _interopRequireDefault(_config);

var _operation = require('../models/operation');

var _operation2 = _interopRequireDefault(_operation);

var _operationtype = require('../models/operationtype');

var _operationtype2 = _interopRequireDefault(_operationtype);

var _helpers = require('../helpers');

var _asyncQueue = require('./async-queue');

var _asyncQueue2 = _interopRequireDefault(_asyncQueue);

var _alertManager = require('./alert-manager');

var _alertManager2 = _interopRequireDefault(_alertManager);

var _notifications = require('./notifications');

var _notifications2 = _interopRequireDefault(_notifications);

var _diffAccounts = require('./diff-accounts');

var _diffAccounts2 = _interopRequireDefault(_diffAccounts);

var _mock = require('./sources/mock');

var mockBackend = _interopRequireWildcard(_mock);

var _weboob = require('./sources/weboob');

var weboobBackend = _interopRequireWildcard(_weboob);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

let log = (0, _helpers.makeLogger)('accounts-manager');

const SOURCE_HANDLERS = {};
function addBackend(exportObject) {
    if (typeof exportObject.SOURCE_NAME === 'undefined' || typeof exportObject.fetchAccounts === 'undefined' || typeof exportObject.fetchOperations === 'undefined') {
        throw new _helpers.KError("Backend doesn't implement basic functionalty");
    }

    SOURCE_HANDLERS[exportObject.SOURCE_NAME] = exportObject;
}

// Add backends here.


addBackend(mockBackend);
addBackend(weboobBackend);

// Connect static bank information to their backends.
const ALL_BANKS = require('../shared/banks.json');

const BANK_HANDLERS = {};

var _iteratorNormalCompletion = true;
var _didIteratorError = false;
var _iteratorError = undefined;

try {
    for (var _iterator = ALL_BANKS[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        let bank = _step.value;

        if (!bank.backend || !(bank.backend in SOURCE_HANDLERS)) {
            throw new _helpers.KError('Bank handler not described or not imported.');
        }
        BANK_HANDLERS[bank.uuid] = SOURCE_HANDLERS[bank.backend];
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

function handler(access) {
    return BANK_HANDLERS[access.bank];
}

class AccountManager {
    constructor() {
        this.newAccountsMap = new Map();
        this.q = new _asyncQueue2.default();

        this.retrieveNewAccountsByAccess = this.q.wrap(this.retrieveNewAccountsByAccess.bind(this));
        this.retrieveOperationsByAccess = this.q.wrap(this.retrieveOperationsByAccess.bind(this));
        this.resyncAccountBalance = this.q.wrap(this.resyncAccountBalance.bind(this));
    }

    retrieveNewAccountsByAccess(access, shouldAddNewAccounts, forceUpdate = false) {
        var _this = this;

        return _asyncToGenerator(function* () {
            if (_this.newAccountsMap.size) {
                log.warn('At the top of retrieveNewAccountsByAccess, newAccountsMap must be empty.');
                _this.newAccountsMap.clear();
            }

            let accounts = yield retrieveAllAccountsByAccess(access, forceUpdate);

            let oldAccounts = yield _account2.default.byAccess(access);

            let diff = (0, _diffAccounts2.default)(oldAccounts, accounts);

            var _iteratorNormalCompletion5 = true;
            var _didIteratorError5 = false;
            var _iteratorError5 = undefined;

            try {
                for (var _iterator5 = diff.perfectMatches[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                    let _ref6 = _step5.value;

                    var _ref7 = _slicedToArray(_ref6, 1);

                    let known = _ref7[0];

                    log.info(`Account ${known.id} already known and in Kresus's database`);
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

            var _iteratorNormalCompletion6 = true;
            var _didIteratorError6 = false;
            var _iteratorError6 = undefined;

            try {
                for (var _iterator6 = diff.providerOrphans[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                    let account = _step6.value;

                    log.info('New account found: ', account.title);

                    if (!shouldAddNewAccounts) {
                        log.info('=> Not saving it, as per request');
                        continue;
                    }

                    log.info('=> Saving it as per request.');

                    let newAccountInfo = {
                        account: null,
                        balanceOffset: 0
                    };

                    // Save the account in DB and in the new accounts map.
                    let newAccount = yield _account2.default.create(account);
                    newAccountInfo.account = newAccount;

                    _this.newAccountsMap.set(newAccount.id, newAccountInfo);
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

            var _iteratorNormalCompletion7 = true;
            var _didIteratorError7 = false;
            var _iteratorError7 = undefined;

            try {
                for (var _iterator7 = diff.knownOrphans[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                    let account = _step7.value;

                    log.info("Orphan account found in Kresus's database: ", account.accountNumber);
                    // TODO do something with orphan accounts!
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

            let shouldMergeAccounts = yield _config2.default.findOrCreateDefaultBooleanValue('weboob-auto-merge-accounts');

            if (shouldMergeAccounts) {
                var _iteratorNormalCompletion8 = true;
                var _didIteratorError8 = false;
                var _iteratorError8 = undefined;

                try {
                    for (var _iterator8 = diff.duplicateCandidates[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
                        let _ref8 = _step8.value;

                        var _ref9 = _slicedToArray(_ref8, 2);

                        let known = _ref9[0];
                        let provided = _ref9[1];

                        log.info(`Found candidates for accounts merging:
- ${known.accountNumber} / ${known.title}
- ${provided.accountNumber} / ${provided.title}`);
                        yield mergeAccounts(known, provided);
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
            } else {
                log.info(`Found ${diff.duplicateCandidates.length} candidates for merging, but not
merging as per request`);
            }
        })();
    }

    // Not wrapped in the sequential queue: this would introduce a deadlock
    // since retrieveNewAccountsByAccess is wrapped!
    retrieveAndAddAccountsByAccess(access) {
        var _this2 = this;

        return _asyncToGenerator(function* () {
            return yield _this2.retrieveNewAccountsByAccess(access, true);
        })();
    }

    retrieveOperationsByAccess(access) {
        var _this3 = this;

        return _asyncToGenerator(function* () {
            if (!access.hasPassword()) {
                log.warn("Skipping operations fetching -- password isn't present");
                let errcode = (0, _helpers.getErrorCode)('NO_PASSWORD');
                throw new _helpers.KError("Access' password is not set", 500, errcode);
            }

            let operations = [];

            let now = (0, _moment2.default)().format('YYYY-MM-DDTHH:mm:ss.000Z');

            let allAccounts = yield _account2.default.byAccess(access);
            let accountMap = new Map();
            let accountIdNumberMap = new Map();
            var _iteratorNormalCompletion9 = true;
            var _didIteratorError9 = false;
            var _iteratorError9 = undefined;

            try {
                for (var _iterator9 = allAccounts[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
                    let account = _step9.value;

                    accountIdNumberMap.set(account.accountNumber, account.id);
                    if (_this3.newAccountsMap.has(account.id)) {
                        let oldEntry = _this3.newAccountsMap.get(account.id);
                        accountMap.set(account.id, oldEntry);
                        continue;
                    }

                    accountMap.set(account.id, {
                        account,
                        balanceOffset: 0
                    });
                }

                // Eagerly clear state.
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

            _this3.newAccountsMap.clear();

            // Fetch source operations
            let isDebugEnabled = yield _config2.default.findOrCreateDefaultBooleanValue('weboob-enable-debug');
            let sourceOps = yield handler(access).fetchOperations({ access, debug: isDebugEnabled });

            log.info('Normalizing source information...');
            var _iteratorNormalCompletion10 = true;
            var _didIteratorError10 = false;
            var _iteratorError10 = undefined;

            try {
                for (var _iterator10 = sourceOps[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
                    let sourceOp = _step10.value;

                    if (!accountIdNumberMap.has(sourceOp.account)) {
                        log.error('Operation attached to an unknown account, skipping');
                        continue;
                    }
                    let operation = {
                        accountId: accountIdNumberMap.get(sourceOp.account),
                        amount: sourceOp.amount,
                        raw: sourceOp.raw,
                        date: sourceOp.date,
                        title: sourceOp.title,
                        binary: sourceOp.binary,
                        debitDate: sourceOp.debit_date
                    };

                    operation.title = operation.title || operation.raw || '';
                    operation.date = operation.date || now;
                    operation.debitDate = operation.debitDate || now;
                    operation.dateImport = now;

                    let operationType = _operationtype2.default.idToName(sourceOp.type);

                    // The default type's value is directly set by the operation model.
                    if (operationType !== null) {
                        operation.type = operationType;
                    }

                    operations.push(operation);
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

            log.info('Comparing with database to ignore already known operations…');
            let newOperations = [];
            var _iteratorNormalCompletion11 = true;
            var _didIteratorError11 = false;
            var _iteratorError11 = undefined;

            try {
                for (var _iterator11 = operations[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
                    let operation = _step11.value;

                    let accountInfo = accountMap.get(operation.accountId);

                    // Ignore operations already known in database.
                    let similarOperations = yield _operation2.default.allLike(operation);
                    if (similarOperations && similarOperations.length) {
                        continue;
                    }

                    // It is definitely a new operation.
                    let debitDate = (0, _moment2.default)(operation.debitDate);
                    delete operation.debitDate;

                    newOperations.push(operation);

                    // Remember amounts of operations older than the import, to resync balance.
                    if (+debitDate < +accountInfo.account.importDate) {
                        accountInfo.balanceOffset += +operation.amount;
                    }
                }

                // Create the new operations
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

            let numNewOperations = newOperations.length;
            if (numNewOperations) {
                log.info(`${newOperations.length} new operations found!`);
            }

            let toCreate = newOperations;
            newOperations = [];
            if (toCreate.length > 0) {
                log.info('Creating new operations…');
            }

            var _iteratorNormalCompletion12 = true;
            var _didIteratorError12 = false;
            var _iteratorError12 = undefined;

            try {
                for (var _iterator12 = toCreate[Symbol.iterator](), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
                    let operationToCreate = _step12.value;

                    let created = yield _operation2.default.create(operationToCreate);
                    newOperations.push(created);
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

            log.info('Updating accounts balances…');
            var _iteratorNormalCompletion13 = true;
            var _didIteratorError13 = false;
            var _iteratorError13 = undefined;

            try {
                for (var _iterator13 = accountMap.values()[Symbol.iterator](), _step13; !(_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done); _iteratorNormalCompletion13 = true) {
                    let _ref10 = _step13.value;
                    let account = _ref10.account,
                        balanceOffset = _ref10.balanceOffset;

                    if (balanceOffset) {
                        log.info(`Account ${account.title} initial balance is going to be resynced, by an
offset of ${balanceOffset}.`);
                        account.initialAmount -= balanceOffset;
                        yield account.save();
                    }
                }

                // Carry over all the triggers on new operations.
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

            log.info("Updating 'last checked' for linked accounts...");
            let accounts = [];
            let lastChecked = new Date();
            var _iteratorNormalCompletion14 = true;
            var _didIteratorError14 = false;
            var _iteratorError14 = undefined;

            try {
                for (var _iterator14 = allAccounts[Symbol.iterator](), _step14; !(_iteratorNormalCompletion14 = (_step14 = _iterator14.next()).done); _iteratorNormalCompletion14 = true) {
                    let account = _step14.value;

                    let updated = yield account.updateAttributes({ lastChecked });
                    accounts.push(updated);
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

            if (numNewOperations > 0) {
                log.info(`Informing user ${numNewOperations} new operations have been imported...`);
                yield notifyNewOperations(access, newOperations, accountMap);
            }

            log.info('Checking alerts for accounts balance...');
            if (numNewOperations) {
                yield _alertManager2.default.checkAlertsForAccounts(access);
            }

            log.info('Checking alerts for operations amount...');
            yield _alertManager2.default.checkAlertsForOperations(access, newOperations);

            access.fetchStatus = 'OK';
            yield access.save();
            log.info('Post process: done.');

            return { accounts, newOperations };
        })();
    }

    resyncAccountBalance(account) {
        return _asyncToGenerator(function* () {
            let access = yield _access2.default.find(account.bankAccess);

            // Note: we do not fetch operations before, because this can lead to duplicates,
            // and compute a false initial balance.

            let accounts = yield retrieveAllAccountsByAccess(access);

            let retrievedAccount = accounts.find(function (acc) {
                return acc.accountNumber === account.accountNumber;
            });

            if (typeof retrievedAccount !== 'undefined') {
                let realBalance = retrievedAccount.initialAmount;

                let operations = yield _operation2.default.byAccount(account);
                let operationsSum = operations.reduce(function (amount, op) {
                    return amount + op.amount;
                }, 0);
                let kresusBalance = operationsSum + account.initialAmount;

                if (Math.abs(realBalance - kresusBalance) > 0.01) {
                    log.info(`Updating balance for account ${account.accountNumber}`);
                    account.initialAmount = realBalance - operationsSum;
                    yield account.save();
                }
            } else {
                // This case can happen if it's a known orphan.
                throw new _helpers.KError('account not found', 404);
            }
            return account;
        })();
    }
}

exports.default = new AccountManager();