import moment from 'moment';

import Accesses from '../models/accesses';
import Accounts from '../models/accounts';
import Settings from '../models/settings';
import Transactions from '../models/transactions';

import { accountTypeIdToName } from './account-types';
import { transactionTypeIdToName } from './transaction-types';
import { bankVendorByUuid } from './bank-vendors';

import {
    KError,
    getErrorCode,
    makeLogger,
    translate as $t,
    currency,
    assert,
    displayLabel,
    UNKNOWN_OPERATION_TYPE,
    shouldIncludeInBalance,
    FETCH_STATUS_SUCCESS
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
        throw new KError("Backend doesn't implement basic functionality.");
    }

    SOURCE_HANDLERS[exportObject.SOURCE_NAME] = exportObject;
}

// Add backends here.
import * as demoBackend from './sources/demo';
import * as weboobBackend from './sources/weboob';
import * as manualBackend from './sources/manual';

addBackend(demoBackend);
addBackend(weboobBackend);
addBackend(manualBackend);

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
    return BANK_HANDLERS[access.vendorId];
}

const MAX_DIFFERENCE_BETWEEN_DUP_DATES_IN_DAYS = 2;

// Effectively does a merge of two accounts that have been identified to be duplicates.
// - known is the former Account instance (known in Kresus's database).
// - provided is the new Account instance provided by the source backend.
async function mergeAccounts(userId, known, provided) {
    let newProps = {
        vendorAccountId: provided.vendorAccountId,
        label: provided.label,
        iban: provided.iban,
        currency: provided.currency,
        type: provided.type
    };

    await Accounts.update(userId, known.id, newProps);
}

// Returns a list of all the accounts returned by the backend, associated to
// the given accessId.
async function retrieveAllAccountsByAccess(userId, access, forceUpdate = false) {
    if (!access.hasPassword()) {
        log.warn("Skipping accounts fetching -- password isn't present");
        let errcode = getErrorCode('NO_PASSWORD');
        throw new KError("Access' password is not set", 500, errcode);
    }

    log.info(`Retrieve all accounts from access ${access.vendorId} with login ${access.login}`);

    let isDebugEnabled = await Settings.findOrCreateDefaultBooleanValue(
        userId,
        'weboob-enable-debug'
    );

    let sourceAccounts;
    try {
        sourceAccounts = await handler(access).fetchAccounts({
            access,
            debug: isDebugEnabled,
            update: forceUpdate
        });
    } catch (err) {
        let { errCode } = err;
        // Only save the status code if the error was raised in the source, using a KError.
        if (errCode) {
            await Accesses.update(userId, access.id, { fetchStatus: errCode });
        }
        throw err;
    }

    let accounts = [];
    for (let accountWeboob of sourceAccounts) {
        let account = {
            vendorAccountId: accountWeboob.vendorAccountId,
            vendorId: access.vendorId,
            accessId: access.id,
            iban: accountWeboob.iban,
            label: accountWeboob.label,
            initialBalance: Number.parseFloat(accountWeboob.balance) || 0,
            lastCheckDate: new Date(),
            importDate: new Date()
        };

        let accountType = accountTypeIdToName(accountWeboob.type);
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

    let bank = bankVendorByUuid(access.vendorId);
    assert(bank, 'The bank must be known');

    for (let [accountId, ops] of newOpsPerAccount.entries()) {
        let { account } = accountMap.get(accountId);

        /* eslint-disable camelcase */
        let params = {
            account_label: `${access.customLabel || bank.name} - ${displayLabel(account)}`,
            smart_count: ops.length
        };

        if (ops.length === 1) {
            // Send a notification with the operation content
            let formatCurrency = await account.getCurrencyFormatter();
            params.operation_details = `${ops[0].label} ${formatCurrency(ops[0].amount)}`;
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
            log.info('New account found: ', account.label);

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
            log.info("Orphan account found in Kresus's database: ", account.vendorAccountId);
            // TODO do something with orphan accounts!
        }

        let shouldMergeAccounts = await Settings.findOrCreateDefaultBooleanValue(
            userId,
            'weboob-auto-merge-accounts'
        );

        if (shouldMergeAccounts) {
            for (let [known, provided] of diff.duplicateCandidates) {
                log.info(`Found candidates for accounts merging:
- ${known.vendorAccountId} / ${known.label}
- ${provided.vendorAccountId} / ${provided.label}`);
                await mergeAccounts(userId, known, provided);
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

    async retrieveOperationsByAccess(userId, access, ignoreLastFetchDate = false) {
        if (!access.hasPassword()) {
            log.warn("Skipping operations fetching -- password isn't present");
            let errcode = getErrorCode('NO_PASSWORD');
            throw new KError("Access' password is not set", 500, errcode);
        }

        let operations = [];

        let now = moment().format('YYYY-MM-DDTHH:mm:ss.000Z');

        let allAccounts = await Accounts.byAccess(userId, access);

        let oldestLastFetchDate = null;
        let accountMap = new Map();
        let vendorToOwnAccountIdMap = new Map();
        for (let account of allAccounts) {
            vendorToOwnAccountIdMap.set(account.vendorAccountId, account.id);
            if (this.newAccountsMap.has(account.id)) {
                let oldEntry = this.newAccountsMap.get(account.id);
                accountMap.set(account.id, oldEntry);
                continue;
            }

            accountMap.set(account.id, {
                account,
                balanceOffset: 0
            });

            if (
                !ignoreLastFetchDate &&
                (oldestLastFetchDate === null || account.lastCheckDate < oldestLastFetchDate)
            ) {
                oldestLastFetchDate = account.lastCheckDate;
            }
        }

        // Eagerly clear state.
        this.newAccountsMap.clear();

        // Fetch source operations
        let isDebugEnabled = await Settings.findOrCreateDefaultBooleanValue(
            userId,
            'weboob-enable-debug'
        );

        let fromDate = null;
        if (oldestLastFetchDate !== null) {
            const thresholdSetting = await Settings.findOrCreateDefault(
                userId,
                'weboob-fetch-threshold'
            );
            const fetchThresholdInMonths = parseInt(thresholdSetting.value, 10);

            if (fetchThresholdInMonths > 0) {
                fromDate = moment(oldestLastFetchDate)
                    .subtract(fetchThresholdInMonths, 'months')
                    .toDate();
            }
        }

        let sourceOps;
        try {
            sourceOps = await handler(access).fetchOperations({
                access,
                debug: isDebugEnabled,
                fromDate
            });
        } catch (err) {
            let { errCode } = err;
            // Only save the status code if the error was raised in the source, using a KError.
            if (errCode) {
                await Accesses.update(userId, access.id, { fetchStatus: errCode });
            }
            throw err;
        }

        log.info(`${sourceOps.length} operations retrieved from source.`);

        log.info('Normalizing source information...');
        for (let sourceOp of sourceOps) {
            if (!vendorToOwnAccountIdMap.has(sourceOp.account)) {
                log.error('Operation attached to an unknown account, skipping');
                continue;
            }

            if (!sourceOp.rawLabel && !sourceOp.label) {
                log.error('Operation without raw label or label, skipping');
                continue;
            }

            let operation = {
                accountId: vendorToOwnAccountIdMap.get(sourceOp.account),
                amount: Number.parseFloat(sourceOp.amount),
                rawLabel: sourceOp.rawLabel || sourceOp.label,
                date: new Date(sourceOp.date),
                label: sourceOp.label || sourceOp.rawLabel,
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

            operation.importDate = now;

            let operationType = transactionTypeIdToName(sourceOp.type);
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

                let knowns = await Transactions.byBankSortedByDateBetweenDates(
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
                    .filter(op => shouldIncludeInBalance(op, accountImportDate, account.type))
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
                let created = await Transactions.create(userId, operationToCreate);
                newOperations.push(created);
            }
        }

        log.info('Updating accounts balances…');
        for (let { account, balanceOffset } of accountMap.values()) {
            if (balanceOffset) {
                log.info(`Account ${account.label} initial balance is going
to be resynced, by an offset of ${balanceOffset}.`);
                let initialBalance = account.initialBalance - balanceOffset;
                await Accounts.update(userId, account.id, { initialBalance });
            }
        }

        // Carry over all the triggers on new operations.
        log.info("Updating 'last checked' for linked accounts...");
        let accounts = [];
        let lastCheckDate = new Date();
        for (let account of allAccounts) {
            let updated = await Accounts.update(userId, account.id, { lastCheckDate });
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

        await Accesses.update(userId, access.id, { fetchStatus: FETCH_STATUS_SUCCESS });
        log.info('Post process: done.');

        return { accounts, newOperations };
    }

    async resyncAccountBalance(userId, account) {
        let access = await Accesses.find(userId, account.accessId);

        // Note: we do not fetch operations before, because this can lead to duplicates,
        // and compute a false initial balance.

        let accounts = await retrieveAllAccountsByAccess(userId, access);

        // Ensure the account number is actually a string.
        let vendorAccountId = account.vendorAccountId.toString();

        let retrievedAccount = accounts.find(acc => acc.vendorAccountId === vendorAccountId);

        if (typeof retrievedAccount !== 'undefined') {
            let realBalance = retrievedAccount.initialBalance;

            let kresusBalance = await account.computeBalance();
            let balanceDelta = realBalance - kresusBalance;

            if (Math.abs(balanceDelta) > 0.001) {
                log.info(`Updating balance for account ${account.vendorAccountId}`);
                let initialBalance = account.initialBalance + balanceDelta;
                return await Accounts.update(userId, account.id, { initialBalance });
            }
        } else {
            // This case can happen if it's a known orphan.
            throw new KError('account not found', 404);
        }
        return account;
    }
}

export default new AccountManager();
