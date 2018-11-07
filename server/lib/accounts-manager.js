import moment from 'moment';

import Accesses from '../models/accesses';
import Accounts from '../models/accounts';
import Bank from '../models/bank';
import Config from '../models/config';
import Operation from '../models/operation';
import OperationType from '../models/operationtype';
import * as AccountType from '../models/accounttype';

import {
    KError,
    getErrorCode,
    makeLogger,
    translate as $t,
    currency,
    assert,
    displayLabel,
    UNKNOWN_OPERATION_TYPE
} from '../helpers';

import AsyncQueue from './async-queue';
import alertManager from './alert-manager';
import Notifications from './notifications';
import diffAccounts from './diff-accounts';
import diffOperations from './diff-operations';

let log = makeLogger('accounts-manager');

const SOURCE_HANDLERS = {};
function addBackend(exportObject) {
    if (
        typeof exportObject.SOURCE_NAME === 'undefined' ||
        typeof exportObject.fetchAccounts === 'undefined' ||
        typeof exportObject.fetchOperations === 'undefined'
    ) {
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
    if (!bank.backend || !(bank.backend in SOURCE_HANDLERS)) {
        throw new KError('Bank handler not described or not imported.');
    }
    BANK_HANDLERS[bank.uuid] = SOURCE_HANDLERS[bank.backend];
}

function handler(access) {
    return BANK_HANDLERS[access.bank];
}

const MAX_DIFFERENCE_BETWEEN_DUP_DATES_IN_DAYS = 2;

// Effectively does a merge of two accounts that have been identified to be duplicates.
// - known is the former Account instance (known in Kresus's database).
// - provided is the new Account instance provided by the source backend.
async function mergeAccounts(known, provided) {
    let newProps = {
        accountNumber: provided.accountNumber,
        title: provided.title,
        iban: provided.iban,
        currency: provided.currency,
        type: provided.type
    };

    await known.updateAttributes(newProps);
}

// Returns a list of all the accounts returned by the backend, associated to
// the given bankAccess.
async function retrieveAllAccountsByAccess(userId, access, forceUpdate = false) {
    if (!access.hasPassword()) {
        log.warn("Skipping accounts fetching -- password isn't present");
        let errcode = getErrorCode('NO_PASSWORD');
        throw new KError("Access' password is not set", 500, errcode);
    }

    log.info(`Retrieve all accounts from access ${access.bank} with login ${access.login}`);

    let isDebugEnabled = await Config.findOrCreateDefaultBooleanValue(
        userId,
        'weboob-enable-debug'
    );
    let sourceAccounts = await handler(access).fetchAccounts({
        access,
        debug: isDebugEnabled,
        update: forceUpdate
    });

    let accounts = [];
    for (let accountWeboob of sourceAccounts) {
        let account = {
            accountNumber: accountWeboob.accountNumber,
            bank: access.bank,
            bankAccess: access.id,
            iban: accountWeboob.iban,
            title: accountWeboob.title,
            initialAmount: Number.parseFloat(accountWeboob.balance) || 0,
            lastChecked: new Date(),
            importDate: new Date()
        };

        let accountType = AccountType.idToName(accountWeboob.type);
        // The default type's value is directly set by the account model.
        if (accountType !== null) {
            account.type = accountType;
        }

        if (currency.isKnown(accountWeboob.currency)) {
            account.currency = accountWeboob.currency;
        }
        accounts.push(account);
    }

    log.info(`-> ${accounts.length} bank account(s) found`);

    return accounts;
}

// Sends notification for a given access, considering a list of newOperations
// and an accountMap (mapping accountId -> account).
async function notifyNewOperations(access, newOperations, accountMap) {
    let newOpsPerAccount = new Map();

    for (let newOp of newOperations) {
        let opAccountId = newOp.accountId;
        if (!newOpsPerAccount.has(opAccountId)) {
            newOpsPerAccount.set(opAccountId, [newOp]);
        } else {
            newOpsPerAccount.get(opAccountId).push(newOp);
        }
    }

    let bank = Bank.byUuid(access.bank);
    assert(bank, 'The bank must be known');

    for (let [accountId, ops] of newOpsPerAccount.entries()) {
        let { account } = accountMap.get(accountId);

        /* eslint-disable camelcase */
        let params = {
            account_title: `${bank.name} - ${displayLabel(account)}`,
            smart_count: ops.length
        };

        if (ops.length === 1) {
            // Send a notification with the operation content
            let formatCurrency = currency.makeFormat(account.currency);
            params.operation_details = `${ops[0].title} ${formatCurrency(ops[0].amount)}`;
        }

        Notifications.send($t('server.notification.new_operation', params));
        /* eslint-enable camelcase */
    }
}

class AccountManager {
    constructor() {
        this.newAccountsMap = new Map();
        this.q = new AsyncQueue();

        this.retrieveNewAccountsByAccess = this.q.wrap(this.retrieveNewAccountsByAccess.bind(this));
        this.retrieveOperationsByAccess = this.q.wrap(this.retrieveOperationsByAccess.bind(this));
        this.resyncAccountBalance = this.q.wrap(this.resyncAccountBalance.bind(this));
    }

    async retrieveNewAccountsByAccess(userId, access, shouldAddNewAccounts, forceUpdate = false) {
        if (this.newAccountsMap.size) {
            log.warn('At the top of retrieveNewAccountsByAccess, newAccountsMap must be empty.');
            this.newAccountsMap.clear();
        }

        let accounts = await retrieveAllAccountsByAccess(userId, access, forceUpdate);

        let oldAccounts = await Accounts.byAccess(userId, access);

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

            // Save the account in DB and in the new accounts map.
            let newAccount = await Accounts.create(userId, account);
            newAccountInfo.account = newAccount;

            this.newAccountsMap.set(newAccount.id, newAccountInfo);
        }

        for (let account of diff.knownOrphans) {
            log.info("Orphan account found in Kresus's database: ", account.accountNumber);
            // TODO do something with orphan accounts!
        }

        let shouldMergeAccounts = await Config.findOrCreateDefaultBooleanValue(
            userId,
            'weboob-auto-merge-accounts'
        );

        if (shouldMergeAccounts) {
            for (let [known, provided] of diff.duplicateCandidates) {
                log.info(`Found candidates for accounts merging:
- ${known.accountNumber} / ${known.title}
- ${provided.accountNumber} / ${provided.title}`);
                await mergeAccounts(known, provided);
            }
        } else {
            log.info(`Found ${diff.duplicateCandidates.length} candidates for merging, but not
merging as per request`);
        }
    }

    // Not wrapped in the sequential queue: this would introduce a deadlock
    // since retrieveNewAccountsByAccess is wrapped!
    async retrieveAndAddAccountsByAccess(userId, access) {
        return await this.retrieveNewAccountsByAccess(userId, access, true);
    }

    async retrieveOperationsByAccess(userId, access) {
        if (!access.hasPassword()) {
            log.warn("Skipping operations fetching -- password isn't present");
            let errcode = getErrorCode('NO_PASSWORD');
            throw new KError("Access' password is not set", 500, errcode);
        }

        let operations = [];

        let now = moment().format('YYYY-MM-DDTHH:mm:ss.000Z');

        let allAccounts = await Accounts.byAccess(userId, access);
        let accountMap = new Map();
        let accountIdNumberMap = new Map();
        for (let account of allAccounts) {
            accountIdNumberMap.set(account.accountNumber, account.id);
            if (this.newAccountsMap.has(account.id)) {
                let oldEntry = this.newAccountsMap.get(account.id);
                accountMap.set(account.id, oldEntry);
                continue;
            }

            accountMap.set(account.id, {
                account,
                balanceOffset: 0
            });
        }

        // Eagerly clear state.
        this.newAccountsMap.clear();

        // Fetch source operations
        let isDebugEnabled = await Config.findOrCreateDefaultBooleanValue(
            userId,
            'weboob-enable-debug'
        );
        let sourceOps = await handler(access).fetchOperations({ access, debug: isDebugEnabled });

        log.info('Normalizing source information...');
        for (let sourceOp of sourceOps) {
            if (!accountIdNumberMap.has(sourceOp.account)) {
                log.error('Operation attached to an unknown account, skipping');
                continue;
            }

            let operation = {
                accountId: accountIdNumberMap.get(sourceOp.account),
                amount: Number.parseFloat(sourceOp.amount),
                raw: sourceOp.raw,
                date: new Date(sourceOp.date),
                title: sourceOp.title,
                binary: sourceOp.binary,
                debitDate: new Date(sourceOp.debit_date)
            };

            if (Number.isNaN(operation.amount)) {
                log.error('Operation with invalid amount, skipping');
                continue;
            }

            let hasInvalidDate = !moment(operation.date).isValid();
            let hasInvalidDebitDate = !moment(operation.debitDate).isValid();

            if (hasInvalidDate && hasInvalidDebitDate) {
                log.error('Operation with invalid date and debitDate, skipping');
                continue;
            }

            if (hasInvalidDate) {
                log.warn('Operation with invalid date, using debitDate instead');
                operation.date = operation.debitDate;
            }

            if (hasInvalidDebitDate) {
                log.warn('Operation with invalid debitDate, using date instead');
                operation.debitDate = operation.date;
            }

            operation.title = operation.title || operation.raw || '';
            operation.dateImport = now;

            let operationType = OperationType.idToName(sourceOp.type);

            if (operationType !== null) {
                operation.type = operationType;
            } else {
                log.warn('unknown source operation type:', sourceOp.type);
                operation.type = UNKNOWN_OPERATION_TYPE;
            }

            operations.push(operation);
        }

        log.info('Comparing with database to ignore already known operations…');
        let newOperations = [];
        for (let accountInfo of accountMap.values()) {
            let { account } = accountInfo;
            let provideds = [];
            let remainingOperations = [];
            for (let op of operations) {
                if (op.accountId === account.id) {
                    provideds.push(op);
                } else {
                    remainingOperations.push(op);
                }
            }
            operations = remainingOperations;

            if (provideds.length) {
                let minDate = moment(
                    new Date(
                        provideds.reduce((min, op) => {
                            return Math.min(+op.date, min);
                        }, +provideds[0].date)
                    )
                )
                    .subtract(MAX_DIFFERENCE_BETWEEN_DUP_DATES_IN_DAYS, 'days')
                    .toDate();
                let maxDate = new Date(
                    provideds.reduce((max, op) => {
                        return Math.max(+op.date, max);
                    }, +provideds[0].date)
                );

                let knowns = await Operation.byBankSortedByDateBetweenDates(
                    userId,
                    account,
                    minDate,
                    maxDate
                );
                let { providerOrphans, duplicateCandidates } = diffOperations(knowns, provideds);

                // For now, both orphans and duplicates are added to the database.
                newOperations = newOperations
                    .concat(providerOrphans)
                    .concat(duplicateCandidates.map(dup => dup[1]));

                // Resync balance only if we are sure that the operation is a new one.
                let accountImportDate = new Date(account.importDate);
                accountInfo.balanceOffset = providerOrphans
                    .filter(op => +op.debitDate < +accountImportDate)
                    .reduce((sum, op) => sum + op.amount, 0);
            }
        }

        let toCreate = newOperations;
        let numNewOperations = toCreate.length;
        newOperations = [];

        // Create the new operations.
        if (numNewOperations) {
            log.info(`${toCreate.length} new operations found!`);
            log.info('Creating new operations…');

            for (let operationToCreate of toCreate) {
                delete operationToCreate.debitDate;
                let created = await Operation.create(userId, operationToCreate);
                newOperations.push(created);
            }
        }

        log.info('Updating accounts balances…');
        for (let { account, balanceOffset } of accountMap.values()) {
            if (balanceOffset) {
                log.info(`Account ${account.title} initial balance is going
to be resynced, by an offset of ${balanceOffset}.`);
                account.initialAmount -= balanceOffset;
                await account.save();
            }
        }

        // Carry over all the triggers on new operations.
        log.info("Updating 'last checked' for linked accounts...");
        let accounts = [];
        let lastChecked = new Date();
        for (let account of allAccounts) {
            let updated = await account.updateAttributes({ lastChecked });
            accounts.push(updated);
        }

        if (numNewOperations > 0) {
            log.info(`Informing user ${numNewOperations} new operations have been imported...`);
            await notifyNewOperations(access, newOperations, accountMap);

            log.info('Checking alerts for accounts balance...');
            await alertManager.checkAlertsForAccounts(userId, access);

            log.info('Checking alerts for operations amount...');
            await alertManager.checkAlertsForOperations(userId, access, newOperations);
        }

        access.fetchStatus = 'OK';
        await access.save();
        log.info('Post process: done.');

        return { accounts, newOperations };
    }

    async resyncAccountBalance(userId, account) {
        let access = await Accesses.find(userId, account.bankAccess);

        // Note: we do not fetch operations before, because this can lead to duplicates,
        // and compute a false initial balance.

        let accounts = await retrieveAllAccountsByAccess(userId, access);

        let retrievedAccount = accounts.find(acc => acc.accountNumber === account.accountNumber);

        if (typeof retrievedAccount !== 'undefined') {
            let realBalance = retrievedAccount.initialAmount;

            let operations = await Operation.byAccount(userId, account);
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

export default new AccountManager();
