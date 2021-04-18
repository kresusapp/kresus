"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserSession = void 0;
const moment_1 = __importDefault(require("moment"));
const models_1 = require("../models");
const account_types_1 = require("./account-types");
const transaction_types_1 = require("./transaction-types");
const rule_engine_1 = __importDefault(require("./rule-engine"));
const providers_1 = require("../providers");
const helpers_1 = require("../helpers");
const settings_1 = require("../shared/settings");
const async_queue_1 = __importDefault(require("./async-queue"));
const alert_manager_1 = __importDefault(require("./alert-manager"));
const diff_accounts_1 = __importDefault(require("./diff-accounts"));
const diff_transactions_1 = __importDefault(require("./diff-transactions"));
const filter_duplicate_transactions_1 = __importDefault(require("./filter-duplicate-transactions"));
const session_manager_1 = __importDefault(require("./session-manager"));
const log = helpers_1.makeLogger('accounts-manager');
const MAX_DIFFERENCE_BETWEEN_DUP_DATES_IN_DAYS = 2;
// All the user sessions.
const ALL_SESSIONS = new Map();
function getUserSession(userId) {
    let manager = ALL_SESSIONS.get(userId);
    if (!manager) {
        manager = new session_manager_1.default();
        ALL_SESSIONS.set(userId, manager);
    }
    return manager;
}
exports.getUserSession = getUserSession;
// Effectively does a merge of two accounts that have been identified to be duplicates.
// - known is the former Account instance (known in Kresus's database).
// - provided is the new Account instance provided by the source backend.
async function mergeAccounts(userId, known, provided) {
    const newProps = {
        vendorAccountId: provided.vendorAccountId,
        label: provided.label,
        iban: provided.iban,
        currency: provided.currency,
        type: provided.type,
    };
    await models_1.Account.update(userId, known.id, newProps);
}
// Returns a list of all the accounts returned by the backend, associated to
// the given accessId.
async function retrieveAllAccountsByAccess(userId, access, forceUpdate = false, isInteractive = false, userActionFields = null) {
    var _a;
    if (!access.hasPassword()) {
        log.warn("Skipping accounts fetching -- password isn't present");
        const errcode = helpers_1.getErrorCode('NO_PASSWORD');
        throw new helpers_1.KError("Access' password is not set", 500, errcode);
    }
    log.info(`Retrieve all accounts from access ${access.vendorId} with login ${access.login}`);
    const isDebugEnabled = await models_1.Setting.findOrCreateDefaultBooleanValue(userId, settings_1.WOOB_ENABLE_DEBUG);
    const sessionManager = getUserSession(userId);
    let sourceAccounts;
    try {
        const providerResponse = await providers_1.getProvider(access).fetchAccounts({
            access,
            debug: isDebugEnabled,
            update: forceUpdate,
            isInteractive,
            userActionFields,
        }, sessionManager);
        if (providerResponse.kind === 'user_action') {
            // User action response.
            return providerResponse;
        }
        // Real values.
        sourceAccounts = providerResponse.values;
    }
    catch (err) {
        const { errCode } = err;
        // Only save the status code if the error was raised in the source, using a KError.
        if (errCode) {
            await models_1.Access.update(userId, access.id, { fetchStatus: errCode });
        }
        throw err;
    }
    const accounts = [];
    for (const sourceAccount of sourceAccounts) {
        const account = {
            vendorAccountId: sourceAccount.vendorAccountId,
            vendorId: access.vendorId,
            accessId: access.id,
            iban: sourceAccount.iban,
            label: sourceAccount.label,
            initialBalance: Number.parseFloat(sourceAccount.balance) || 0,
            lastCheckDate: new Date(),
            importDate: new Date(),
        };
        const accountType = account_types_1.accountTypeIdToName((_a = sourceAccount.type) !== null && _a !== void 0 ? _a : null);
        // The default type's value is directly set by the account model.
        if (accountType !== null) {
            account.type = accountType;
        }
        if (helpers_1.currency.isKnown(sourceAccount.currency)) {
            account.currency = sourceAccount.currency;
        }
        accounts.push(account);
    }
    log.info(`-> ${accounts.length} bank account(s) found`);
    return { kind: 'value', value: accounts };
}
class AccountManager {
    constructor() {
        this.newAccountsMap = new Map();
        this.q = new async_queue_1.default();
        this.retrieveNewAccountsByAccess = this.q.wrap(this.retrieveNewAccountsByAccess.bind(this));
        this.retrieveOperationsByAccess = this.q.wrap(this.retrieveOperationsByAccess.bind(this));
        this.resyncAccountBalance = this.q.wrap(this.resyncAccountBalance.bind(this));
    }
    async retrieveNewAccountsByAccess(userId, access, shouldAddNewAccounts, forceUpdate, isInteractive, userActionFields) {
        if (this.newAccountsMap.size) {
            log.warn('At the top of retrieveNewAccountsByAccess, newAccountsMap must be empty.');
            this.newAccountsMap.clear();
        }
        const result = await retrieveAllAccountsByAccess(userId, access, forceUpdate, isInteractive, userActionFields);
        let accounts;
        switch (result.kind) {
            case 'user_action': {
                return result;
            }
            case 'value': {
                accounts = result.value;
                break;
            }
            default: {
                helpers_1.assert(false, 'unreachable');
            }
        }
        const oldAccounts = await models_1.Account.byAccess(userId, access);
        const diff = diff_accounts_1.default(oldAccounts, accounts);
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
            const newAccount = await models_1.Account.create(userId, account);
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
        const shouldMergeAccounts = await models_1.Setting.findOrCreateDefaultBooleanValue(userId, settings_1.WOOB_AUTO_MERGE_ACCOUNTS);
        if (shouldMergeAccounts) {
            for (const [known, provided] of diff.duplicateCandidates) {
                log.info(`Found candidates for accounts merging:
- ${known.vendorAccountId} / ${known.label}
- ${provided.vendorAccountId} / ${provided.label}`);
                await mergeAccounts(userId, known, provided);
            }
        }
        else {
            log.info(`Found ${diff.duplicateCandidates.length} candidates for merging, but not
merging as per request`);
        }
        let value;
        return { kind: 'value', value };
    }
    // Not wrapped in the sequential queue: this would introduce a deadlock
    // since retrieveNewAccountsByAccess is wrapped!
    async retrieveAndAddAccountsByAccess(userId, access, isInteractive, userActionFields) {
        return await this.retrieveNewAccountsByAccess(userId, access, 
        /* should add new accounts */ true, 
        /* forceUpdate */ false, isInteractive, userActionFields);
    }
    async retrieveOperationsByAccess(userId, access, ignoreLastFetchDate, isInteractive, userActionFields) {
        if (!access.hasPassword()) {
            log.warn("Skipping transactions fetching -- password isn't present");
            const errcode = helpers_1.getErrorCode('NO_PASSWORD');
            throw new helpers_1.KError("Access' password is not set", 500, errcode);
        }
        let operations = [];
        const now = new Date();
        const allAccounts = await models_1.Account.byAccess(userId, access);
        let oldestLastFetchDate = null;
        const accountMap = new Map();
        const vendorToOwnAccountIdMap = new Map();
        for (const account of allAccounts) {
            vendorToOwnAccountIdMap.set(account.vendorAccountId, account.id);
            if (this.newAccountsMap.has(account.id)) {
                const oldEntry = this.newAccountsMap.get(account.id);
                helpers_1.assert(typeof oldEntry !== 'undefined', 'because of has() call above');
                accountMap.set(account.id, oldEntry);
                continue;
            }
            accountMap.set(account.id, {
                account,
                balanceOffset: 0,
            });
            if (!ignoreLastFetchDate &&
                (oldestLastFetchDate === null || account.lastCheckDate < oldestLastFetchDate)) {
                oldestLastFetchDate = account.lastCheckDate;
            }
        }
        // Eagerly clear state.
        this.newAccountsMap.clear();
        // Fetch source operations
        const isDebugEnabled = await models_1.Setting.findOrCreateDefaultBooleanValue(userId, settings_1.WOOB_ENABLE_DEBUG);
        let fromDate = null;
        if (oldestLastFetchDate !== null) {
            const thresholdSetting = await models_1.Setting.findOrCreateDefault(userId, settings_1.WOOB_FETCH_THRESHOLD);
            const fetchThresholdInMonths = parseInt(thresholdSetting.value, 10);
            if (fetchThresholdInMonths > 0) {
                fromDate = moment_1.default(oldestLastFetchDate)
                    .subtract(fetchThresholdInMonths, 'months')
                    .toDate();
            }
        }
        const sessionManager = getUserSession(userId);
        let sourceOps;
        try {
            const providerResponse = await providers_1.getProvider(access).fetchOperations({
                access,
                debug: isDebugEnabled,
                fromDate,
                isInteractive,
                userActionFields,
            }, sessionManager);
            if (providerResponse.kind === 'user_action') {
                return providerResponse;
            }
            // Real values.
            sourceOps = providerResponse.values;
        }
        catch (err) {
            const { errCode } = err;
            // Only save the status code if the error was raised in the source, using a KError.
            if (errCode) {
                await models_1.Access.update(userId, access.id, { fetchStatus: errCode });
            }
            throw err;
        }
        log.info(`${sourceOps.length} operations retrieved from source.`);
        log.info('Normalizing source information...');
        for (const sourceOp of sourceOps) {
            if (!vendorToOwnAccountIdMap.has(sourceOp.account)) {
                log.error(`Operation attached to an unknown account (vendor id: ${sourceOp.account}), skipping`);
                continue;
            }
            if (!sourceOp.rawLabel && !sourceOp.label) {
                log.error('Operation without raw label or label, skipping');
                continue;
            }
            const operation = {
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
            const hasInvalidDate = !moment_1.default(operation.date).isValid();
            const hasInvalidDebitDate = !debitDate || !moment_1.default(debitDate).isValid();
            if (hasInvalidDate && hasInvalidDebitDate) {
                log.error('Operation with invalid date and debitDate, skipping');
                continue;
            }
            if (hasInvalidDate) {
                log.warn('Operation with invalid date, using debitDate instead');
                helpers_1.assert(typeof debitDate !== 'undefined', 'debitDate must be set per above && check');
                operation.date = new Date(debitDate);
            }
            if (hasInvalidDebitDate) {
                helpers_1.assert(operation.date !== null, 'because of above && check');
                log.warn('Operation with invalid debitDate, using date instead');
                operation.debitDate = operation.date;
            }
            else {
                helpers_1.assert(typeof debitDate !== 'undefined', 'debitDate must be set per above && check');
                operation.debitDate = new Date(debitDate);
            }
            operation.importDate = now;
            const operationType = transaction_types_1.transactionTypeIdToName(sourceOp.type);
            if (operationType !== null) {
                operation.type = operationType;
            }
            else {
                log.warn('unknown source operation type:', sourceOp.type);
                operation.type = helpers_1.UNKNOWN_OPERATION_TYPE;
            }
            operations.push(operation);
        }
        log.info('Comparing with database to ignore already known operations…');
        let newTransactions = [];
        let transactionsToUpdate = [];
        for (const accountInfo of accountMap.values()) {
            const { account } = accountInfo;
            const provideds = [];
            const remainingOperations = [];
            for (const op of operations) {
                if (op.accountId === account.id) {
                    provideds.push(op);
                }
                else {
                    remainingOperations.push(op);
                }
            }
            operations = remainingOperations;
            if (!provideds.length) {
                continue;
            }
            helpers_1.assert(typeof provideds[0].date !== 'undefined', 'date has been set at this point');
            const minDate = moment_1.default(new Date(provideds.reduce((min, op) => {
                helpers_1.assert(typeof op.date !== 'undefined', 'date has been set at this point');
                return Math.min(+op.date, min);
            }, +provideds[0].date)))
                .subtract(MAX_DIFFERENCE_BETWEEN_DUP_DATES_IN_DAYS, 'days')
                .toDate();
            const maxDate = new Date(provideds.reduce((max, op) => {
                helpers_1.assert(typeof op.date !== 'undefined', 'date has been set at this point');
                return Math.max(+op.date, max);
            }, +provideds[0].date));
            const knowns = await models_1.Transaction.byBankSortedByDateBetweenDates(userId, account, minDate, maxDate);
            const { providerOrphans, duplicateCandidates } = diff_transactions_1.default(knowns, provideds);
            // Try to be smart to reduce the number of new transactions.
            const { toCreate, toUpdate } = filter_duplicate_transactions_1.default(duplicateCandidates);
            transactionsToUpdate = transactionsToUpdate.concat(toUpdate);
            newTransactions = newTransactions.concat(providerOrphans, toCreate);
            // Resync balance only if we are sure that the operation is a new one.
            const accountImportDate = new Date(account.importDate);
            accountInfo.balanceOffset = providerOrphans
                .filter((op) => helpers_1.shouldIncludeInBalance(op, accountImportDate, account.type))
                .reduce((sum, op) => {
                helpers_1.assert(typeof op.amount !== 'undefined', 'operation must have an amount at least');
                return sum + op.amount;
            }, 0);
        }
        // Now that we're sure which transactions are going to be created,
        // apply the rule-based system on the new transactions.
        // Updated or deleted transactions shouldn't need to run through the
        // rule-based system.
        const rules = await models_1.TransactionRule.allOrdered(userId);
        rule_engine_1.default(rules, newTransactions);
        const toCreate = newTransactions;
        const numNewTransactions = toCreate.length;
        const createdTransactions = [];
        // Create the new transactions.
        if (numNewTransactions) {
            log.info(`${toCreate.length} new transactions found!`);
            log.info('Creating new transactions…');
            for (const operationToCreate of toCreate) {
                const created = await models_1.Transaction.create(userId, operationToCreate);
                createdTransactions.push(created);
            }
            log.info('Done.');
        }
        // Update the transactions.
        if (transactionsToUpdate.length) {
            log.info(`${transactionsToUpdate.length} transactions to update.`);
            log.info('Updating transactions…');
            for (const { known, update } of transactionsToUpdate) {
                await models_1.Transaction.update(userId, known.id, update);
            }
            log.info('Done.');
        }
        log.info('Updating accounts balances…');
        for (const { account, balanceOffset } of accountMap.values()) {
            if (balanceOffset) {
                log.info(`Account ${account.label} initial balance is going
to be resynced, by an offset of ${balanceOffset}.`);
                const initialBalance = account.initialBalance - balanceOffset;
                await models_1.Account.update(userId, account.id, { initialBalance });
            }
        }
        // Carry over all the triggers on new transactions.
        log.info("Updating 'last checked' for linked accounts...");
        const accounts = [];
        const lastCheckDate = new Date();
        for (const account of allAccounts) {
            const updated = await models_1.Account.update(userId, account.id, { lastCheckDate });
            accounts.push(updated);
        }
        if (numNewTransactions > 0) {
            log.info('Checking alerts for accounts balance...');
            await alert_manager_1.default.checkAlertsForAccounts(userId, access);
            log.info('Checking alerts for transactions amount...');
            await alert_manager_1.default.checkAlertsForOperations(userId, access, createdTransactions);
        }
        await models_1.Access.update(userId, access.id, { fetchStatus: helpers_1.FETCH_STATUS_SUCCESS });
        log.info('Post process: done.');
        return { kind: 'value', value: { accounts, createdTransactions } };
    }
    async resyncAccountBalance(userId, account, isInteractive, userActionFields) {
        var _a;
        const access = helpers_1.unwrap(await models_1.Access.find(userId, account.accessId));
        // Note: we do not fetch transactions before, because this can lead to duplicates,
        // and compute a false initial balance.
        const response = await retrieveAllAccountsByAccess(userId, access, 
        /* forceUpdate */ false, isInteractive, userActionFields);
        if (response.kind === 'user_action') {
            return response;
        }
        const accounts = response.value;
        // Ensure the account number is actually a string.
        const vendorAccountId = account.vendorAccountId.toString();
        const retrievedAccount = accounts.find((acc) => acc.vendorAccountId === vendorAccountId);
        if (typeof retrievedAccount !== 'undefined') {
            const realBalance = (_a = retrievedAccount.initialBalance) !== null && _a !== void 0 ? _a : 0;
            const kresusBalance = await account.computeBalance();
            const balanceDelta = realBalance - kresusBalance;
            if (Math.abs(balanceDelta) > 0.001) {
                log.info(`Updating balance for account ${account.vendorAccountId}`);
                const initialBalance = account.initialBalance + balanceDelta;
                const updatedAccount = await models_1.Account.update(userId, account.id, { initialBalance });
                return {
                    kind: 'value',
                    value: updatedAccount,
                };
            }
        }
        else {
            // This case can happen if it's a known orphan.
            throw new helpers_1.KError('account not found', 404);
        }
        return { kind: 'value', value: account };
    }
}
exports.default = new AccountManager();
