import moment        from 'moment';

import Access        from '../models/access';
import Account       from '../models/account';
import Alert         from '../models/alert';
import Config        from '../models/config';
import Operation     from '../models/operation';
import OperationType from '../models/operationtype';

import {
    KError,
    getErrorCode,
    makeLogger,
    translate as $t,
    currency
} from '../helpers';

import alertManager  from './alert-manager';
import Notifications from './notifications';
import diffAccounts  from './diff-accounts';

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

// - known is the former Account instance (known in Kresus's database).
// - provided is the new Account instance provided by the source backend.
async function mergeAccounts(known, provided) {

    // The accountNumber is used as a primary key in several models, update them if necessary.
    if (known.accountNumber !== provided.accountNumber) {
        let ops = await Operation.byAccount(known);
        for (let op of ops) {
            await op.updateAttributes({ bankAccount: provided.accountNumber });
        }

        let alerts = await Alert.byAccount(known);
        for (let alert of alerts) {
            await alert.updateAttributes({ bankAccount: provided.accountNumber });
        }
    }

    let newProps = {
        accountNumber: provided.accountNumber,
        title: provided.title,
        iban: provided.iban,
        currency: provided.currency
    };

    await known.updateAttributes(newProps);
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
            log.warn('At the top of retrieveNewAccountsByAccess, newAccountsMap must be empty.');
            this.newAccountsMap.clear();
        }

        let shouldMergeAccounts = await Config.findOrCreateDefaultBooleanValue(
            'weboob-auto-merge-accounts'
        );

        let accounts = await this.retrieveAllAccountsByAccess(access);

        let oldAccounts = await Account.byAccess(access);

        let diff = diffAccounts(oldAccounts, accounts);

        for (let [known] of diff.perfectMatches) {
            log.info(`Account ${known.id} already known and in Kresus's database`);
        }

        for (let account of diff.providerOrphans) {
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

            // Consider all the operations that could have been inserted before the fix in #405.
            let existingOperations = await Operation.byAccount(account);
            if (existingOperations.length) {
                let offset = existingOperations.reduce((acc, op) => acc + +op.amount, 0);
                newAccountInfo.balanceOffset += offset;
            }

            // Save the account in DB and in the new accounts map.
            let newAccount = await Account.create(account);
            newAccountInfo.account = newAccount;

            this.newAccountsMap.set(newAccount.accountNumber, newAccountInfo);
        }

        for (let account of diff.knownOrphans) {
            log.info("Orphan account found in Kresus's database: ", account.id);
            // TODO do something with orphan accounts!
        }

        for (let [known, provided] of diff.duplicateCandidates) {
            if (shouldMergeAccounts) {
                log.info(`Found candidates for accounts merging:
- ${known.accountNumber} / ${known.title}
- ${provided.accountNumber} / ${provided.title}`);
                await mergeAccounts(known, provided);
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

            // Remember amounts of transactions older than the import, to resync balance.
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

    async resyncAccountBalance(account) {
        let access = await Access.find(account.bankAccess);

        // Note: we do not fetch operations before, because this can lead to duplicates,
        // and compute a false initial balance.

        let accounts = await this.retrieveAllAccountsByAccess(access);

        let retrievedAccount = accounts.find(acc => acc.accountNumber === account.accountNumber);

        if (typeof retrievedAccount !== 'undefined') {
            let realBalance = retrievedAccount.initialAmount;

            let operations = await Operation.byAccount(account);
            let operationsSum = operations.reduce((amount, op) => amount + op.amount, 0);
            let kresusBalance = operationsSum + account.initialAmount;

            if (Math.abs(realBalance - kresusBalance) > 0.01) {
                log.info(`Updating balance for account ${account.accountNumber}`);
                account.initialAmount = realBalance - operationsSum;
                await account.save();
            }
        } else {
            // This case can happen if it's a known orphan.
            throw new KError('account not found', 404);
        }
        return account;
    }
}
