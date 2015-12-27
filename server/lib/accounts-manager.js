import moment              from 'moment';

import Operation     from '../models/operation';
import Alert         from '../models/alert';
import Account       from '../models/account';
import OperationType from '../models/operationtype';

import Error         from '../controllers/errors';
import { makeLogger }  from '../helpers';

import alertManager  from './alert-manager';
import Notifications from './notifications';

let log = makeLogger('accounts-manager');

const SOURCE_HANDLERS = {};
function addBackend(exportObject) {
    if (typeof exportObject.SOURCE_NAME === 'undefined' ||
        typeof exportObject.fetchAccounts === 'undefined' ||
        typeof exportObject.fetchOperations === 'undefined') {
        throw "Backend doesn't implement basic functionalty";
    }

    SOURCE_HANDLERS[exportObject.SOURCE_NAME] = exportObject;
}

// Add backends here.
import * as mockBackend from './sources/mock';
import * as weboobBackend from './sources/weboob';

addBackend(mockBackend);
addBackend(weboobBackend);

// Connect static bank information to their backends.
const ALL_BANKS = require('../shared/banks.json');
const BANK_HANDLERS = {};
for (let bank of ALL_BANKS) {
    if (!bank.backend || !(bank.backend in SOURCE_HANDLERS))
        throw 'Bank handler not described or not imported.';
    BANK_HANDLERS[bank.uuid] = SOURCE_HANDLERS[bank.backend];
}


// Sync function
function tryMatchAccount(target, accounts) {

    for (let a of accounts) {

        if (a.bank !== target.bank)
            log.info(`data inconsistency when trying to match accounts with
                     existing ones: "bank" attributes are different`,
                     a.bank, target.bank);

        // Remove spaces (e.g. Credit Mutuel would randomly add spaces in
        // account names) and lower case.
        let oldTitle = a.title.replace(/ /g, '').toLowerCase();
        let newTitle = target.title.replace(/ /g, '').toLowerCase();

        // Keep in sync with the check at the top of mergeAccounts.
        if (oldTitle === newTitle &&
            a.accountNumber === target.accountNumber &&
            a.iban === target.iban) {
            return { found: true };
        }

        if (oldTitle === newTitle ||
            a.accountNumber === target.accountNumber) {
            return {
                mergeCandidates: {
                    old: a,
                    new: target
                }
            };
        }

    }

    return { found: false };
}


async function mergeAccounts(old, kid) {
    if (old.accountNumber === kid.accountNumber &&
        old.title === kid.title &&
        old.iban === kid.iban) {
        throw "mergeAccounts shouldn't have been called in the first place!";
    }

    log.info(`Merging (${old.accountNumber}, ${old.title}) with
             (${kid.accountNumber}, ${kid.title}).`);

    let ops = await Operation.byAccount(old);
    for (let op of ops) {
        if (op.bankAccount !== kid.accountNumber)
            await op.updateAttributes({ bankAccount: kid.accountNumber });
    }

    let alerts = await Alert.byAccount(old);
    for (let alert of alerts) {
        if (alert.bankAccount !== kid.accountNumber)
            await alert.updateAttributes({ bankAccount: kid.accountNumber });
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
        this.newAccounts = [];
        this.newOperations = [];
    }

    async retrieveAccountsByAccess(access) {
        if (!access.hasPassword()) {
            log.warn("Skipping accounts fetching -- password isn't present");
            throw {
                status: 500,
                code: Error('NO_PASSWORD'),
                message: "Access' password is not set"
            };
        }

        let body = await BANK_HANDLERS[access.bank].fetchAccounts(access);
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
                lastChecked: new Date()
            };
            accounts.push(account);
        }

        log.info(`-> ${accounts.length} bank account(s) found`);
        let oldAccounts = await Account.byAccess(access);
        for (let account of accounts) {

            let matches = tryMatchAccount(account, oldAccounts);
            if (matches.found) {
                log.info('Account was already present.');
                continue;
            }

            if (matches.mergeCandidates) {
                let m = matches.mergeCandidates;
                log.info('Found candidates for merging!');
                await mergeAccounts(m.old, m.new);
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
            throw {
                status: 500,
                code: Error('NO_PASSWORD'),
                message: "Access' password is not set"
            };
        }

        let body = await BANK_HANDLERS[access.bank].fetchOperations(access);
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
                dateImport: now.format('YYYY-MM-DDTHH:mm:ss.000Z'),
                raw: operationWeboob.raw,
                bankAccount: relatedAccount
            };

            let weboobType = operationWeboob.type;
            let operationType = OperationType.getOperationTypeID(weboobType);
            if (operationType !== null)
                operation.operationTypeID = operationType;
            operations.push(operation);
        }

        // Create real new operations
        for (let operation of operations) {
            let similarOperations = await Operation.allLike(operation);
            if (similarOperations && similarOperations.length)
                continue;

            log.info('New operation found!');
            let newOperation = await Operation.create(operation);
            this.newOperations.push(newOperation);
        }

        await this.afterOperationsRetrieved(access);
    }

    async afterOperationsRetrieved(access) {
        if (this.newAccounts && this.newAccounts.length) {
            log.info('Updating initial amount of newly imported accounts...');
        }

        let reducer = (sum, op) => sum + op.amount;
        for (let account of this.newAccounts) {
            let relatedOperations = this.newOperations.slice();
            relatedOperations = relatedOperations.filter(op =>
                op.bankAccount === account.accountNumber
            );

            if (!relatedOperations.length)
                continue;

            let offset = relatedOperations.reduce(reducer, 0);
            account.initialAmount -= offset;
            await account.save();
        }

        log.info("Updating 'last checked' for linked accounts...");
        let allAccounts = await Account.byAccess(access);
        for (let account of allAccounts) {
            await account.updateAttributes({ lastChecked: new Date() });
        }

        log.info('Informing user new operations have been imported...');
        let operationsCount = this.newOperations.length;
        // Don't show the notification after importing a new account.
        if (operationsCount > 0 && this.newAccounts.length === 0) {
            Notifications.send(
                `Kresus: ${operationsCount} new transaction(s) imported.`
            );
        }

        log.info('Checking alerts for accounts balance...');
        if (this.newOperations.length)
            await alertManager.checkAlertsForAccounts();

        log.info('Checking alerts for operations amount...');
        await alertManager.checkAlertsForOperations(this.newOperations);

        log.info('Post process: done.');

        // reset object
        this.newAccounts = [];
        this.newOperations = [];
    }
}
