import moment        from 'moment';

import Operation     from '../models/operation';
import Alert         from '../models/alert';
import Account       from '../models/account';
import OperationType from '../models/operationtype';

import { KError, getErrorCode, makeLogger, translate as $t,
         currency } from '../helpers';

import alertManager  from './alert-manager';
import Notifications from './notifications';

let log = makeLogger('accounts-manager');

const SOURCE_HANDLERS = {};
function addBackend(exportObject) {
    if (typeof exportObject.SOURCE_NAME === 'undefined' ||
        typeof exportObject.fetchAccounts === 'undefined' ||
        typeof exportObject.fetchTransactions === 'undefined') {
        throw new KError("Backend doesn't implement basic functionalty");
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
        throw new KError('Bank handler not described or not imported.');
    BANK_HANDLERS[bank.uuid] = SOURCE_HANDLERS[bank.backend];
}

function handler(access) {
    return BANK_HANDLERS[access.bank];
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
            a.iban === target.iban &&
            a.currency === target.currency) {
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
        old.iban === kid.iban &&
        old.currency === kid.currency) {
        throw new KError('trying to merge the same accounts');
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
        iban: kid.iban,
        currency: kid.currency
    };
    await old.updateAttributes(newAccount);
}

export default class AccountManager {

    constructor() {
        this.newAccounts = [];
        this.newOperations = [];
    }

    async retrieveAndAddAccountsByAccess(access) {
        return await this.retrieveAccountsByAccess(access, true);
    }

    async retrieveAccountsByAccess(access, shouldAddNewAccounts) {
        if (!access.hasPassword()) {
            log.warn("Skipping accounts fetching -- password isn't present");
            let errcode = getErrorCode('NO_PASSWORD');
            throw new KError("Access' password is not set", 500, errcode);
        }

        let sourceAccounts = await handler(access).fetchAccounts(access);
        let accounts = [];
        for (let accountWeboob of sourceAccounts) {
            let account = {
                accountNumber: accountWeboob.accountNumber,
                bank: access.bank,
                bankAccess: access.id,
                iban: accountWeboob.iban,
                title: accountWeboob.label,
                initialAmount: accountWeboob.balance,
                lastChecked: new Date()
            };
            if (currency.isKnown(accountWeboob.currency)) {
                account.currency = accountWeboob.currency;
            }
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

            if (shouldAddNewAccounts) {
                log.info('New account found.');
                let newAccount = await Account.create(account);
                this.newAccounts.push(newAccount);
            }
        }
    }

    async retrieveOperationsByAccess(access) {
        if (!access.hasPassword()) {
            log.warn("Skipping operations fetching -- password isn't present");
            let errcode = getErrorCode('NO_PASSWORD');
            throw new KError("Access' password is not set", 500, errcode);
        }

        let sourceOps = await handler(access).fetchTransactions(access);

        let operations = [];

        let now = moment().format('YYYY-MM-DDTHH:mm:ss.000Z');

        // Normalize source information
        for (let sourceOp of sourceOps) {

            let operation = {
                bankAccount: sourceOp.account,
                amount: sourceOp.amount,
                raw: sourceOp.raw,
                date: sourceOp.date,
                title: sourceOp.title
            };

            operation.title = operation.title || operation.raw || '';
            operation.date = operation.date || now;
            operation.dateImport = now;

            let operationType = OperationType.getOperationTypeID(sourceOp.type);
            if (operationType !== null)
                operation.operationTypeID = operationType;

            operations.push(operation);
        }

        // Identify the operations to create: an operation can be created
        // if no duplicate can be found for this operation.
        let operationsToCreate = [];
        for (let operation of operations) {
            let similarOperations = await Operation.allLike(operation);
            if (similarOperations && similarOperations.length)
                continue;
            operationsToCreate.push(operation);
        }

        // Create the new operations
        if (operationsToCreate.length) {
            log.info(`${operationsToCreate.length} new operations found!`);
        }
        for (let operationToCreate of operationsToCreate) {
            let newOperation = await Operation.create(operationToCreate);
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

            /* eslint-disable camelcase */
            let count = { smart_count: operationsCount };
            Notifications.send(
                $t('server.notification.new_operation', count)
            );

            /* eslint-enable camelcase */
        }

        log.info('Checking alerts for accounts balance...');
        if (this.newOperations.length)
            await alertManager.checkAlertsForAccounts();

        log.info('Checking alerts for operations amount...');
        await alertManager.checkAlertsForOperations(this.newOperations);

        access.fetchStatus = 'OK';
        await access.save();
        log.info('Post process: done.');

        // reset object
        this.newAccounts = [];
        this.newOperations = [];
    }
}
