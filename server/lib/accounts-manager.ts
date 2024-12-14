import moment from 'moment';

import {
    Access,
    Account,
    Setting,
    Transaction,
    TransactionRule,
    RecurringTransaction,
    AppliedRecurringTransaction,
    Alert,
} from '../models';

import { accountTypeIdToName } from './account-types';
import { transactionTypeIdToName } from './transaction-types';
import applyRules from './rule-engine';
import errors from '../shared/errors.json';

import { getProvider, ProviderAccount, ProviderTransaction } from '../providers';
import { SOURCE_NAME as MANUAL_BANK_NAME } from '../providers/manual';

import {
    KError,
    getErrorCode,
    makeLogger,
    currency,
    assert,
    unwrap,
    UNKNOWN_TRANSACTION_TYPE,
    shouldIncludeInBalance,
    FETCH_STATUS_SUCCESS,
} from '../helpers';
import {
    PROVIDER_AUTO_RETRY,
    WOOB_AUTO_MERGE_ACCOUNTS,
    WOOB_ENABLE_DEBUG,
    WOOB_FETCH_THRESHOLD,
} from '../shared/settings';
import { SharedTransaction, UserActionResponse } from '../shared/types';

import AsyncQueue from './async-queue';
import alertManager from './alert-manager';
import diffAccounts from './diff-accounts';
import diffTransactions from './diff-transactions';
import filterDuplicateTransactions from './filter-duplicate-transactions';
import SessionManager from './session-manager';

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
        balance: provided.balance ?? known.balance,
        isOrphan: false, // merging accounts means we don't have an orphan
        gracePeriod: Math.max(provided.gracePeriod ?? 0, known.gracePeriod), // use maximum grace period by default
    };
    await Account.update(userId, known.id, newProps);
}

interface Value<T> {
    kind: 'value';
    value: T;
}

export type UserActionOrValue<T> = UserActionResponse | Value<T>;

// Given a partial account returned from a provider, normalizes its fields so
// as to make it useful for Kresus.
function normalizeAccount(access: Access, source: ProviderAccount): Partial<Account> {
    const balance = source.hasOwnProperty('balance')
        ? Number.parseFloat(source.balance || '0') || 0
        : null;
    const account: Partial<Account> = {
        vendorAccountId: source.vendorAccountId,
        accessId: access.id,
        iban: source.iban ?? null,
        label: source.label,
        initialBalance: balance || 0,
        balance,
        lastCheckDate: new Date(),
        importDate: new Date(),
    };

    const accountType = accountTypeIdToName(source.type ?? null);
    // The default type's value is directly set by the account model.
    if (accountType !== null) {
        account.type = accountType;
    }

    if (currency.isKnown(source.currency)) {
        account.currency = source.currency;
    }

    return account;
}

// Global context for the whole Kresus app.
class KresusContext {
    // User sessions for every provider (mostly for 2fa management).
    ALL_SESSIONS: Map<number, SessionManager> = new Map();

    getUserSession(userId: number): SessionManager {
        let manager = this.ALL_SESSIONS.get(userId);
        if (!manager) {
            manager = new SessionManager();
            this.ALL_SESSIONS.set(userId, manager);
        }
        return manager;
    }
}

// TODO: put in its own file?
export const GLOBAL_CONTEXT = new KresusContext();

interface PollAccountsConfig {
    // Should the provider code/modules be updated before polling?
    updateProvider: boolean;
    // Is this an interactive update (i.e. requested by a user if true,
    // automatic polling if false)?
    isInteractive: boolean;
    // Fields completed by the user after an action was required of them.
    userActionFields: Record<string, string> | null;
}

interface SyncAccountsConfig extends PollAccountsConfig {
    // Should new accounts unknown to Kresus be added, or ignored?
    addNewAccounts: boolean;
}

// How many total attempts do we perform when fetching bank data? (accounts or transactions)
const MAX_PROVIDER_RETRIES = 3;

// Automatically retry a call to the provider if the error we've observed is a network error (as it
// could be spurious), or a generic exception based on flagging scrapping.
async function retryCallProvider<T>(paramNumRetries: number, func: () => Promise<T>): Promise<T> {
    let numRetries = paramNumRetries;

    // eslint-disable-next-line no-constant-condition
    while (true) {
        numRetries--;

        try {
            return await func();
        } catch (err) {
            const { errCode } = err;

            if (errCode) {
                switch (errCode) {
                    case errors.CONNECTION_ERROR:
                    case errors.GENERIC_EXCEPTION: {
                        // Retry!
                        if (numRetries > 0) {
                            continue;
                        }
                        break;
                    }
                    default: {
                        break;
                    }
                }
            }

            // Throw back the error only when this is the last attempt, or if it's not an error
            // that deserves a retry.
            throw err;
        }
    }
}

// Returns a list of all the accounts returned by the backend, associated to
// the given access.
async function pollAccounts(
    ctx: KresusContext,
    userId: number,
    access: Access,
    config: PollAccountsConfig
): Promise<UserActionOrValue<Partial<Account>[]>> {
    if (!access.hasPassword()) {
        log.warn("Skipping accounts fetching -- password isn't present");
        const errcode = getErrorCode('NO_PASSWORD');
        throw new KError("Access' password is not set", 500, errcode);
    }

    log.info(`Retrieve all accounts from access ${access.vendorId} with login ${access.login}`);

    const debug = await Setting.findOrCreateDefaultBooleanValue(userId, WOOB_ENABLE_DEBUG);

    const autoRetryFetch = await Setting.findOrCreateDefaultBooleanValue(
        userId,
        PROVIDER_AUTO_RETRY
    );
    const numRetries = autoRetryFetch ? MAX_PROVIDER_RETRIES : 1;

    const userSession = ctx.getUserSession(userId);

    let sourceAccounts: ProviderAccount[];

    try {
        const providerResponse = await retryCallProvider(numRetries, async () => {
            return await getProvider(access).fetchAccounts(
                {
                    access,
                    debug,
                    update: config.updateProvider,
                    isInteractive: config.isInteractive,
                    userActionFields: config.userActionFields,
                },
                userSession
            );
        });

        if (providerResponse.kind === 'user_action') {
            // User action response.
            return providerResponse;
        }

        // Real values.
        sourceAccounts = providerResponse.values;
    } catch (err) {
        const { errCode } = err;
        // Only save the status code if the error was raised in the source, using a KError.
        if (errCode) {
            await Access.update(userId, access.id, { fetchStatus: errCode });
        }
        throw err;
    }

    const accounts: Partial<Account>[] = sourceAccounts.map(account =>
        normalizeAccount(access, account)
    );
    log.info(`-> ${accounts.length} bank account(s) found`);

    return { kind: 'value', value: accounts };
}

interface AccountInfo {
    account: Account;
    balanceOffset: number;
}

type AccountInfoMap = Map<number, AccountInfo>;

interface AccountsAndTransactions {
    accounts: Account[];
    createdTransactions: Transaction[];
}

async function preparePollTransactions(
    userId: number,
    accounts: Account[],
    ignoreLastFetchDate: boolean,
    accountInfoMap: Map<number, AccountInfo>
) {
    let oldestLastFetchDate: Date | null = null;
    const vendorToOwnAccountIdMap: Map<string, number> = new Map();
    for (const account of accounts) {
        vendorToOwnAccountIdMap.set(account.vendorAccountId, account.id);

        if (accountInfoMap.has(account.id)) {
            continue;
        }
        accountInfoMap.set(account.id, {
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

    let fromDate: Date | null = null;
    if (oldestLastFetchDate !== null) {
        const thresholdSetting = await Setting.findOrCreateDefault(userId, WOOB_FETCH_THRESHOLD);
        const fetchThresholdInMonths = parseInt(thresholdSetting.value, 10);

        if (fetchThresholdInMonths > 0) {
            fromDate = moment(oldestLastFetchDate)
                .subtract(fetchThresholdInMonths, 'months')
                .toDate();
        }
    }

    return {
        fromDate,
        accountInfoMap,
        vendorToOwnAccountIdMap,
    };
}

interface PollTransactionsConfig {
    // Is this an interactive update (i.e. requested by a user if true,
    // automatic polling if false)?
    isInteractive: boolean;
    // Fields completed by the user after an action was required of them.
    userActionFields: Record<string, string> | null;
    // Transactions older than this date will be filtered out.
    fromDate: Date | null;
}

function normalizeTransaction(
    startOfPoll: Date,
    vendorToOwnAccountIdMap: Map<string, number>,
    providerTr: ProviderTransaction
): Partial<Transaction> | null {
    if (!vendorToOwnAccountIdMap.has(providerTr.account)) {
        log.error(
            `Transaction attached to an unknown account (vendor id: ${providerTr.account}), skipping`
        );
        return null;
    }

    if (!providerTr.rawLabel && !providerTr.label) {
        log.error('Transaction without raw label or label, skipping');
        return null;
    }

    const tr: Partial<Transaction> = {
        accountId: vendorToOwnAccountIdMap.get(providerTr.account),
        amount: Number.parseFloat(providerTr.amount),
        rawLabel: providerTr.rawLabel || providerTr.label,
        date: new Date(providerTr.date),
        label: providerTr.label || providerTr.rawLabel,
    };

    if (typeof tr.amount === 'undefined' || Number.isNaN(tr.amount)) {
        log.error('Transaction with invalid amount, skipping');
        return null;
    }

    const debitDate = providerTr.debit_date;

    const hasInvalidDate = !moment(tr.date).isValid();
    const hasInvalidDebitDate = !debitDate || !moment(debitDate).isValid();

    if (hasInvalidDate && hasInvalidDebitDate) {
        log.error('Transaction with invalid date and debitDate, skipping');
        return null;
    }

    if (hasInvalidDate) {
        log.warn('Transaction with invalid date, using debitDate instead');
        assert(typeof debitDate !== 'undefined', 'debitDate must be set per above && check');
        tr.date = debitDate;
    }

    if (hasInvalidDebitDate) {
        assert(tr.date !== null, 'because of above && check');
        if (debitDate) {
            log.warn('Transaction with invalid debitDate, using date instead');
        }
        tr.debitDate = tr.date;
    } else {
        assert(typeof debitDate !== 'undefined', 'debitDate must be set per above && check');
        tr.debitDate = debitDate;
    }

    tr.importDate = startOfPoll;

    const transactionType = transactionTypeIdToName(providerTr.type);
    if (transactionType !== null) {
        tr.type = transactionType;
    } else {
        log.warn(
            'unknown source Transaction type:',
            providerTr.type,
            `(${typeof providerTr.type})`
        );
        tr.type = UNKNOWN_TRANSACTION_TYPE;
    }

    return tr;
}

async function pollTransactions(
    userId: number,
    startOfPoll: Date,
    vendorToOwnAccountIdMap: Map<string, number>,
    access: Access,
    config: PollTransactionsConfig
): Promise<UserActionOrValue<Partial<Transaction>[]>> {
    const debug = await Setting.findOrCreateDefaultBooleanValue(userId, WOOB_ENABLE_DEBUG);

    const autoRetryFetch = await Setting.findOrCreateDefaultBooleanValue(
        userId,
        PROVIDER_AUTO_RETRY
    );
    const numRetries = autoRetryFetch ? MAX_PROVIDER_RETRIES : 1;

    const sessionManager = GLOBAL_CONTEXT.getUserSession(userId);

    let providerTransactions: ProviderTransaction[];

    try {
        const providerResponse = await retryCallProvider(numRetries, async () => {
            return await getProvider(access).fetchTransactions(
                {
                    access,
                    debug,
                    fromDate: config.fromDate,
                    isInteractive: config.isInteractive,
                    userActionFields: config.userActionFields,
                },
                sessionManager
            );
        });

        if (providerResponse.kind === 'user_action') {
            return providerResponse;
        }

        // Real values.
        providerTransactions = providerResponse.values;
    } catch (err) {
        const { errCode } = err;
        // Only save the status code if the error was raised in the source, using a KError.
        if (errCode) {
            await Access.update(userId, access.id, { fetchStatus: errCode });
        }
        throw err;
    }

    log.info('Normalizing source information...');
    const transactions: Partial<Transaction>[] = providerTransactions
        .map(tr => normalizeTransaction(startOfPoll, vendorToOwnAccountIdMap, tr))
        .filter(tr => tr !== null) as any;

    log.info(`${transactions.length} transactions retrieved from source.`);
    return {
        kind: 'value',
        value: transactions,
    };
}

class AccountManager {
    q: AsyncQueue = new AsyncQueue();

    constructor() {
        this.syncAccounts = this.q.wrap(this.syncAccounts.bind(this));
        this.syncTransactions = this.q.wrap(this.syncTransactions.bind(this));
        this.resyncAccountBalance = this.q.wrap(this.resyncAccountBalance.bind(this));
    }

    async getActualAccountBalances(
        userId: number,
        access: Access,
        oldAccounts: Account[],
        userActionFields: Record<string, string> | null
    ): Promise<
        {
            accountId: number;
            balance: number;
        }[]
    > {
        const result = await pollAccounts(GLOBAL_CONTEXT, userId, access, {
            updateProvider: false,
            isInteractive: false,
            userActionFields,
        });
        if (result.kind === 'user_action') {
            return [];
        }

        const polledAccounts = result.value;
        const diff = diffAccounts(oldAccounts, polledAccounts, access.vendorId);

        const results = [];
        for (const [existing, polled] of diff.perfectMatches) {
            if (polled.balance ?? false) {
                const balance = polled.balance ?? 0; // typescript doesn't understand the ?? operator
                results.push({ accountId: existing.id, balance });
            }
        }

        // Don't do anything with accounts that aren't perfect matches.

        return results;
    }

    // Polls accounts from the providers and syncs them with those already
    // known in the database.
    async syncAccounts(
        userId: number,
        access: Access,
        config: SyncAccountsConfig
    ): Promise<UserActionOrValue<AccountInfoMap>> {
        const result = await pollAccounts(GLOBAL_CONTEXT, userId, access, config);

        if (result.kind === 'user_action') {
            return result;
        }

        const accounts = result.value;
        const oldAccounts = await Account.byAccess(userId, access);

        const diff = diffAccounts(oldAccounts, accounts, access.vendorId);

        for (const [known, polled] of diff.perfectMatches) {
            log.info(`Account ${known.id} already known and in Kresus's database`);

            let accountUpdate: { balance?: number; isOrphan?: boolean } | null = null;

            if (polled.balance ?? false) {
                accountUpdate = accountUpdate || {};
                accountUpdate.balance = polled.balance || 0; // doh, typescript ain't smart
            }

            if (known.isOrphan) {
                accountUpdate = accountUpdate || {};
                accountUpdate.isOrphan = false;
            }

            if (accountUpdate !== null) {
                await Account.update(userId, known.id, accountUpdate);
            }
        }

        const accountInfoMap: Map<number, AccountInfo> = new Map();
        for (const account of diff.providerOrphans) {
            log.info('New account found: ', account.label);

            if (!config.addNewAccounts) {
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

            accountInfoMap.set(newAccount.id, newAccountInfo);
        }

        for (const account of diff.knownOrphans) {
            log.info("Orphan account found in Kresus's database: ", account.vendorAccountId);

            // Mark the account as an orphan in the database.
            if (!account.isOrphan) {
                await Account.update(userId, account.id, { isOrphan: true });
            }
        }

        const shouldMergeAccounts = await Setting.findOrCreateDefaultBooleanValue(
            userId,
            WOOB_AUTO_MERGE_ACCOUNTS
        );

        if (shouldMergeAccounts) {
            for (const [known, provided] of diff.duplicateCandidates) {
                log.info(`Found candidates for accounts merging:
- ${known.vendorAccountId} / ${known.label}
- ${provided.vendorAccountId} / ${provided.label}`);
                await mergeAccounts(userId, known, provided);
            }
        } else {
            log.info(`Found ${diff.duplicateCandidates.length} account pairs for merging, but not
merging as per request`);
        }

        return { kind: 'value', value: accountInfoMap };
    }

    async syncTransactions(
        userId: number,
        access: Access,
        pAccountInfoMap: AccountInfoMap | null,
        ignoreLastFetchDate: boolean,
        isInteractive: boolean,
        userActionFields: Record<string, string> | null
    ): Promise<UserActionOrValue<AccountsAndTransactions>> {
        if (!access.hasPassword()) {
            log.warn("Skipping transactions fetching -- password isn't present");
            const errcode = getErrorCode('NO_PASSWORD');
            throw new KError("Access' password is not set", 500, errcode);
        }

        const startOfPoll = new Date();

        const allAccounts = await Account.byAccess(userId, access);

        const accountInfoMap: AccountInfoMap = pAccountInfoMap ?? new Map();
        const { fromDate, vendorToOwnAccountIdMap } = await preparePollTransactions(
            userId,
            allAccounts,
            ignoreLastFetchDate,
            accountInfoMap
        );

        const result = await pollTransactions(
            userId,
            startOfPoll,
            vendorToOwnAccountIdMap,
            access,
            { fromDate, isInteractive, userActionFields }
        );
        if (result.kind === 'user_action') {
            return result;
        }
        let transactions = result.value;

        const currentMoment = Date.now();

        const filteredTransactions = [];
        for (const transaction of transactions) {
            if (!transaction.accountId) {
                continue;
            }
            const account = await Account.find(userId, transaction.accountId);
            if (!account) {
                continue;
            }
            if (
                (transaction.date?.getTime() ?? 0) <
                currentMoment - (account.gracePeriod ?? 0) * 24 * 60 * 60 * 1000
            ) {
                filteredTransactions.push(transaction);
            }
        }

        log.info(
            `Remaining transactions after comparison to grace period : ${filteredTransactions.length}`
        );

        log.info('Comparing with database to ignore already known transactions…');
        let toCreate: Partial<Transaction>[] = [];
        let toUpdate: { known: Transaction; update: Partial<Transaction> }[] = [];

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentMonthDay = now.getDate();

        for (const accountInfo of accountInfoMap.values()) {
            const { account } = accountInfo;

            log.info(`Checking missing recurring transactions for account ${account.id}…`);
            const missingRecurringTransactions =
                await RecurringTransaction.getCurrentMonthMissingRecurringTransactions(
                    userId,
                    account.id,
                    currentMonth,
                    now.getFullYear()
                );

            let numberOfRecurringTransactionsToCreate = 0;
            for (const missing of missingRecurringTransactions) {
                // Make sure this is a month for which the recurring transaction is enabled.
                if (missing.listOfMonths !== 'all') {
                    // Months are stored from 1 to 12 while Date.getMonth is 0-indexed.
                    if (!missing.listOfMonths.split(';').includes(`${currentMonth + 1}`)) {
                        continue;
                    }
                }

                // Do not create it if we are already past the day of month.
                if (missing.dayOfMonth < currentMonthDay) {
                    continue;
                }

                // Create the transaction.
                const transactionDate = new Date();
                transactionDate.setDate(missing.dayOfMonth);
                toCreate.push({
                    rawLabel: missing.label,
                    label: missing.label,
                    accountId: account.id,
                    amount: missing.amount,
                    type: missing.type,
                    date: transactionDate,
                    isRecurrentTransaction: true,
                    importDate: now,
                });

                // Store the fact it was created, to not create it later.
                await AppliedRecurringTransaction.create(userId, {
                    recurringTransactionId: missing.id,
                    accountId: account.id,
                    month: currentMonth,
                    year: now.getFullYear(),
                });

                ++numberOfRecurringTransactionsToCreate;
            }

            log.info(
                `${numberOfRecurringTransactionsToCreate} recurring transaction(s) created for account ${account.id}…`
            );

            // Split the provider transactions into two parts: those related to
            // this account go in `providerTransactions`, the rest goes to
            // `otherTransactions`.
            const providerTransactions: Partial<Transaction>[] = [];
            const otherTransactions: Partial<Transaction>[] = [];
            for (const op of filteredTransactions) {
                if (op.accountId === account.id) {
                    providerTransactions.push(op);
                } else {
                    otherTransactions.push(op);
                }
            }
            transactions = otherTransactions;

            if (!providerTransactions.length) {
                continue;
            }

            // Find the time bounds of transactions given by the provider.
            assert(
                typeof providerTransactions[0].date !== 'undefined',
                'date has been set at this point'
            );
            const minDate = moment(
                new Date(
                    providerTransactions.reduce((min, op) => {
                        assert(typeof op.date !== 'undefined', 'date has been set at this point');
                        return Math.min(+op.date, min);
                    }, +providerTransactions[0].date)
                )
            )
                .subtract(MAX_DIFFERENCE_BETWEEN_DUP_DATES_IN_DAYS, 'days')
                .toDate();
            const maxDate = new Date(
                providerTransactions.reduce((max, op) => {
                    assert(typeof op.date !== 'undefined', 'date has been set at this point');
                    return Math.max(+op.date, max);
                }, +providerTransactions[0].date)
            );

            const knowns = await Transaction.byBankSortedByDateBetweenDates(
                userId,
                account,
                minDate,
                maxDate
            );
            const { providerOrphans, duplicateCandidates } = diffTransactions(
                knowns,
                providerTransactions
            );

            // Try to be smart to reduce the number of new transactions.
            const { toCreate: newToCreate, toUpdate: newToUpdate } =
                filterDuplicateTransactions(duplicateCandidates);

            toUpdate = toUpdate.concat(newToUpdate);
            toCreate = toCreate.concat(providerOrphans, newToCreate);

            // Resync balance only if we are sure that the transaction is a new one.
            // TODO can probably remove accountInfo/accountInfoMap when we sync
            // the balance correctly.
            const accountImportDate = new Date(account.importDate);
            accountInfo.balanceOffset = providerOrphans
                .filter((op: Partial<Transaction>) =>
                    shouldIncludeInBalance(op as SharedTransaction, accountImportDate, account.type)
                )
                .reduce((sum: number, op: Partial<Transaction>) => {
                    assert(
                        typeof op.amount !== 'undefined',
                        'transaction must have an amount at least'
                    );
                    return sum + op.amount;
                }, 0);
        }

        // Now that we're sure which transactions are going to be created,
        // apply the rule-based system on the new transactions.
        // Updated or deleted transactions shouldn't need to run through the
        // rule-based system.
        const rules = await TransactionRule.allOrdered(userId);
        applyRules(rules, toCreate);

        // Create the new transactions.
        const createdTransactions: Transaction[] = [];
        if (toCreate.length) {
            log.info(`${toCreate.length} new transactions found!`);
            log.info('Creating new transactions…');
            for (const transactionToCreate of toCreate) {
                const created = await Transaction.create(userId, transactionToCreate);
                createdTransactions.push(created);
            }
            log.info('Done.');
        }

        // Update the transactions.
        if (toUpdate.length) {
            log.info(`${toUpdate.length} transactions to update.`);
            log.info('Updating transactions…');
            for (const { known, update } of toUpdate) {
                await Transaction.update(userId, known.id, update);
            }
            log.info('Done.');
        }

        let balanceFixups: null | { accountId: number; balance: number }[] = null;
        if (pAccountInfoMap === null) {
            // When pAccountInfoMap is null, we're only polling
            // transactions; otherwise we've polled the accounts too and
            // could perform a better balance merge.
            log.info('Adjusting account balances...');
            balanceFixups = await this.getActualAccountBalances(
                userId,
                access,
                allAccounts.slice(),
                userActionFields
            );
        }

        const accounts: Account[] = [];
        for (const { account, balanceOffset } of accountInfoMap.values()) {
            const accountUpdate: {
                lastCheckDate: Date;
                initialBalance?: number;
                balance?: number;
            } = {
                lastCheckDate: startOfPoll,
            };

            if (balanceOffset !== 0) {
                log.info(`Account ${account.label} initial balance is going
to be resynced, by an offset of ${balanceOffset}.`);
                accountUpdate.initialBalance = account.initialBalance - balanceOffset;
            }

            if (balanceFixups !== null) {
                const found = balanceFixups.find(entry => entry.accountId === account.id);
                if (found) {
                    accountUpdate.balance = found.balance;
                }
            }

            const updated = await Account.update(userId, account.id, accountUpdate);
            accounts.push(updated);
        }

        log.info('Checking alerts based on accounts balances...');
        await alertManager.checkAlertsForAccounts(userId, access);

        if (createdTransactions.length > 0) {
            log.info('Checking alerts based on transactions amounts...');
            await alertManager.checkAlertsForTransactions(userId, access, createdTransactions);
        }

        await Access.update(userId, access.id, { fetchStatus: FETCH_STATUS_SUCCESS });
        log.info('Post process: done.');

        return { kind: 'value', value: { accounts, createdTransactions } };
    }

    async resyncAccountBalance(
        userId: number,
        account: Account,
        isInteractive: boolean,
        userActionFields: Record<string, string> | null
    ): Promise<UserActionOrValue<Account>> {
        const access = unwrap(await Access.find(userId, account.accessId));

        // Note: we do not fetch transactions before, because this can lead to duplicates,
        // and compute a false initial balance.

        const result = await pollAccounts(GLOBAL_CONTEXT, userId, access, {
            updateProvider: false,
            isInteractive,
            userActionFields,
        });

        if (result.kind === 'user_action') {
            return result;
        }

        // Ensure the account number is actually a string.
        const vendorAccountId = account.vendorAccountId.toString();

        const polledAccount = result.value.find(
            (acc: Partial<Account>) => acc.vendorAccountId === vendorAccountId
        );

        if (typeof polledAccount === 'undefined') {
            // This case can happen if it's a known orphan.
            throw new KError('account not found', 404);
        }

        const accountUpdate: Partial<Account> = {};

        const knownComputedBalance = await account.computeBalance(account.initialBalance);
        const computedBalanceDelta = (polledAccount.initialBalance ?? 0) - knownComputedBalance;
        if (Math.abs(computedBalanceDelta) > 0.001) {
            log.info(`Updating initial balance for account ${account.vendorAccountId}`);
            accountUpdate.initialBalance = account.initialBalance + computedBalanceDelta;
        }

        const currentBalanceDelta = (polledAccount.balance ?? 0) - (account.balance as number);
        if (Math.abs(currentBalanceDelta) > 0.001) {
            log.info(`Updating real balance for ${account.vendorAccountId}`);
            accountUpdate.balance = polledAccount.balance;
        }

        // Only do the update if there's anything to update.
        if (Object.keys(accountUpdate).length > 0) {
            const updatedAccount = await Account.update(userId, account.id, accountUpdate);
            return {
                kind: 'value',
                value: updatedAccount,
            };
        }

        return { kind: 'value', value: account };
    }

    // Merges two existing (in database) accounts. Transactions, recurring transactions from the source
    // account will be transferred to the target account.
    // The balance of the most recent account will be used unless the target account's balance is
    // automatically computed, in which case it will remain so.
    async mergeExistingAccounts(userId: number, sourceAccount: Account, targetAccount: Account) {
        const targetAccess = await Access.find(userId, targetAccount.accessId);
        if (!targetAccess) {
            return false;
        }

        const targetAccountTransactions = await Transaction.byAccount(userId, targetAccount.id, [
            'importDate',
        ]);

        targetAccountTransactions.sort((a, b) => {
            return +a.importDate - +b.importDate;
        });

        const sourceAccountTransactions = await Transaction.byAccount(userId, sourceAccount.id, [
            'importDate',
        ]);

        sourceAccountTransactions.sort((a, b) => {
            return +a.importDate - +b.importDate;
        });

        // If the balance is already set, meaning it is not computed automatically, we need to check
        // each account last transaction's date to select the account accordingly.
        if (
            targetAccess.vendorId !== MANUAL_BANK_NAME &&
            typeof targetAccount.balance === 'number' &&
            typeof sourceAccount.balance === 'number' &&
            sourceAccountTransactions.length
        ) {
            const lastSourceTransaction =
                sourceAccountTransactions[sourceAccountTransactions.length - 1];
            const lastTargetTransaction = targetAccountTransactions.length
                ? targetAccountTransactions[targetAccountTransactions.length - 1]
                : null;

            if (
                lastSourceTransaction &&
                (!lastTargetTransaction ||
                    lastSourceTransaction.importDate > lastTargetTransaction.importDate)
            ) {
                // Set the source balance as the new balance for the target.
                await Account.update(userId, targetAccount.id, {
                    balance: sourceAccount.balance,
                });
            }
        }

        if (
            typeof targetAccount.initialBalance === 'number' &&
            typeof sourceAccount.initialBalance === 'number' &&
            sourceAccountTransactions.length
        ) {
            const firstSourceTransaction = sourceAccountTransactions[0];
            const firstTargetTransaction = targetAccountTransactions[0];

            if (
                firstSourceTransaction &&
                (!firstTargetTransaction ||
                    firstSourceTransaction.importDate < firstTargetTransaction.importDate)
            ) {
                // Set the source balance as the new balance for the target.
                await Account.update(userId, targetAccount.id, {
                    initialBalance: sourceAccount.initialBalance,
                });
            }
        }

        // Move transactions from the source account to the target account
        await Transaction.replaceAccount(userId, sourceAccount.id, targetAccount.id);

        // Move recurring transactions from the source account to the target account
        await RecurringTransaction.replaceAccount(userId, sourceAccount.id, targetAccount.id);
        await AppliedRecurringTransaction.replaceAccount(
            userId,
            sourceAccount.id,
            targetAccount.id
        );

        // Move alerts
        await Alert.replaceAccount(userId, sourceAccount.id, targetAccount.id);

        // Now destroy the old account.
        await Account.destroy(userId, sourceAccount.id);

        return true;
    }
}

export default new AccountManager();
