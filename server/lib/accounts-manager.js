import moment              from 'moment';
import NotificationsHelper from 'cozy-notifications-helper';

import Operation     from '../models/operation';
import Alert         from '../models/alert';
import Account       from '../models/account';
import OperationType from '../models/operationtype';

import appData       from '../../package.json';
import alertManager  from './alert-manager';

let log = require('printit')({
    prefix: 'accounts-manager',
    date: true
});

// Add backends here.
const SOURCE_HANDLERS = {};
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
const ALL_BANKS = require('../../../weboob/banks-all.json');
const BANK_HANDLERS = {};
for (let bank of ALL_BANKS) {
    if (!bank.backend || !(bank.backend in SOURCE_HANDLERS))
        throw("Bank handler not described in the static JSON file, or not imported.");
    BANK_HANDLERS[bank.uuid] = SOURCE_HANDLERS[bank.backend];
}


// Sync function
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


async function MergeAccounts(old, kid) {
    if (old.accountNumber === kid.accountNumber &&
        old.title === kid.title &&
        old.iban === kid.iban)
    {
        throw "MergeAccounts shouldn't have been called in the first place!";
    }

    log.info(`Merging (${old.accountNumber}, ${old.title}) with (${kid.accountNumber}, ${kid.title})`);

    let ops = await Operation.byAccount(old);
    for (let op of ops) {
        if (op.bankAccount !== kid.accountNumber)
            await op.updateAttributes({bankAccount: kid.accountNumber});
    }

    let alerts = Alert.byAccount(old);
    for (let alert of alerts) {
        if (alert.bankAccount !== kid.accountNumber)
            await alert.updateAttributes({bankAccount: kid.accountNumber});
    }

    let newAccount = {
        accountNumber: kid.accountNumber,
        title: kid.title,
        iban: kid.iban
    };
    await old.updateAttributes(newAccount);
}

export default class AccountManager {

    constructor() {
        this.newAccounts = []
        this.newOperations = []
        this.notificator = new NotificationsHelper(appData.name);
    }

    async retrieveAccountsByAccess(access) {
        if (!access.hasPassword()) {
            log.warn("Skipping accounts fetching -- password isn't present");
            return;
        }

        let body = await BANK_HANDLERS[access.bank].FetchAccounts(access.bank, access.login, access.password, access.customFields);
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
        let oldAccounts = await Account.byAccess(access);
        for (let account of accounts) {

            let matches = TryMatchAccount(account, oldAccounts);
            if (matches.found) {
                log.info('Account was already present.');
                continue;
            }

            if (matches.mergeCandidates) {
                let m = matches.mergeCandidates;
                log.info('Found candidates for merging!');
                await MergeAccounts(m.old, m.new);
                continue;
            }

            log.info('New account found.');
            let newAccount = await Account.create(account);
            this.newAccounts.push(newAccount);
        }
    }

    async retrieveOperationsByAccess(access) {
        if (!access.hasPassword()) {
            log.warn("Skipping operations fetching -- password isn't present");
            return;
        }

        let body = await BANK_HANDLERS[access.bank].FetchOperations(access.bank, access.login, access.password, access.customFields);
        let operationsWeboob = body[`${access.bank}`];
        let operations = [];
        let now = moment();

        // Normalize weboob information
        // TODO could be done in the weboob source directly
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

        // Create real new operations
        for (let operation of operations) {
            let operations = await Operation.allLike(operation);
            if (operations && operations.length)
                continue;

            log.info("New operation found!");
            let newOperation = await Operation.create(operation);
            this.newOperations.push(newOperation);
        }

        await this.afterOperationsRetrieved(access);
    }

    async afterOperationsRetrieved(access) {
        log.info("Updating initial amount in the case of newly imported accounts...");
        for (let account of this.newAccounts) {
            let relatedOperations = this.newOperations.slice();
            relatedOperations = relatedOperations.filter(op => op.bankAccount == account.accountNumber);
            if (!relatedOperations.length)
                continue;

            let offset = relatedOperations.reduce((acc, op) => acc + op.amount, 0);
            account.initialAmount -= offset;
            await account.save();
        }

        log.info("Updating 'last checked' date for all accounts linked to this access...");
        let allAccounts = await Account.byAccess(access);
        for (let account of allAccounts) {
            await account.updateAttributes({lastChecked: new Date()});
        }

        log.info("Informing user new operations have been imported...");
        let operationsCount = this.newOperations.length;
        // Don't show the notification after importing a new account.
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

        log.info("Checking alerts for accounts balance...");
        if (this.newOperations.length)
            await alertManager.checkAlertsForAccounts();

        log.info("Checking alerts for operations amount...");
        await alertManager.checkAlertsForOperations(this.newOperations);

        log.info("Post process: done.");

        // reset object
        this.newAccounts = [];
        this.newOperations = [];
    }
}
