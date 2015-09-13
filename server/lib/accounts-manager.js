let moment              = require('moment');
let async               = require('async');
let NotificationsHelper = require('cozy-notifications-helper');

let Bank                = require('../models/bank');
let BankOperation       = require('../models/operation');
let BankAlert           = require('../models/alert');
let BankAccount         = require('../models/account');
let OperationType       = require('../models/operationtype');

let appData             = require('../../package.json');
let alertManager        = require('./alert-manager');

let log = require('printit')({
    prefix: 'accounts-manager',
    date: true
});

// Add backends here.
let SOURCE_HANDLERS = {};
function AddBackend(exportObject) {
    if (typeof exportObject.SOURCE_NAME === 'undefined' ||
        typeof exportObject.FetchAccounts === 'undefined' ||
        typeof exportObject.FetchOperations === 'undefined')
    {
        throw("Backend doesn't implement basic functionalty, see accounts-manager.js.");
    }

    SOURCE_HANDLERS[exportObject.SOURCE_NAME] = exportObject;
}

AddBackend(require('./sources/mock'));
AddBackend(require('./sources/weboob'));

// Connect static bank information to their backends.
let ALL_BANKS = require('../../../weboob/banks-all.json');
let BANK_HANDLERS = {};
for (let bank of ALL_BANKS) {
    if (!bank.backend || !(bank.backend in SOURCE_HANDLERS))
        throw("Bank handler not described in the static JSON file, or not imported.");
    BANK_HANDLERS[bank.uuid] = SOURCE_HANDLERS[bank.backend];
}


function TryMatchAccount(target, accounts) {

    for (let a of accounts) {

        if (a.bank !== target.bank)
            log.info('data inconsistency when trying to match accounts with existing ones: "bank" attributes are different', a.bank, target.bank);

        // Remove spaces (e.g. Credit Mutuel would randomly add spaces in
        // account names) and lower case.
        let oldTitle = a.title.replace(/ /g, '').toLowerCase();
        let newTitle = target.title.replace(/ /g, '').toLowerCase();

        // Keep in sync with the check at the top of MergeAccounts.
        if (oldTitle === newTitle &&
            a.accountNumber === target.accountNumber &&
            a.iban === target.iban)
        {
            return {found: true};
        }

        if (oldTitle === newTitle ||
            a.accountNumber === target.accountNumber)
        {
            return {
                mergeCandidates: {
                    old: a,
                    new: target
                }
            };
        }

    }

    return {found: false};
}


function MergeAccounts(old, kid, callback) {

    if (old.accountNumber === kid.accountNumber &&
        old.title === kid.title &&
        old.iban === kid.iban)
    {
        return callback("MergeAccounts shouldn't have been called in the first place!");
    }

    log.info(`Merging (${old.accountNumber}, ${old.title}) with (${kid.accountNumber}, ${kid.title})`);

    function replaceBankAccount(obj, next) {
        if (obj.bankAccount !== kid.accountNumber)
            obj.updateAttributes({bankAccount: kid.accountNumber}, next);
        else
            next();
    }

    // 1. Update operations
    BankOperation.allFromBankAccount(old, (err, ops) => {
        if (err) {
            log.error(`when merging accounts (reading operations): ${err}`);
            return callback(err);
        }

        async.eachSeries(ops, replaceBankAccount, (err) => {
            if (err) {
                log.error(`when updating operations, on a merge: ${err}`);
                return callback(err);
            }

            // 2. Update alerts
            BankAlert.allFromBankAccount(old, (err, als) => {
                if (err) {
                    log.error("when merging accounts (reading alerts): ${err}");
                    return callback(err);
                }

                async.eachSeries(als, replaceBankAccount, err => {
                    if (err) {
                        log.error("when updating alerts, on a merge: ${err}");
                        return callback(err);
                    }

                    // 3. Update account
                    let newAccount = {
                        accountNumber: kid.accountNumber,
                        title: kid.title,
                        iban: kid.iban
                    };

                    old.updateAttributes(newAccount, callback);
                });
            });
        });
    });
}

export default class AccountManager {

    constructor() {
        this.newAccounts = []
        this.newOperations = []
        this.notificator = new NotificationsHelper(appData.name);
    }

    retrieveAccountsByBankAccess(access, callback) {
        BANK_HANDLERS[access.bank].FetchAccounts(access.bank, access.login, access.password, access.website, (err, body) => {

            if (err) {
                log.error(`When fetching accounts: ${JSON.stringify(err)}`);
                return callback(err);
            }

            let accountsWeboob = body[`${access.bank}`];
            let accounts = [];

            for (let accountWeboob of accountsWeboob) {
                let account = {
                    accountNumber: accountWeboob.accountNumber,
                    bank: access.bank,
                    bankAccess: access.id,
                    iban: accountWeboob.iban,
                    title: accountWeboob.label,
                    initialAmount: accountWeboob.balance,
                    lastChecked: new Date(),
                };
                accounts.push(account);
            }

            log.info(`-> ${accounts.length} bank account(s) found`);

            this.processRetrievedAccounts(access, accounts, callback);
        });
    }

    processRetrievedAccounts(access, newAccounts, callback) {

        BankAccount.allFromBankAccess(access, (err, oldAccounts) => {

            if (err) {
                log.error('when trying to find identical accounts:', err);
                return callback(err);
            }

            let processAccount = (account, callback) => {

                    let matches = TryMatchAccount(account, oldAccounts);
                    if (matches.found) {
                        log.info('Account was already present.');
                        callback(null);
                        return;
                    }

                    if (matches.mergeCandidates) {
                        let m = matches.mergeCandidates;
                        log.info('Found candidates for merging!');
                        MergeAccounts(m.old, m.new, callback);
                        return;
                    }

                    log.info('New account found.');
                    BankAccount.create(account, (err, account) => {
                        if (err)
                            return callback(err);
                        this.newAccounts.push(account);
                        callback();
                    });

            };

            async.each(newAccounts, processAccount, err => {
                if (err)
                    log.info(err);
                callback(err);
            });
        });
    }

    retrieveOperationsByBankAccess(access, callback) {

        BANK_HANDLERS[access.bank].FetchOperations(access.bank, access.login, access.password, access.website, (err, body) => {

            if (err) {
                log.error(`When fetching operations: ${JSON.stringify(err)}`);
                callback(err);
                return
            }

            let operationsWeboob = body[`${access.bank}`];
            let operations = [];
            let now = moment();
            for (let operationWeboob of operationsWeboob) {
                let relatedAccount = operationWeboob.account;
                let operation = {
                    title: operationWeboob.label,
                    amount: operationWeboob.amount,
                    date: operationWeboob.rdate,
                    dateImport: now.format("YYYY-MM-DDTHH:mm:ss.000Z"),
                    raw: operationWeboob.raw,
                    bankAccount: relatedAccount
                };
                let operationType = OperationType.getOperationTypeID(operationWeboob.type);
                if (typeof operationType !== 'undefined')
                    operation.operationTypeID = operationType;
                operations.push(operation);
            }

            this.processRetrievedOperations(operations, callback);
        });

    }

    processRetrievedOperations(operations, callback) {
        async.each(operations, this.processRetrievedOperation.bind(this), (err) => {
            if (err)
                log.info(err);
            this.afterOperationsRetrieved(callback);
        });
    }

    processRetrievedOperation(operation, callback) {
        BankOperation.allLike(operation, (err, operations) => {
            if (err) {
                log.error(`When comparing operations with an existing one: ${err}`);
                callback(err);
                return;
            }

            if (operations && operations.length)
                return callback();

            log.info("New operation found!");
            BankOperation.create(operation, (err, operation) => {
                if (err)
                    return callback(err);
                this.newOperations.push(operation);
                callback();
            });
        });
    }

    afterOperationsRetrieved(callback) {
        let processes = [
            this._updateInitialAmountFirstImport.bind(this),
            this._updateLastCheckedBankAccount.bind(this),
            this._notifyNewOperations.bind(this),
            this._checkAccountsAlerts.bind(this),
            this._checkOperationsAlerts.bind(this)
        ];

        async.series(processes, (err) => {
            if (err)
                log.error("Post process error: ", err);
            else
                log.info("Post process: done.");
            // reset object
            this.newAccounts = [];
            this.newOperations = [];
            callback(err);
        });
    }

    _updateInitialAmountFirstImport(callback) {
        if (!this.newAccounts.length)
            return callback();

        function process(account, cb) {
            let relatedOperations = this.newOperations.slice().filter(op => op.bankAccount == account.accountNumber);
            if (!relatedOperations.length)
                return cb();
            let offset = relatedOperations.reduce((acc, op) => acc + op.amount, 0);
            account.initialAmount -= offset;
            account.save(cb);
            return
        }

        async.each(this.newAccounts, process, callback);
    }

    _notifyNewOperations(callback) {
        log.info("Informing user new operations have been imported...");
        let operationsCount = this.newOperations.length;

        // we don't show the notification on account import
        if (operationsCount > 0 && this.newAccounts.length === 0) {
            let params = {
                text: `Kresus: ${operationsCount} new transaction(s) imported.`,
                resource: {
                    app: 'kresus',
                    url: '/'
                }
            };
            this.notificator.createTemporary(params);
        }

        callback();
    }

    _updateLastCheckedBankAccount(callback) {
        log.info("Updating 'last checked' date for all accounts...");

        // TODO this is incorrect if you have several banks
        BankAccount.all((err, accounts) => {
            if (err)
                callback(err);
            function process(account, callback) {
                account.updateAttributes({lastChecked: new Date()}, callback);
            }
            async.each(accounts, process, callback);
        });
    }

    _checkAccountsAlerts(callback) {
        log.info("Checking alerts for accounts balance...");

        // If no new operations, it is useless to notify the user again
        if (this.newOperations.length > 0)
            alertManager.checkAlertsForAccounts(callback);
        else
            callback();
    }

    _checkOperationsAlerts(callback) {
        log.info("Checking alerts for operations amount");
        alertManager.checkAlertsForOperations(this.newOperations, callback);
    }
}
