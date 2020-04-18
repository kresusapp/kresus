"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const moment_1 = __importDefault(require("moment"));
const models_1 = require("../models");
const account_types_1 = require("./account-types");
const transaction_types_1 = require("./transaction-types");
const bank_vendors_1 = require("./bank-vendors");
const providers_1 = require("../providers");
const helpers_1 = require("../helpers");
const async_queue_1 = __importDefault(require("./async-queue"));
const alert_manager_1 = __importDefault(require("./alert-manager"));
const diff_accounts_1 = __importDefault(require("./diff-accounts"));
const diff_transactions_1 = __importDefault(require("./diff-transactions"));
const filter_duplicate_transactions_1 = __importDefault(require("./filter-duplicate-transactions"));
let log = helpers_1.makeLogger('accounts-manager');
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
    await models_1.Account.update(userId, known.id, newProps);
}
// Returns a list of all the accounts returned by the backend, associated to
// the given accessId.
async function retrieveAllAccountsByAccess(userId, access, forceUpdate = false, isInteractive = false) {
    if (!access.hasPassword()) {
        log.warn("Skipping accounts fetching -- password isn't present");
        let errcode = helpers_1.getErrorCode('NO_PASSWORD');
        throw new helpers_1.KError("Access' password is not set", 500, errcode);
    }
    log.info(`Retrieve all accounts from access ${access.vendorId} with login ${access.login}`);
    let isDebugEnabled = await models_1.Setting.findOrCreateDefaultBooleanValue(userId, 'weboob-enable-debug');
    let sourceAccounts;
    try {
        sourceAccounts = await providers_1.getProvider(access).fetchAccounts({
            access,
            debug: isDebugEnabled,
            update: forceUpdate,
            isInteractive
        });
    }
    catch (err) {
        let { errCode } = err;
        // Only save the status code if the error was raised in the source, using a KError.
        if (errCode) {
            await models_1.Access.update(userId, access.id, { fetchStatus: errCode });
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
        let accountType = account_types_1.accountTypeIdToName(accountWeboob.type);
        // The default type's value is directly set by the account model.
        if (accountType !== null) {
            account.type = accountType;
        }
        if (helpers_1.currency.isKnown(accountWeboob.currency)) {
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
        }
        else {
            newOpsPerAccount.get(opAccountId).push(newOp);
        }
    }
    let bank = bank_vendors_1.bankVendorByUuid(access.vendorId);
    helpers_1.assert(typeof bank !== 'undefined', 'The bank must be known');
    for (let [accountId, ops] of newOpsPerAccount.entries()) {
        let { account } = accountMap.get(accountId);
        /* eslint-disable camelcase */
        let params = {
            account_label: `${access.customLabel || bank.name} - ${helpers_1.displayLabel(account)}`,
            smart_count: ops.length
        };
        if (ops.length === 1) {
            // Send a notification with the operation content
            let formatCurrency = await account.getCurrencyFormatter();
            params.operation_details = `${ops[0].label} ${formatCurrency(ops[0].amount)}`;
        }
        /* eslint-enable camelcase */
    }
}
class AccountManager {
    constructor() {
        this.newAccountsMap = new Map();
        this.q = new async_queue_1.default();
        this.retrieveNewAccountsByAccess = this.q.wrap(this.retrieveNewAccountsByAccess.bind(this));
        this.retrieveOperationsByAccess = this.q.wrap(this.retrieveOperationsByAccess.bind(this));
        this.resyncAccountBalance = this.q.wrap(this.resyncAccountBalance.bind(this));
    }
    async retrieveNewAccountsByAccess(userId, access, shouldAddNewAccounts, forceUpdate = false, isInteractive = false) {
        if (this.newAccountsMap.size) {
            log.warn('At the top of retrieveNewAccountsByAccess, newAccountsMap must be empty.');
            this.newAccountsMap.clear();
        }
        let accounts = await retrieveAllAccountsByAccess(userId, access, forceUpdate, isInteractive);
        let oldAccounts = await models_1.Account.byAccess(userId, access);
        let diff = diff_accounts_1.default(oldAccounts, accounts);
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
            // Save the account in DB and in the new accounts map.
            const newAccount = await models_1.Account.create(userId, account);
            let newAccountInfo = {
                account: newAccount,
                balanceOffset: 0
            };
            this.newAccountsMap.set(newAccount.id, newAccountInfo);
        }
        for (let account of diff.knownOrphans) {
            log.info("Orphan account found in Kresus's database: ", account.vendorAccountId);
            // TODO do something with orphan accounts!
        }
        let shouldMergeAccounts = await models_1.Setting.findOrCreateDefaultBooleanValue(userId, 'weboob-auto-merge-accounts');
        if (shouldMergeAccounts) {
            for (let [known, provided] of diff.duplicateCandidates) {
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
    }
    // Not wrapped in the sequential queue: this would introduce a deadlock
    // since retrieveNewAccountsByAccess is wrapped!
    async retrieveAndAddAccountsByAccess(userId, access, isInteractive = false) {
        return await this.retrieveNewAccountsByAccess(userId, access, 
        /* should add new accounts */ true, 
        /* forceUpdate */ false, isInteractive);
    }
    async retrieveOperationsByAccess(userId, access, ignoreLastFetchDate = false, isInteractive = false) {
        if (!access.hasPassword()) {
            log.warn("Skipping operations fetching -- password isn't present");
            let errcode = helpers_1.getErrorCode('NO_PASSWORD');
            throw new helpers_1.KError("Access' password is not set", 500, errcode);
        }
        let operations = [];
        let now = new Date().toISOString();
        let allAccounts = await models_1.Account.byAccess(userId, access);
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
            if (!ignoreLastFetchDate &&
                (oldestLastFetchDate === null || account.lastCheckDate < oldestLastFetchDate)) {
                oldestLastFetchDate = account.lastCheckDate;
            }
        }
        // Eagerly clear state.
        this.newAccountsMap.clear();
        // Fetch source operations
        let isDebugEnabled = await models_1.Setting.findOrCreateDefaultBooleanValue(userId, 'weboob-enable-debug');
        let fromDate = null;
        if (oldestLastFetchDate !== null) {
            const thresholdSetting = await models_1.Setting.findOrCreateDefault(userId, 'weboob-fetch-threshold');
            const fetchThresholdInMonths = parseInt(thresholdSetting.value, 10);
            if (fetchThresholdInMonths > 0) {
                fromDate = moment_1.default(oldestLastFetchDate)
                    .subtract(fetchThresholdInMonths, 'months')
                    .toDate();
            }
        }
        let sourceOps;
        try {
            sourceOps = await providers_1.getProvider(access).fetchOperations({
                access,
                debug: isDebugEnabled,
                fromDate,
                isInteractive
            });
        }
        catch (err) {
            let { errCode } = err;
            // Only save the status code if the error was raised in the source, using a KError.
            if (errCode) {
                await models_1.Access.update(userId, access.id, { fetchStatus: errCode });
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
            let hasInvalidDate = !moment_1.default(operation.date).isValid();
            let hasInvalidDebitDate = !moment_1.default(operation.debitDate).isValid();
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
            let operationType = transaction_types_1.transactionTypeIdToName(sourceOp.type);
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
        let newOperations = [];
        let transactionsToUpdate = [];
        for (let accountInfo of accountMap.values()) {
            let { account } = accountInfo;
            let provideds = [];
            let remainingOperations = [];
            for (let op of operations) {
                if (op.accountId === account.id) {
                    provideds.push(op);
                }
                else {
                    remainingOperations.push(op);
                }
            }
            operations = remainingOperations;
            if (provideds.length) {
                let minDate = moment_1.default(new Date(provideds.reduce((min, op) => {
                    return Math.min(+op.date, min);
                }, +provideds[0].date)))
                    .subtract(MAX_DIFFERENCE_BETWEEN_DUP_DATES_IN_DAYS, 'days')
                    .toDate();
                let maxDate = new Date(provideds.reduce((max, op) => {
                    return Math.max(+op.date, max);
                }, +provideds[0].date));
                let knowns = await models_1.Transaction.byBankSortedByDateBetweenDates(userId, account, minDate, maxDate);
                let { providerOrphans, duplicateCandidates } = diff_transactions_1.default(knowns, provideds);
                // Try to be smart to reduce the number of new transactions.
                let { toCreate, toUpdate } = filter_duplicate_transactions_1.default(duplicateCandidates);
                transactionsToUpdate = transactionsToUpdate.concat(toUpdate);
                newOperations = newOperations.concat(providerOrphans, toCreate);
                // Resync balance only if we are sure that the operation is a new one.
                let accountImportDate = new Date(account.importDate);
                accountInfo.balanceOffset = providerOrphans
                    .filter(op => helpers_1.shouldIncludeInBalance(op, accountImportDate, account.type))
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
                let created = await models_1.Transaction.create(userId, operationToCreate);
                newOperations.push(created);
            }
            log.info('Done.');
        }
        // Update the transactions.
        if (transactionsToUpdate.length) {
            log.info(`${transactionsToUpdate.length} transactions to update.`);
            log.info('Updating transactions…');
            for (let { known, update } of transactionsToUpdate) {
                await models_1.Transaction.update(userId, known.id, update);
            }
            log.info('Done.');
        }
        log.info('Updating accounts balances…');
        for (let { account, balanceOffset } of accountMap.values()) {
            if (balanceOffset) {
                log.info(`Account ${account.label} initial balance is going
to be resynced, by an offset of ${balanceOffset}.`);
                let initialBalance = account.initialBalance - balanceOffset;
                await models_1.Account.update(userId, account.id, { initialBalance });
            }
        }
        // Carry over all the triggers on new operations.
        log.info("Updating 'last checked' for linked accounts...");
        let accounts = [];
        let lastCheckDate = new Date();
        for (let account of allAccounts) {
            let updated = await models_1.Account.update(userId, account.id, { lastCheckDate });
            accounts.push(updated);
        }
        if (numNewOperations > 0) {
            log.info(`Informing user ${numNewOperations} new operations have been imported...`);
            await notifyNewOperations(access, newOperations, accountMap);
            log.info('Checking alerts for accounts balance...');
            await alert_manager_1.default.checkAlertsForAccounts(userId, access);
            log.info('Checking alerts for operations amount...');
            await alert_manager_1.default.checkAlertsForOperations(userId, access, newOperations);
        }
        await models_1.Access.update(userId, access.id, { fetchStatus: helpers_1.FETCH_STATUS_SUCCESS });
        log.info('Post process: done.');
        return { accounts, newOperations };
    }
    async resyncAccountBalance(userId, account, isInteractive) {
        let access = await models_1.Access.find(userId, account.accessId);
        // Note: we do not fetch operations before, because this can lead to duplicates,
        // and compute a false initial balance.
        let accounts = await retrieveAllAccountsByAccess(userId, access, 
        /* forceUpdate */ false, isInteractive);
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
                return await models_1.Account.update(userId, account.id, { initialBalance });
            }
        }
        else {
            // This case can happen if it's a known orphan.
            throw new helpers_1.KError('account not found', 404);
        }
        return account;
    }
}
exports.default = new AccountManager();
