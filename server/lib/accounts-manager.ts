import moment from 'moment';

import { Access, Account, Setting, Transaction } from '../models';

import { accountTypeIdToName } from './account-types';
import { transactionTypeIdToName } from './transaction-types';

import { getProvider, ProviderAccount, ProviderTransaction } from '../providers';

import {
    KError,
    getErrorCode,
    makeLogger,
    currency,
    assert,
    unwrap,
    UNKNOWN_OPERATION_TYPE,
    shouldIncludeInBalance,
    FETCH_STATUS_SUCCESS,
} from '../helpers';
import {
    WEBOOB_AUTO_MERGE_ACCOUNTS,
    WEBOOB_ENABLE_DEBUG,
    WEBOOB_FETCH_THRESHOLD,
} from '../shared/settings';
import { SharedTransaction } from '../shared/types';

import AsyncQueue from './async-queue';
import alertManager from './alert-manager';
import diffAccounts from './diff-accounts';
import diffTransactions from './diff-transactions';
import filterDuplicateTransactions from './filter-duplicate-transactions';

const log = makeLogger('accounts-manager');

const MAX_DIFFERENCE_BETWEEN_DUP_DATES_IN_DAYS = 2;

// Effectively does a merge of two accounts that have been identified to be duplicates.
// - known is the former Account instance (known in Kresus's database).
// - provided is the new Account instance provided by the source backend.
async function mergeAccounts(userId: number, known: Account, provided: Partial<Account>) {
    const newProps = {
        vendorAccountId: provided.vendorAccountId,
        label: provided.label,
        iban: provided.iban,
        currency: provided.currency,
        type: provided.type,
    };

    await Account.update(userId, known.id, newProps);
}

// Returns a list of all the accounts returned by the backend, associated to
// the given accessId.
async function retrieveAllAccountsByAccess(
    userId: number,
    access: Access,
    forceUpdate = false,
    isInteractive = false
): Promise<Partial<Account>[]> {
    if (!access.hasPassword()) {
        log.warn("Skipping accounts fetching -- password isn't present");
        const errcode = getErrorCode('NO_PASSWORD');
        throw new KError("Access' password is not set", 500, errcode);
    }

    log.info(`Retrieve all accounts from access ${access.vendorId} with login ${access.login}`);

    const isDebugEnabled = await Setting.findOrCreateDefaultBooleanValue(
        userId,
        WEBOOB_ENABLE_DEBUG
    );

    let sourceAccounts: ProviderAccount[];
    try {
        sourceAccounts = await getProvider(access).fetchAccounts({
            access,
            debug: isDebugEnabled,
            update: forceUpdate,
            isInteractive,
        });
    } catch (err) {
        const { errCode } = err;
        // Only save the status code if the error was raised in the source, using a KError.
        if (errCode) {
            await Access.update(userId, access.id, { fetchStatus: errCode });
        }
        throw err;
    }

    const accounts: Partial<Account>[] = [];
    for (const accountWeboob of sourceAccounts) {
        const account: Partial<Account> = {
            vendorAccountId: accountWeboob.vendorAccountId,
            vendorId: access.vendorId,
            accessId: access.id,
            iban: accountWeboob.iban,
            label: accountWeboob.label,
            initialBalance: Number.parseFloat(accountWeboob.balance) || 0,
            lastCheckDate: new Date(),
            importDate: new Date(),
        };

        const accountType = accountTypeIdToName(accountWeboob.type ?? null);
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

interface AccountInfo {
    account: Account;
    balanceOffset: number;
}

class AccountManager {
    newAccountsMap: Map<number, AccountInfo>;
    q: AsyncQueue;

    constructor() {
        this.newAccountsMap = new Map();
        this.q = new AsyncQueue();

        this.retrieveNewAccountsByAccess = this.q.wrap(this.retrieveNewAccountsByAccess.bind(this));
        this.retrieveOperationsByAccess = this.q.wrap(this.retrieveOperationsByAccess.bind(this));
        this.resyncAccountBalance = this.q.wrap(this.resyncAccountBalance.bind(this));
    }

    async retrieveNewAccountsByAccess(
        userId: number,
        access: Access,
        shouldAddNewAccounts: boolean,
        forceUpdate = false,
        isInteractive = false
    ) {
        if (this.newAccountsMap.size) {
            log.warn('At the top of retrieveNewAccountsByAccess, newAccountsMap must be empty.');
            this.newAccountsMap.clear();
        }

        const accounts = await retrieveAllAccountsByAccess(
            userId,
            access,
            forceUpdate,
            isInteractive
        );

        const oldAccounts = await Account.byAccess(userId, access);

        const diff = diffAccounts(oldAccounts, accounts);

        for (const [known] of diff.perfectMatches) {
            log.info(`Account ${known.id} already known and in Kresus's database`);
        }

        for (const account of diff.providerOrphans) {
            log.info('New account found: ', account.label);

            if (!shouldAddNewAccounts) {
                log.info('=> Not saving it, as per request');
                continue;
            }

            log.info('=> Saving it as per request.');

            // Save the account in DB and in the new accounts map.
            const newAccount = await Account.create(userId, account);
            const newAccountInfo = {
                account: newAccount,
                balanceOffset: 0,
            };

            this.newAccountsMap.set(newAccount.id, newAccountInfo);
        }

        for (const account of diff.knownOrphans) {
            log.info("Orphan account found in Kresus's database: ", account.vendorAccountId);
            // TODO do something with orphan accounts!
        }

        const shouldMergeAccounts = await Setting.findOrCreateDefaultBooleanValue(
            userId,
            WEBOOB_AUTO_MERGE_ACCOUNTS
        );

        if (shouldMergeAccounts) {
            for (const [known, provided] of diff.duplicateCandidates) {
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
    async retrieveAndAddAccountsByAccess(userId: number, access: Access, isInteractive = false) {
        return await this.retrieveNewAccountsByAccess(
            userId,
            access,
            /* should add new accounts */ true,
            /* forceUpdate */ false,
            isInteractive
        );
    }

    async retrieveOperationsByAccess(
        userId: number,
        access: Access,
        ignoreLastFetchDate = false,
        isInteractive = false
    ) {
        if (!access.hasPassword()) {
            log.warn("Skipping transactions fetching -- password isn't present");
            const errcode = getErrorCode('NO_PASSWORD');
            throw new KError("Access' password is not set", 500, errcode);
        }

        let operations: Partial<Transaction>[] = [];

        const now = new Date();

        const allAccounts = await Account.byAccess(userId, access);

        let oldestLastFetchDate: Date | null = null;
        const accountMap: Map<number, AccountInfo> = new Map();
        const vendorToOwnAccountIdMap = new Map();
        for (const account of allAccounts) {
            vendorToOwnAccountIdMap.set(account.vendorAccountId, account.id);
            if (this.newAccountsMap.has(account.id)) {
                const oldEntry = this.newAccountsMap.get(account.id);
                assert(typeof oldEntry !== 'undefined', 'because of has() call above');
                accountMap.set(account.id, oldEntry);
                continue;
            }

            accountMap.set(account.id, {
                account,
                balanceOffset: 0,
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
        const isDebugEnabled = await Setting.findOrCreateDefaultBooleanValue(
            userId,
            WEBOOB_ENABLE_DEBUG
        );

        let fromDate: Date | null = null;
        if (oldestLastFetchDate !== null) {
            const thresholdSetting = await Setting.findOrCreateDefault(
                userId,
                WEBOOB_FETCH_THRESHOLD
            );
            const fetchThresholdInMonths = parseInt(thresholdSetting.value, 10);

            if (fetchThresholdInMonths > 0) {
                fromDate = moment(oldestLastFetchDate)
                    .subtract(fetchThresholdInMonths, 'months')
                    .toDate();
            }
        }

        let sourceOps: ProviderTransaction[];
        try {
            sourceOps = await getProvider(access).fetchOperations({
                access,
                debug: isDebugEnabled,
                fromDate,
                isInteractive,
            });
        } catch (err) {
            const { errCode } = err;
            // Only save the status code if the error was raised in the source, using a KError.
            if (errCode) {
                await Access.update(userId, access.id, { fetchStatus: errCode });
            }
            throw err;
        }

        log.info(`${sourceOps.length} operations retrieved from source.`);

        log.info('Normalizing source information...');
        for (const sourceOp of sourceOps) {
            if (!vendorToOwnAccountIdMap.has(sourceOp.account)) {
                log.error(
                    `Operation attached to an unknown account (vendor id: ${sourceOp.account}), skipping`
                );
                continue;
            }

            if (!sourceOp.rawLabel && !sourceOp.label) {
                log.error('Operation without raw label or label, skipping');
                continue;
            }

            const operation: Partial<Transaction> = {
                accountId: vendorToOwnAccountIdMap.get(sourceOp.account),
                amount: Number.parseFloat(sourceOp.amount),
                rawLabel: sourceOp.rawLabel || sourceOp.label,
                date: new Date(sourceOp.date),
                label: sourceOp.label || sourceOp.rawLabel,
            };

            if (typeof operation.amount === 'undefined' || Number.isNaN(operation.amount)) {
                log.error('Operation with invalid amount, skipping');
                continue;
            }

            const debitDate = sourceOp.debit_date;

            const hasInvalidDate = !moment(operation.date).isValid();
            const hasInvalidDebitDate = !debitDate || !moment(debitDate).isValid();

            if (hasInvalidDate && hasInvalidDebitDate) {
                log.error('Operation with invalid date and debitDate, skipping');
                continue;
            }

            if (hasInvalidDate) {
                log.warn('Operation with invalid date, using debitDate instead');
                assert(
                    typeof debitDate !== 'undefined',
                    'debitDate must be set per above && check'
                );
                operation.date = new Date(debitDate);
            }

            if (hasInvalidDebitDate) {
                assert(operation.date !== null, 'because of above && check');
                log.warn('Operation with invalid debitDate, using date instead');
                operation.debitDate = operation.date;
            } else {
                assert(
                    typeof debitDate !== 'undefined',
                    'debitDate must be set per above && check'
                );
                operation.debitDate = new Date(debitDate);
            }

            operation.importDate = now;

            const operationType = transactionTypeIdToName(sourceOp.type);
            if (operationType !== null) {
                operation.type = operationType;
            } else {
                log.warn('unknown source operation type:', sourceOp.type);
                operation.type = UNKNOWN_OPERATION_TYPE;
            }

            operations.push(operation);
        }

        log.info('Comparing with database to ignore already known operations…');
        let newTransactions: Partial<Transaction>[] = [];
        let transactionsToUpdate: { known: Transaction; update: Partial<Transaction> }[] = [];
        for (const accountInfo of accountMap.values()) {
            const { account } = accountInfo;
            const provideds: Partial<Transaction>[] = [];
            const remainingOperations: Partial<Transaction>[] = [];
            for (const op of operations) {
                if (op.accountId === account.id) {
                    provideds.push(op);
                } else {
                    remainingOperations.push(op);
                }
            }
            operations = remainingOperations;

            if (!provideds.length) {
                continue;
            }

            assert(typeof provideds[0].date !== 'undefined', 'date has been set at this point');
            const minDate = moment(
                new Date(
                    provideds.reduce((min, op) => {
                        assert(typeof op.date !== 'undefined', 'date has been set at this point');
                        return Math.min(+op.date, min);
                    }, +provideds[0].date)
                )
            )
                .subtract(MAX_DIFFERENCE_BETWEEN_DUP_DATES_IN_DAYS, 'days')
                .toDate();
            const maxDate = new Date(
                provideds.reduce((max, op) => {
                    assert(typeof op.date !== 'undefined', 'date has been set at this point');
                    return Math.max(+op.date, max);
                }, +provideds[0].date)
            );

            const knowns = await Transaction.byBankSortedByDateBetweenDates(
                userId,
                account,
                minDate,
                maxDate
            );
            const { providerOrphans, duplicateCandidates } = diffTransactions(knowns, provideds);

            // Try to be smart to reduce the number of new transactions.
            const { toCreate, toUpdate } = filterDuplicateTransactions(duplicateCandidates);
            transactionsToUpdate = transactionsToUpdate.concat(toUpdate);

            newTransactions = newTransactions.concat(providerOrphans, toCreate);

            // Resync balance only if we are sure that the operation is a new one.
            const accountImportDate = new Date(account.importDate);
            accountInfo.balanceOffset = providerOrphans
                .filter((op: Partial<Transaction>) =>
                    shouldIncludeInBalance(op as SharedTransaction, accountImportDate, account.type)
                )
                .reduce((sum: number, op: Partial<Transaction>) => {
                    assert(
                        typeof op.amount !== 'undefined',
                        'operation must have an amount at least'
                    );
                    return sum + op.amount;
                }, 0);
        }

        const toCreate = newTransactions;
        const numNewTransactions = toCreate.length;
        const createdTransactions: Transaction[] = [];

        // Create the new transactions.
        if (numNewTransactions) {
            log.info(`${toCreate.length} new transactions found!`);
            log.info('Creating new transactions…');

            for (const operationToCreate of toCreate) {
                const created = await Transaction.create(userId, operationToCreate);
                createdTransactions.push(created);
            }
            log.info('Done.');
        }

        // Update the transactions.
        if (transactionsToUpdate.length) {
            log.info(`${transactionsToUpdate.length} transactions to update.`);
            log.info('Updating transactions…');
            for (const { known, update } of transactionsToUpdate) {
                await Transaction.update(userId, known.id, update);
            }
            log.info('Done.');
        }

        log.info('Updating accounts balances…');
        for (const { account, balanceOffset } of accountMap.values()) {
            if (balanceOffset) {
                log.info(`Account ${account.label} initial balance is going
to be resynced, by an offset of ${balanceOffset}.`);
                const initialBalance = account.initialBalance - balanceOffset;
                await Account.update(userId, account.id, { initialBalance });
            }
        }

        // Carry over all the triggers on new transactions.
        log.info("Updating 'last checked' for linked accounts...");
        const accounts: Account[] = [];
        const lastCheckDate = new Date();
        for (const account of allAccounts) {
            const updated = await Account.update(userId, account.id, { lastCheckDate });
            accounts.push(updated);
        }

        if (numNewTransactions > 0) {
            log.info('Checking alerts for accounts balance...');
            await alertManager.checkAlertsForAccounts(userId, access);

            log.info('Checking alerts for transactions amount...');
            await alertManager.checkAlertsForOperations(userId, access, createdTransactions);
        }

        await Access.update(userId, access.id, { fetchStatus: FETCH_STATUS_SUCCESS });
        log.info('Post process: done.');

        return { accounts, createdTransactions };
    }

    async resyncAccountBalance(userId: number, account: Account, isInteractive: boolean) {
        const access = unwrap(await Access.find(userId, account.accessId));

        // Note: we do not fetch transactions before, because this can lead to duplicates,
        // and compute a false initial balance.

        const accounts = await retrieveAllAccountsByAccess(
            userId,
            access,
            /* forceUpdate */ false,
            isInteractive
        );

        // Ensure the account number is actually a string.
        const vendorAccountId = account.vendorAccountId.toString();

        const retrievedAccount = accounts.find(acc => acc.vendorAccountId === vendorAccountId);

        if (typeof retrievedAccount !== 'undefined') {
            const realBalance = retrievedAccount.initialBalance ?? 0;

            const kresusBalance = await account.computeBalance();
            const balanceDelta = realBalance - kresusBalance;

            if (Math.abs(balanceDelta) > 0.001) {
                log.info(`Updating balance for account ${account.vendorAccountId}`);
                const initialBalance = account.initialBalance + balanceDelta;
                return await Account.update(userId, account.id, { initialBalance });
            }
        } else {
            // This case can happen if it's a known orphan.
            throw new KError('account not found', 404);
        }
        return account;
    }
}

export default new AccountManager();
