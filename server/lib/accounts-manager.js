import moment        from 'moment';

import Operation     from '../models/operation';
import Alert         from '../models/alert';
import Account       from '../models/account';
import Access        from '../models/access';
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

function sumOpAmounts(acc, op) {
    return acc + +op.amount;
}

export default class AccountManager {

    constructor() {
        this.newAccountsMap = new Map();
    }

    async retrieveAndAddAccountsByAccess(access) {
        return await this.retrieveNewAccountsByAccess(access, true);
    }

    async retrieveAllAccountsByAccess(access) {

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
                lastChecked: new Date(),
                importDate: new Date()
            };
            if (currency.isKnown(accountWeboob.currency)) {
                account.currency = accountWeboob.currency;
            }
            accounts.push(account);
        }

        log.info(`-> ${accounts.length} bank account(s) found`);

        return accounts;
    }

    async retrieveNewAccountsByAccess(access, shouldAddNewAccounts) {
        if (this.newAccountsMap.size) {
            log.warn(`At the start of retrieveNewAccountsByAccess, newAccountsMap
should be empty.`);
            this.newAccountsMap.clear();
        }

        let accounts = await this.retrieveAllAccountsByAccess(access);

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
                log.info('New account found, saving it as per request.');

                let newAccountInfo = {
                    account: null,
                    balanceOffset: 0
                };

                // Consider all the operations that could have been inserted
                // before the fix in #405.
                let existingOperations = await Operation.byAccount(account);

                if (existingOperations.length) {
                    let offset = existingOperations.reduce(sumOpAmounts, 0);
                    newAccountInfo.balanceOffset += offset;
                }

                // Save the account in DB and in the new accounts map.
                let newAccount = await Account.create(account);
                newAccountInfo.account = newAccount;

                this.newAccountsMap.set(newAccount.accountNumber, newAccountInfo);
                continue;
            }

            log.info('Unknown account found, not saving as per request.');
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

        let allAccounts = await Account.byAccess(access);
        let accountMap = new Map;
        for (let account of allAccounts) {

            if (this.newAccountsMap.has(account.accountNumber)) {
                let oldEntry = this.newAccountsMap.get(account.accountNumber);
                accountMap.set(account.accountNumber, oldEntry);
                continue;
            }

            accountMap.set(account.accountNumber, {
                account,
                balanceOffset: 0
            });
        }

        // Eagerly clear state.
        this.newAccountsMap.clear();

        // Normalize source information
        for (let sourceOp of sourceOps) {

            let operation = {
                bankAccount: sourceOp.account,
                amount: sourceOp.amount,
                raw: sourceOp.raw,
                date: sourceOp.date,
                title: sourceOp.title,
                binary: sourceOp.binary
            };

            operation.title = operation.title || operation.raw || '';
            operation.date = operation.date || now;
            operation.dateImport = now;

            let operationType = OperationType.getNameFromWeboobId(sourceOp.type);

            // The default value of the type is set directly by the operation model
            if (operationType !== null)
                operation.type = operationType;

            operations.push(operation);
        }

        let newOperations = [];
        for (let operation of operations) {
            // Ignore operations coming from unknown accounts.
            if (!accountMap.has(operation.bankAccount))
                continue;

            // Ignore operations already known in database.
            let similarOperations = await Operation.allLike(operation);
            if (similarOperations && similarOperations.length)
                continue;

            // It is definitely a new operation.
            newOperations.push(operation);

            // Remember amounts of transactions older than the import, to
            // resync balance.
            let accountInfo = accountMap.get(operation.bankAccount);
            let opDate = new Date(operation.date);
            if (+opDate <= +accountInfo.account.importDate) {
                accountInfo.balanceOffset += +operation.amount;
            }
        }

        // Create the new operations
        let numNewOperations = newOperations.length;
        if (numNewOperations) {
            log.info(`${newOperations.length} new operations found!`);
        }

        for (let operationToCreate of newOperations) {
            await Operation.create(operationToCreate);
        }

        // Update account balances.
        for (let { account, balanceOffset } of accountMap.values()) {
            if (balanceOffset) {
                log.info(`Account ${account.title} initial balance is going to be resynced, by an
offset of ${balanceOffset}.`);
                account.initialAmount -= balanceOffset;
                await account.save();
            }
        }

        // Carry over all the triggers on new operations.
        log.info("Updating 'last checked' for linked accounts...");
        for (let account of allAccounts) {
            await account.updateAttributes({ lastChecked: new Date() });
        }

        log.info('Informing user new operations have been imported...');
        if (numNewOperations > 0) {

            /* eslint-disable camelcase */
            let count = { smart_count: numNewOperations };
            Notifications.send($t('server.notification.new_operation', count));

            /* eslint-enable camelcase */
        }

        log.info('Checking alerts for accounts balance...');
        if (numNewOperations)
            await alertManager.checkAlertsForAccounts(access);

        log.info('Checking alerts for operations amount...');
        await alertManager.checkAlertsForOperations(access, newOperations);

        access.fetchStatus = 'OK';
        await access.save();
        log.info('Post process: done.');
    }

    async resyncBalanceOfAccount(account) {
        let access = await Access.find(account.bankAccess);

        // Note: we do not fetch operations before, because this can lead to duplicates,
        // and compute a false initial balance

        let accounts = await this.retrieveAllAccountsByAccess(access);

        let retrievedAccount = accounts.find(acc => acc.accountNumber === account.accountNumber);

        if (typeof retrievedAccount !== 'undefined') {

            let realBalance = retrievedAccount.initialAmount;

            let operations = await Operation.byAccount(account);

            let operationsSum = operations.reduce((amount, op) => amount + op.amount, 0);

            let kresusBalance = operationsSum + account.initialValue;
            if (Math.abs(realBalance - kresusBalance) > 0.01) {
                log.info(`Updating balance for account ${account.accountNumber}`);
                account.initialAmount = realBalance - operationsSum;
                await account.save();
            }
        } else {
            // This case can happen if the account was closed.
            throw new KError('account not found', 404);
        }
        return account;
    }
}
