"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testing = void 0;
exports.registerStartupTask = registerStartupTask;
exports.all = all;
exports.export_ = export_;
exports.parseDate = parseDate;
exports.importData = importData;
exports.import_ = import_;
exports.importOFX_ = importOFX_;
const crypto_1 = __importDefault(require("crypto"));
const models_1 = require("../models");
const data_migrations_1 = __importDefault(require("../models/data-migrations"));
const helpers_1 = require("../helpers");
const bank_vendors_1 = require("../lib/bank-vendors");
const instance_1 = require("../lib/instance");
const helpers_2 = require("../shared/helpers");
const default_settings_1 = __importDefault(require("../shared/default-settings"));
const settings_1 = require("../../shared/settings");
const helpers_3 = require("./helpers");
const instance_2 = require("./instance");
const ofx_1 = require("./ofx");
const diff_accounts_1 = __importDefault(require("../lib/diff-accounts"));
const diff_transactions_1 = __importDefault(require("../lib/diff-transactions"));
const log = (0, helpers_1.makeLogger)('controllers/all');
const ERR_MSG_LOADING_ALL = 'Error when loading all Kresus data';
// Startup tasks are cleanup tasks that will be run the next time a user will run the /all initial
// request.
const STARTUP_TASKS = {};
// Registers a new startup task for the given user.
function registerStartupTask(userId, f) {
    STARTUP_TASKS[userId] = STARTUP_TASKS[userId] || [];
    STARTUP_TASKS[userId].push(f);
}
// Run startup tasks for the user, if any.
async function runStartupTasks(userId) {
    if (STARTUP_TASKS[userId]) {
        while (STARTUP_TASKS[userId].length) {
            const task = (0, helpers_1.unwrap)(STARTUP_TASKS[userId].pop());
            await task();
        }
    }
}
async function getAllData(userId, options = {}) {
    const { isExport = false, cleanPassword = true } = options;
    let ret = {
        accounts: [],
        accesses: [],
        alerts: [],
        categories: [],
        transactions: [],
        settings: [],
        instance: {},
        recurringTransactions: [],
        views: [],
    };
    const accesses = await models_1.Access.all(userId);
    for (const access of accesses) {
        const clientAccess = { ...access };
        // Just keep the name and the value of the field.
        clientAccess.fields = (access.fields || []).map(({ name, value }) => {
            return { name, value };
        });
        if (cleanPassword) {
            delete clientAccess.password;
            delete clientAccess.session;
        }
        if (!isExport) {
            // Process enabled status only for the /all request.
            clientAccess.enabled = access.isEnabled();
            delete clientAccess.session;
        }
        const bank = (0, bank_vendors_1.bankVendorByUuid)(clientAccess.vendorId);
        if (bank && bank.name) {
            clientAccess.label = bank.name;
        }
        ret.accesses.push(clientAccess);
    }
    ret.accounts = await models_1.Account.all(userId);
    ret.categories = await models_1.Category.all(userId);
    ret.transactions = await models_1.Transaction.all(userId);
    ret.settings = await models_1.Setting.all(userId);
    ret.recurringTransactions = await models_1.RecurringTransaction.all(userId);
    ret.views = await models_1.View.all(userId);
    if (isExport) {
        ret.budgets = await models_1.Budget.all(userId);
        // This fetches the associated conditions and actions data, so no need
        // to join explicitly here.
        ret.transactionRules = await models_1.TransactionRule.allOrdered(userId);
        // We only need to export the applied recurring transactions from the current month since
        // the recurring transactions won't be created for the past at next poll.
        const now = new Date();
        ret.appliedRecurringTransactions = await models_1.AppliedRecurringTransaction.byMonthAndYear(userId, now.getMonth(), now.getFullYear());
    }
    else {
        ret.instance = await (0, instance_1.getAll)();
        const user = await models_1.User.find(userId);
        if (user) {
            ret.user = user;
        }
    }
    if (isExport || (0, helpers_1.isEmailEnabled)() || (0, helpers_1.isAppriseApiEnabled)()) {
        ret.alerts = await models_1.Alert.all(userId);
    }
    else {
        ret.alerts = [];
    }
    if (isExport) {
        ret = (0, helpers_3.cleanData)(ret);
    }
    return ret;
}
async function all(req, res) {
    try {
        const { id: userId } = req.user;
        await runStartupTasks(userId);
        const ret = await getAllData(userId);
        res.status(200).json(ret);
    }
    catch (err) {
        err.code = ERR_MSG_LOADING_ALL;
        (0, helpers_1.asyncErr)(res, err, 'when loading all data');
    }
}
const ENCRYPTION_ALGORITHM = 'aes-256-ctr';
const ENCRYPTED_CONTENT_TAG = Buffer.from('KRE');
function encryptData(data, passphrase) {
    (0, helpers_1.assert)(process.kresus.salt !== null, 'must have provided a salt');
    const initVector = crypto_1.default.randomBytes(16);
    const key = crypto_1.default.pbkdf2Sync(passphrase, process.kresus.salt, 100000, 32, 'sha512');
    const cipher = crypto_1.default.createCipheriv(ENCRYPTION_ALGORITHM, key, initVector);
    return Buffer.concat([
        initVector,
        ENCRYPTED_CONTENT_TAG,
        cipher.update(JSON.stringify(data)),
        cipher.final(),
    ]).toString('base64');
}
function decryptData(data, passphrase) {
    (0, helpers_1.assert)(process.kresus.salt !== null, 'must have provided a salt');
    const rawData = Buffer.from(data, 'base64');
    const [initVector, tag, encrypted] = [
        rawData.slice(0, 16),
        rawData.slice(16, 16 + 3),
        rawData.slice(16 + 3),
    ];
    if (tag.toString() !== ENCRYPTED_CONTENT_TAG.toString()) {
        throw new helpers_1.KError('submitted file is not a valid kresus encrypted file', 400, (0, helpers_1.getErrorCode)('INVALID_ENCRYPTED_EXPORT'));
    }
    const key = crypto_1.default.pbkdf2Sync(passphrase, process.kresus.salt, 100000, 32, 'sha512');
    const decipher = crypto_1.default.createDecipheriv(ENCRYPTION_ALGORITHM, key, initVector);
    return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString();
}
async function export_(req, res) {
    try {
        const { id: userId } = req.user;
        let passphrase = null;
        if (req.body.encrypted) {
            if (typeof req.body.passphrase !== 'string' || !req.body.passphrase) {
                throw new helpers_1.KError('missing parameter "passphrase"', 400);
            }
            if (process.kresus.salt === null) {
                throw new helpers_1.KError("server hasn't been configured for encryption; " +
                    'please ask your administrator to provide a salt');
            }
            passphrase = req.body.passphrase;
            (0, helpers_1.assert)(passphrase !== null, 'passphrase must be set here');
            // Check password strength
            if (!(0, helpers_2.validatePassword)(passphrase)) {
                throw new helpers_1.KError('submitted passphrase is too weak', 400);
            }
        }
        const data = await getAllData(userId, { isExport: true, cleanPassword: !passphrase });
        let ret = {};
        if (passphrase) {
            const encryptedData = encryptData(data, passphrase);
            ret = {
                encrypted: true,
                data: encryptedData,
            };
        }
        else {
            ret = {
                encrypted: false,
                data,
            };
        }
        res.status(200).json(ret);
    }
    catch (err) {
        err.code = ERR_MSG_LOADING_ALL;
        (0, helpers_1.asyncErr)(res, err, 'when exporting data');
    }
}
function applyRenamings(model) {
    if (typeof model.renamings === 'undefined') {
        return obj => obj;
    }
    return (obj) => {
        for (const from of Object.keys(model.renamings)) {
            const to = model.renamings[from];
            if (typeof obj[from] !== 'undefined') {
                if (typeof obj[to] === 'undefined') {
                    obj[to] = obj[from];
                }
                delete obj[from];
            }
        }
        return obj;
    };
}
function parseDate(date) {
    let parsedDate;
    switch (typeof date) {
        case 'string':
            parsedDate = Date.parse(date);
            if (!isNaN(parsedDate)) {
                return new Date(parsedDate);
            }
            break;
        case 'number':
            if (!isNaN(date) && date > -8640000000000000 && date < 8640000000000000) {
                return new Date(date);
            }
            break;
        default:
            if (date instanceof Date) {
                return date;
            }
    }
    return null;
}
// Import the given data from the `world` object, created by interpreting the JSON created from a
// call to `export_()` in this same file.
//
// If `dontCreateAccess` is true, it is assumed that the access id refers to a valid access that is
// known in the database. Otherwise, then the access is created.
//
// Note: destroy the input `world` argument by changing its fields in place.
async function importData(userId, world, dontCreateAccess) {
    var _a;
    world.accesses = (world.accesses || []).map(applyRenamings(models_1.Access));
    world.accounts = (world.accounts || []).map(applyRenamings(models_1.Account));
    world.alerts = (world.alerts || []).map(applyRenamings(models_1.Alert));
    world.budgets = (world.budgets || []).map(applyRenamings(models_1.Budget));
    world.categories = (world.categories || []).map(applyRenamings(models_1.Category));
    // Keep backward compat with 'operations'.
    world.transactions = (world.transactions || world.operations || []).map(applyRenamings(models_1.Transaction));
    world.settings = (world.settings || []).map(applyRenamings(models_1.Setting));
    world.transactionRules = world.transactionRules || [];
    world.recurringTransactions = world.recurringTransactions || [];
    world.appliedRecurringTransactions = world.appliedRecurringTransactions || [];
    world.views = world.views || [];
    // Static data.
    // Keep backward compat with 'operationtypes'.
    world.transactiontypes = world.transactiontypes || world.operationtypes || [];
    // Importing only known settings prevents assertion errors in the client when
    // importing Kresus data in an older version of kresus.
    world.settings = world.settings.filter((s) => default_settings_1.default.has(s.key)) || [];
    log.info(`Importing:
        accesses:          ${world.accesses.length}
        accounts:          ${world.accounts.length}
        alerts:            ${world.alerts.length}
        budgets:           ${world.budgets.length}
        categories:        ${world.categories.length}
        transaction-types: ${world.transactiontypes.length}
        settings:          ${world.settings.length}
        transactions:      ${world.transactions.length}
        rules:             ${world.transactionRules.length}
        recurring-transactions:           ${world.recurringTransactions.length}
        applied-recurring-transactions:           ${world.appliedRecurringTransactions.length}
        views:           ${world.views.length}
    `);
    log.info('Import accesses...');
    const accessMap = {};
    for (const access of world.accesses) {
        const accessId = access.id;
        delete access.id;
        delete access.userId;
        // Try to match the vendor id and login against an existing pair in the database.
        const foundKnown = await models_1.Access.byCredentials(userId, {
            uuid: access.vendorId,
            login: access.login,
        });
        if (foundKnown !== null) {
            // The access was already known: don't reimport it.
            accessMap[accessId] = {
                id: foundKnown.id,
                wasKnown: true,
                vendorId: foundKnown.vendorId,
            };
            log.info(`Ignoring import of access ${access.vendorId} (${access.login}) as it already exists.`);
            continue;
        }
        const sanitizedCustomFields = [];
        // Support legacy "customFields" value.
        if (typeof access.customFields === 'string' && !access.fields) {
            try {
                access.fields = JSON.parse(access.customFields);
            }
            catch (e) {
                log.error('Invalid JSON customFields, ignoring fields:', e.toString());
            }
        }
        for (const { name, value } of access.fields || []) {
            if (typeof name !== 'string') {
                log.warn('Ignoring customField because of non-string "name" property.');
                continue;
            }
            if (typeof value !== 'string') {
                log.warn(`Ignoring custom field for key ${name} because of non-string "value" property`);
                continue;
            }
            sanitizedCustomFields.push({ name, value });
        }
        access.fields = sanitizedCustomFields;
        if (dontCreateAccess) {
            // The access id given from the `world` object is valid, according to this function's
            // contract, so the mapping doesn't need to redirect to another access we created.
            accessMap[accessId] = { id: accessId, wasKnown: true };
            log.info(`Not creating new known access ${access.vendorId} (${access.login}) because it's explicitly marked as known.`);
        }
        else {
            const created = await models_1.Access.create(userId, access);
            accessMap[accessId] = { id: created.id, wasKnown: false };
            log.info(`Creating new unknown access ${access.vendorId} (${access.login}).`);
        }
    }
    log.info('Done.');
    log.info('Import accounts...');
    const accountIdToAccount = new Map();
    const vendorToOwnAccountId = new Map();
    for (const account of world.accounts) {
        if (typeof accessMap[account.accessId] === 'undefined') {
            log.warn('Ignoring orphan account:\n', account);
            continue;
        }
        const accountId = account.id;
        // Create a copy of the account. We should use structuredClone but for some reasons our
        // tests are passing models instead of literal objects.
        const accountCopy = JSON.parse(JSON.stringify(account));
        delete accountCopy.id;
        delete accountCopy.userId;
        // For an initial import which does not come from Kresus (ex: a
        // handmade JSON file), there might be no lastCheckDate.
        accountCopy.lastCheckDate = parseDate(accountCopy.lastCheckDate);
        if (accountCopy.lastCheckDate === null) {
            let latestOpDate = null;
            if (world.transactions) {
                const accountOps = world.transactions.filter((op) => op.accountId === accountId);
                for (const op of accountOps) {
                    const opDate = parseDate(op.date);
                    if (opDate !== null && (latestOpDate === null || opDate > latestOpDate)) {
                        latestOpDate = opDate;
                    }
                }
            }
            accountCopy.lastCheckDate = latestOpDate || new Date();
        }
        // If the access containing this account was known, then try to match this account against
        // one known in the database.
        const accessRemap = accessMap[accountCopy.accessId];
        accountCopy.accessId = accessRemap === null || accessRemap === void 0 ? void 0 : accessRemap.id;
        if (accessRemap === null || accessRemap === void 0 ? void 0 : accessRemap.wasKnown) {
            const knownAccounts = await models_1.Account.byAccess(userId, { id: accessRemap.id });
            if (typeof knownAccounts !== 'undefined') {
                const vendorId = (_a = accessRemap.vendorId) !== null && _a !== void 0 ? _a : undefined;
                const diffResult = (0, diff_accounts_1.default)(knownAccounts, [accountCopy], vendorId);
                // There can be at most one perfect match, since we provided only one account.
                if (diffResult.perfectMatches.length === 1) {
                    const firstMatchPair = diffResult.perfectMatches[0];
                    const knownAccount = firstMatchPair[0];
                    // The account was found as a perfect match: do not import it, and reuse it
                    // instead.
                    accountIdToAccount.set(accountId, knownAccount.id);
                    vendorToOwnAccountId.set(accountCopy.vendorAccountId, knownAccount.id);
                    log.info(`Ignoring import of account ${accountCopy.label} (${accountCopy.vendorAccountId}) as it already exists.`);
                    continue;
                }
            }
        }
        log.info(`Importing new unknown account ${accountCopy.label} (${accountCopy.vendorAccountId}).`);
        const created = await models_1.Account.create(userId, accountCopy);
        accountIdToAccount.set(accountId, created.id);
        vendorToOwnAccountId.set(created.vendorAccountId, created.id);
    }
    log.info('Done.');
    log.info('Import views...');
    const viewsMap = {};
    const existingViews = await models_1.View.all(userId);
    for (const view of world.views) {
        const viewId = view.id;
        delete view.id;
        if (!view.createdByUser) {
            // Views created by the user are views created automatically by Kresus to group accounts.
            // Since new automatic views were created automatically when importing accounts, we
            // should not recreate them here.
            // However, we still to map the view ids (for budgets at least).
            // Try to retrieve the corresponding view created automatically.
            const viewAccountsRemapped = view.accounts.map((vAcc) => accountIdToAccount.get(vAcc.accountId));
            const correspondingView = existingViews.find(ev => {
                if (ev.accounts.length === view.accounts.length) {
                    const evAccounts = ev.accounts.map(a => a.accountId);
                    for (const accId of viewAccountsRemapped) {
                        if (!evAccounts.includes(accId)) {
                            return false;
                        }
                    }
                    return true;
                }
                return false;
            });
            if (correspondingView) {
                viewsMap[viewId] = correspondingView.id;
                log.warn('Not re-creating view not created by user as there is already one corresponding view:\n', view);
                continue;
            }
        }
        const viewAccounts = [];
        for (const viewAcc of view.accounts) {
            if (typeof viewAcc.accountId !== 'undefined' &&
                accountIdToAccount.has(viewAcc.accountId)) {
                viewAcc.accountId = accountIdToAccount.get(viewAcc.accountId);
                viewAccounts.push(viewAcc);
            }
            else {
                log.warn('Ignoring account in view:\n', view);
            }
        }
        if (viewAccounts.length === 0) {
            log.warn('Ignoring view without accounts:\n', view);
            continue;
        }
        const created = await models_1.View.create(userId, Object.assign(view, { accounts: viewAccounts }));
        viewsMap[viewId] = created.id;
    }
    log.info('Done.');
    log.info('Import categories...');
    const existingCategories = await models_1.Category.all(userId);
    const existingCategoriesMap = new Map();
    for (const category of existingCategories) {
        existingCategoriesMap.set(category.label, category);
    }
    const categoryMap = {};
    for (const category of world.categories) {
        const catId = category.id;
        delete category.id;
        delete category.userId;
        if (existingCategoriesMap.has(category.label)) {
            const existing = existingCategoriesMap.get(category.label);
            categoryMap[catId] = existing.id;
        }
        else {
            const created = await models_1.Category.create(userId, category);
            categoryMap[catId] = created.id;
        }
    }
    log.info('Done.');
    log.info('Import budgets...');
    const makeBudgetKey = (b) => `${b.viewId}-${b.categoryId}-${b.year}-${b.month}`;
    const existingBudgets = await models_1.Budget.all(userId);
    const existingBudgetsMap = new Map();
    for (const budget of existingBudgets) {
        existingBudgetsMap.set(makeBudgetKey(budget), budget);
    }
    let defaultViewId = -1;
    let lookForDefaultView = true;
    for (const importedBudget of world.budgets) {
        if (typeof importedBudget.viewId !== 'number') {
            if (defaultViewId === -1 && lookForDefaultView) {
                // For budgets pre-existing views, there is no viewId set. We need to retrieve
                // it from the defaultAccountId (the one imported) or the first account imported.
                const defaultAccountImportedSetting = world.settings.find((setting) => setting && setting.key === settings_1.DEFAULT_ACCOUNT_ID);
                let defaultImportedAccountId;
                if (defaultAccountImportedSetting) {
                    defaultImportedAccountId = accountIdToAccount.get(defaultAccountImportedSetting.value);
                }
                else {
                    // Find the first checking account otherwise the first account.
                    const bestGuessAccountFromImport = world.accounts.find((acc) => acc.type === 'account-type.checking') ||
                        world.accounts[0];
                    defaultImportedAccountId = accountIdToAccount.get(bestGuessAccountFromImport.id);
                }
                if (typeof defaultImportedAccountId === 'number') {
                    const allViews = await models_1.View.all(userId);
                    const defaultAccountAssociatedView = allViews.find(view => {
                        return (view.accounts.length === 1 &&
                            view.accounts[0].accountId === defaultImportedAccountId);
                    });
                    if (defaultAccountAssociatedView) {
                        defaultViewId = defaultAccountAssociatedView.id;
                    }
                    else {
                        lookForDefaultView = false;
                    }
                }
                else {
                    lookForDefaultView = false;
                }
            }
            if (defaultViewId === -1) {
                // We don't know what to do with this budget without any account/view
                // to associate it with.
                log.warn('No view to associate a budget with, skipping budget import…');
                continue;
            }
            // Set the default view id as the budget's viewId.
            importedBudget.viewId = defaultViewId;
        }
        else {
            if (!viewsMap[importedBudget.viewId]) {
                log.warn('No view to associate a budget with, skipping budget import…');
                continue;
            }
            importedBudget.viewId = viewsMap[importedBudget.viewId];
        }
        // Note the order here: first map to the actual category id, so the
        // map lookup thereafter uses an existing category id.
        importedBudget.categoryId = categoryMap[importedBudget.categoryId];
        const existingBudget = existingBudgetsMap.get(makeBudgetKey(importedBudget));
        if (existingBudget) {
            if (!existingBudget.threshold ||
                existingBudget.threshold !== importedBudget.threshold) {
                await models_1.Budget.update(userId, existingBudget.id, {
                    threshold: importedBudget.threshold,
                });
            }
        }
        else {
            delete importedBudget.id;
            delete importedBudget.userId;
            const newBudget = await models_1.Budget.create(userId, importedBudget);
            // There could be duplicates in the import (see #1051), ensure we don't try
            // to import the same budget twice.
            existingBudgetsMap.set(makeBudgetKey(newBudget), newBudget);
        }
    }
    log.info('Done.');
    // No need to import transaction types.
    // importedTypesMap is used to set type to imported transactions (backward compatibility).
    const importedTypes = world.transactiontypes || [];
    const importedTypesMap = new Map();
    for (const type of importedTypes) {
        importedTypesMap.set(type.id.toString(), type.name);
    }
    log.info('Import transactions...');
    const newByAccountId = new Map();
    for (let i = 0; i < world.transactions.length; i++) {
        const tr = world.transactions[i];
        tr.date = parseDate(tr.date);
        tr.debitDate = parseDate(tr.debitDate);
        tr.importDate = parseDate(tr.importDate);
        if (tr.date === null) {
            log.warn('Ignoring transaction without date\n', tr);
            continue;
        }
        if (typeof tr.amount !== 'number' || isNaN(tr.amount)) {
            log.warn('Ignoring transaction without valid amount\n', tr);
            continue;
        }
        // Map transaction to account.
        if (typeof tr.accountId !== 'undefined') {
            if (!accountIdToAccount.has(tr.accountId)) {
                log.warn('Ignoring orphan transaction:\n', tr);
                continue;
            }
            tr.accountId = accountIdToAccount.get(tr.accountId);
        }
        else {
            if (!vendorToOwnAccountId.has(tr.bankAccount)) {
                log.warn('Ignoring orphan transaction:\n', tr);
                continue;
            }
            tr.accountId = vendorToOwnAccountId.get(tr.bankAccount);
        }
        // Remove bankAccount as the transaction is now linked to account with accountId prop.
        delete tr.bankAccount;
        const categoryId = tr.categoryId;
        if (typeof categoryId !== 'undefined' && categoryId !== null) {
            if (typeof categoryMap[categoryId] === 'undefined') {
                log.warn('Unknown category, unsetting for transaction:\n', tr);
            }
            tr.categoryId = categoryMap[categoryId];
        }
        // Set transaction type base on transactionId.
        // (Maintain 'operation' in name, as it's a deprecated field.)
        if (typeof tr.operationTypeID !== 'undefined') {
            const key = tr.operationTypeID.toString();
            if (importedTypesMap.has(key)) {
                tr.type = importedTypesMap.get(key);
            }
            else {
                tr.type = helpers_1.UNKNOWN_TRANSACTION_TYPE;
            }
            delete tr.operationTypeID;
        }
        // If there is no import date, set it to now.
        if (tr.importDate === null) {
            tr.importDate = new Date();
        }
        // If there is no label use the rawLabel, and vice-versa.
        if (typeof tr.label === 'undefined') {
            tr.label = tr.rawLabel;
        }
        if (typeof tr.rawLabel === 'undefined') {
            tr.rawLabel = tr.label;
        }
        if (typeof tr.label === 'undefined' && typeof tr.rawLabel === 'undefined') {
            log.warn('Ignoring transaction without label/rawLabel:\n', tr);
            continue;
        }
        // Consider that old imports have the type set by the user, to have a consistent behaviour
        // with the migration.
        if (typeof tr.isUserDefinedType === 'undefined') {
            tr.isUserDefinedType = true;
        }
        // Remove contents of deprecated fields, if there were any.
        delete tr.attachments;
        delete tr.binary;
        delete tr.id;
        delete tr.userId;
        // Add the transaction to its account group.
        const accountGroup = newByAccountId.get(tr.accountId) || [];
        accountGroup.push(tr);
        newByAccountId.set(tr.accountId, accountGroup);
    }
    for (const [accountId, provided] of newByAccountId) {
        const known = await models_1.Transaction.byAccount(userId, accountId);
        const diffResult = (0, diff_transactions_1.default)(known, provided);
        // Ignore perfect matches and knownOrphans. Only import the "provider" (import) orphans
        // and the duplicate candidates, since we're not too sure about those.
        const transactions = diffResult.providerOrphans;
        const candidates = diffResult.duplicateCandidates.map(pair => pair[1]);
        transactions.push(...candidates);
        if (transactions.length > 0) {
            log.info(`Importing ${transactions.length} transactions for account ${accountId}.`);
            await models_1.Transaction.bulkCreate(userId, transactions);
        }
        else {
            log.info(`No transactions to import for account ${accountId}.`);
        }
    }
    log.info('Done.');
    log.info('Import settings...');
    for (const setting of world.settings) {
        if (instance_1.ConfigGhostSettings.has(setting.key)) {
            continue;
        }
        // Reset the default account id, if it's set.
        if (setting.key === settings_1.DEFAULT_ACCOUNT_ID &&
            setting.value !== default_settings_1.default.get(settings_1.DEFAULT_ACCOUNT_ID)) {
            const settingAsNumber = Number.parseInt(setting.value, 10);
            if (!accountIdToAccount.has(settingAsNumber)) {
                log.warn(`unknown default account id: ${setting.value}, skipping.`);
                continue;
            }
            setting.value = accountIdToAccount.get(settingAsNumber);
            await models_1.Setting.updateByKey(userId, settings_1.DEFAULT_ACCOUNT_ID, setting.value);
            continue;
        }
        // Overwrite the previous value of the demo-mode, if it was set.
        if (setting.key === settings_1.DEMO_MODE && setting.value === 'true') {
            const found = await models_1.Setting.byKey(userId, settings_1.DEMO_MODE);
            if (found && found.value !== 'true') {
                await models_1.Setting.updateByKey(userId, settings_1.DEMO_MODE, 'true');
                continue;
            }
        }
        delete setting.userId;
        // Note that former existing values are not overwritten!
        await models_1.Setting.findOrCreateByKey(userId, setting.key, setting.value);
    }
    log.info('Done.');
    log.info('Import alerts...');
    const existingAlerts = await models_1.Alert.all(userId);
    for (const a of world.alerts) {
        // Map alert to account.
        if (typeof a.accountId !== 'undefined') {
            if (!accountIdToAccount.has(a.accountId)) {
                log.warn('Ignoring orphan alert:\n', a);
                continue;
            }
            a.accountId = accountIdToAccount.get(a.accountId);
        }
        else {
            if (!vendorToOwnAccountId.has(a.bankAccount)) {
                log.warn('Ignoring orphan alert:\n', a);
                continue;
            }
            a.accountId = vendorToOwnAccountId.get(a.bankAccount);
        }
        // Don't reimport an existing similar alert.
        let foundDuplicate = false;
        for (const known of existingAlerts) {
            if (known.accountId === a.accountId &&
                known.type === a.type &&
                known.frequency === a.frequency &&
                known.limit === a.limit &&
                known.order === a.order) {
                foundDuplicate = true;
                break;
            }
        }
        if (foundDuplicate) {
            continue;
        }
        // Remove bankAccount as the alert is now linked to account with accountId prop.
        delete a.bankAccount;
        delete a.id;
        delete a.userId;
        await models_1.Alert.create(userId, a);
    }
    log.info('Done.');
    log.info('Import transaction rules...');
    const existingRules = new Set((await models_1.TransactionRule.allOrdered(userId)).map(r => models_1.TransactionRule.easyHash(r)));
    for (const r of world.transactionRules) {
        // Clean up actions: they must refer to existing entities.
        const removeActions = [];
        let i = 0;
        for (const a of r.actions) {
            if (typeof a.categoryId === 'undefined' ||
                typeof categoryMap[a.categoryId] === 'undefined') {
                log.warn('Ignoring unknown category action.');
                removeActions.push(i);
            }
            else {
                a.categoryId = categoryMap[a.categoryId];
            }
            i += 1;
        }
        removeActions.reverse();
        for (const j of removeActions) {
            r.actions.splice(j, 1);
        }
        for (const a of r.actions) {
            delete a.ruleId;
            delete a.id;
            // Manually fill the user id. Note this may clobber the previous
            // one, if it was existing, which is fine: we should not rely on
            // those in general.
            a.userId = userId;
        }
        for (const c of r.conditions) {
            delete c.ruleId;
            delete c.id;
            // See above.
            c.userId = userId;
        }
        if (r.actions.length === 0) {
            log.warn('Ignoring rule with no actions.');
            return;
        }
        if (r.conditions.length === 0) {
            log.warn('Ignoring rule with no conditions.');
            return;
        }
        delete r.id;
        delete r.userId;
        if (!existingRules.has(models_1.TransactionRule.easyHash(r))) {
            await models_1.TransactionRule.create(userId, r);
        }
    }
    log.info('Done.');
    log.info('Import recurring transactions...');
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const recurringTransactionsMap = new Map();
    const existingRecurringTransactionsHashMap = new Map();
    const existingRecurringTransactions = await models_1.RecurringTransaction.all(userId);
    existingRecurringTransactions.forEach(rt => {
        existingRecurringTransactionsHashMap.set(models_1.RecurringTransaction.easyHash(rt), rt.id);
    });
    for (let i = 0; i < world.recurringTransactions.length; i++) {
        const rt = world.recurringTransactions[i];
        if (typeof rt.amount !== 'number' || isNaN(rt.amount)) {
            log.warn('Ignoring recurring transactions without valid amount\n', rt);
            continue;
        }
        // Map recurring transaction to account.
        if (typeof rt.accountId !== 'undefined') {
            if (!accountIdToAccount.has(rt.accountId)) {
                log.warn('Ignoring orphan recurring transaction:\n', rt);
                continue;
            }
            rt.accountId = accountIdToAccount.get(rt.accountId);
        }
        if (typeof rt.label === 'undefined') {
            log.warn('Ignoring recurring transaction without label/rawLabel:\n', rt);
            continue;
        }
        const hash = models_1.RecurringTransaction.easyHash(rt);
        const exists = existingRecurringTransactionsHashMap.has(hash);
        if (exists) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            recurringTransactionsMap.set(rt.id, existingRecurringTransactionsHashMap.get(hash));
        }
        else {
            const created = await models_1.RecurringTransaction.create(userId, rt);
            recurringTransactionsMap.set(rt.id, created.id);
        }
    }
    for (let i = 0; i < world.appliedRecurringTransactions.length; i++) {
        const art = world.appliedRecurringTransactions[i];
        // Only import applied recurring transactions from current month.
        if (art.year !== currentYear || art.month !== currentMonth) {
            continue;
        }
        if (!accountIdToAccount.has(art.accountId) ||
            !recurringTransactionsMap.has(art.recurringTransactionId)) {
            log.warn('Ignoring orphan applied recurring transaction:\n', art);
            continue;
        }
        art.accountId = accountIdToAccount.get(art.accountId);
        art.recurringTransactionId = recurringTransactionsMap.get(art.recurringTransactionId);
        const exists = await models_1.AppliedRecurringTransaction.exists(userId, art.accountId, art.recurringTransactionId, art.month, art.year);
        if (!exists) {
            await models_1.AppliedRecurringTransaction.create(userId, art);
        }
    }
    log.info('Done.');
    log.info('Apply banks migrations');
    await (0, data_migrations_1.default)(userId);
    log.info('Done.');
}
async function import_(req, res) {
    try {
        const { id: userId } = req.user;
        if (await (0, instance_2.isDemoEnabled)(userId)) {
            throw new helpers_1.KError("importing accesses isn't allowed in demo mode", 400);
        }
        if (!req.body.data) {
            throw new helpers_1.KError('missing parameter "data" in the file', 400);
        }
        let world = req.body.data;
        if (req.body.encrypted) {
            if (typeof req.body.data !== 'string') {
                throw new helpers_1.KError('content of an encrypted export should be an encoded string', 400);
            }
            if (typeof req.body.passphrase !== 'string') {
                throw new helpers_1.KError('missing parameter "passphrase"', 400);
            }
            if (process.kresus.salt === null) {
                throw new helpers_1.KError("server hasn't been configured for encryption; " +
                    'please ask your administrator to provide a salt');
            }
            world = decryptData(world, req.body.passphrase);
            try {
                world = JSON.parse(world);
            }
            catch (err) {
                throw new helpers_1.KError('Invalid JSON file or bad passphrase.', 400, (0, helpers_1.getErrorCode)('INVALID_PASSWORD_JSON_EXPORT'));
            }
        }
        else if (typeof req.body.data !== 'object') {
            throw new helpers_1.KError('content of a JSON export should be a JSON object', 400);
        }
        await importData(userId, world);
        log.info('Import finished with success!');
        res.status(200).end();
    }
    catch (err) {
        (0, helpers_1.asyncErr)(res, err, 'when importing data');
    }
}
async function importOFX_(req, res) {
    try {
        const { id: userId } = req.user;
        log.info('Parsing OFX file...');
        const userData = JSON.parse(req.body);
        const convertedData = await (0, ofx_1.ofxToKresus)(userData.data);
        let dontCreateAccess = false;
        // Set the accessId set by the user.
        if (typeof userData.accessId === 'number' && convertedData) {
            // Make sure the access exists.
            if (!models_1.Access.exists(userId, userData.accessId)) {
                throw new helpers_1.KError('No existing access for this access id', 400);
            }
            // Replace the accessId in the converted data by this one.
            convertedData.accesses[0].id = userData.accessId;
            convertedData.accounts.forEach(acc => (acc.accessId = userData.accessId));
            dontCreateAccess = true;
        }
        await importData(userId, convertedData, dontCreateAccess);
        log.info('Import finished with success!');
        res.status(200).end();
    }
    catch (err) {
        (0, helpers_1.asyncErr)(res, err, 'when importing data');
    }
}
exports.testing = {
    ofxToKresus: ofx_1.ofxToKresus,
    encryptData,
    decryptData,
    getAllData,
};
