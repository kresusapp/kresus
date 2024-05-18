"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testing = exports.importOFX_ = exports.import_ = exports.importData = exports.parseDate = exports.export_ = exports.all = exports.registerStartupTask = void 0;
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
exports.registerStartupTask = registerStartupTask;
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
    if (isExport) {
        ret.budgets = await models_1.Budget.all(userId);
        // This fetches the associated conditions and actions data, so no need
        // to join explicitly here.
        ret.transactionRules = await models_1.TransactionRule.allOrdered(userId);
        ret.recurringTransactions = await models_1.RecurringTransaction.all(userId);
        // We only need to export the applied recurring transactions from the current month since
        // the recurring transactions won't be created for the past at next poll.
        const now = new Date();
        ret.appliedRecurringTransactions = await models_1.AppliedRecurringTransaction.byMonthAndYear(userId, now.getMonth(), now.getFullYear());
    }
    else {
        ret.instance = await (0, instance_1.getAll)();
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
exports.all = all;
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
exports.export_ = export_;
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
exports.parseDate = parseDate;
// Note: destroy the input `world` argument by changing its fields in place.
async function importData(userId, world, inPlace) {
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
    `);
    log.info('Import accesses...');
    const accessMap = {};
    for (const access of world.accesses) {
        const accessId = access.id;
        delete access.id;
        delete access.userId;
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
        if (inPlace) {
            accessMap[accessId] = accessId;
        }
        else {
            const created = await models_1.Access.create(userId, access);
            accessMap[accessId] = created.id;
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
        delete account.id;
        delete account.userId;
        // For an initial import which does not come from Kresus (ex: a
        // handmade JSON file), there might be no lastCheckDate.
        account.lastCheckDate = parseDate(account.lastCheckDate);
        if (account.lastCheckDate === null) {
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
            account.lastCheckDate = latestOpDate || new Date();
        }
        account.accessId = accessMap[account.accessId];
        const created = await models_1.Account.create(userId, account);
        accountIdToAccount.set(accountId, created.id);
        vendorToOwnAccountId.set(created.vendorAccountId, created.id);
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
    const makeBudgetKey = (b) => `${b.categoryId}-${b.year}-${b.month}`;
    const existingBudgets = await models_1.Budget.all(userId);
    const existingBudgetsMap = new Map();
    for (const budget of existingBudgets) {
        existingBudgetsMap.set(makeBudgetKey(budget), budget);
    }
    for (const importedBudget of world.budgets) {
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
    const skipTransactions = [];
    for (let i = 0; i < world.transactions.length; i++) {
        const op = world.transactions[i];
        op.date = parseDate(op.date);
        op.debitDate = parseDate(op.debitDate);
        op.importDate = parseDate(op.importDate);
        if (op.date === null) {
            log.warn('Ignoring transaction without date\n', op);
            skipTransactions.push(i);
            continue;
        }
        if (typeof op.amount !== 'number' || isNaN(op.amount)) {
            log.warn('Ignoring transaction without valid amount\n', op);
            skipTransactions.push(i);
            continue;
        }
        // Map transaction to account.
        if (typeof op.accountId !== 'undefined') {
            if (!accountIdToAccount.has(op.accountId)) {
                log.warn('Ignoring orphan transaction:\n', op);
                skipTransactions.push(i);
                continue;
            }
            op.accountId = accountIdToAccount.get(op.accountId);
        }
        else {
            if (!vendorToOwnAccountId.has(op.bankAccount)) {
                log.warn('Ignoring orphan transaction:\n', op);
                skipTransactions.push(i);
                continue;
            }
            op.accountId = vendorToOwnAccountId.get(op.bankAccount);
        }
        // Remove bankAccount as the transaction is now linked to account with accountId prop.
        delete op.bankAccount;
        const categoryId = op.categoryId;
        if (typeof categoryId !== 'undefined' && categoryId !== null) {
            if (typeof categoryMap[categoryId] === 'undefined') {
                log.warn('Unknown category, unsetting for transaction:\n', op);
            }
            op.categoryId = categoryMap[categoryId];
        }
        // Set transaction type base on transactionId.
        // (Maintain 'operation' in name, as it's a deprecated field.)
        if (typeof op.operationTypeID !== 'undefined') {
            const key = op.operationTypeID.toString();
            if (importedTypesMap.has(key)) {
                op.type = importedTypesMap.get(key);
            }
            else {
                op.type = helpers_1.UNKNOWN_TRANSACTION_TYPE;
            }
            delete op.operationTypeID;
        }
        // If there is no import date, set it to now.
        if (op.importDate === null) {
            op.importDate = new Date();
        }
        // If there is no label use the rawLabel, and vice-versa.
        if (typeof op.label === 'undefined') {
            op.label = op.rawLabel;
        }
        if (typeof op.rawLabel === 'undefined') {
            op.rawLabel = op.label;
        }
        if (typeof op.label === 'undefined' && typeof op.rawLabel === 'undefined') {
            log.warn('Ignoring transaction without label/rawLabel:\n', op);
            skipTransactions.push(i);
            continue;
        }
        // Consider that old imports have the type set by the user, to have a consistent behaviour
        // with the migration.
        if (typeof op.isUserDefinedType === 'undefined') {
            op.isUserDefinedType = true;
        }
        // Remove contents of deprecated fields, if there were any.
        delete op.attachments;
        delete op.binary;
        delete op.id;
        delete op.userId;
    }
    if (skipTransactions.length) {
        for (let i = skipTransactions.length - 1; i >= 0; i--) {
            world.transactions.splice(skipTransactions[i], 1);
        }
    }
    await models_1.Transaction.bulkCreate(userId, world.transactions);
    log.info('Done.');
    log.info('Import settings...');
    for (const setting of world.settings) {
        if (instance_1.ConfigGhostSettings.has(setting.key)) {
            continue;
        }
        // Reset the default account id, if it's set.
        if (setting.key === settings_1.DEFAULT_ACCOUNT_ID &&
            setting.value !== default_settings_1.default.get(settings_1.DEFAULT_ACCOUNT_ID)) {
            if (!accountIdToAccount.has(setting.value)) {
                log.warn(`unknown default account id: ${setting.value}, skipping.`);
                continue;
            }
            setting.value = accountIdToAccount.get(setting.value);
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
                skipTransactions.push(i);
                continue;
            }
            rt.accountId = accountIdToAccount.get(rt.accountId);
        }
        if (typeof rt.label === 'undefined') {
            log.warn('Ignoring recurring transaction without label/rawLabel:\n', rt);
            continue;
        }
        const exists = await models_1.RecurringTransaction.exists(userId, rt.id);
        if (!exists) {
            await models_1.RecurringTransaction.create(userId, rt);
        }
    }
    for (let i = 0; i < world.appliedRecurringTransactions.length; i++) {
        const art = world.appliedRecurringTransactions[i];
        // Only import applied recurring transactions from current month.
        if (art.year !== currentYear || art.month !== currentMonth) {
            continue;
        }
        if (!accountIdToAccount.has(art.accountId)) {
            log.warn('Ignoring orphan applied recurring transaction:\n', art);
            skipTransactions.push(i);
            continue;
        }
        art.accountId = accountIdToAccount.get(art.accountId);
        const exists = await models_1.AppliedRecurringTransaction.exists(userId, art.accountId, art.month, art.year);
        if (!exists) {
            await models_1.AppliedRecurringTransaction.create(userId, art);
        }
    }
    log.info('Done.');
    log.info('Apply banks migrations');
    await (0, data_migrations_1.default)(userId);
    log.info('Done.');
}
exports.importData = importData;
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
exports.import_ = import_;
async function importOFX_(req, res) {
    try {
        const { id: userId } = req.user;
        log.info('Parsing OFX file...');
        const userData = JSON.parse(req.body);
        const convertedData = (0, ofx_1.ofxToKresus)(userData.data);
        let inPlace = false;
        // Set the accessId set by the user.
        if (typeof userData.accessId === 'number' && convertedData) {
            // Make sure the access exists.
            if (!models_1.Access.exists(userId, userData.accessId)) {
                throw new helpers_1.KError('No existing access for this access id', 400);
            }
            // Replace the accessId in the converted data by this one.
            convertedData.accesses[0].id = userData.accessId;
            convertedData.accounts.forEach(acc => (acc.accessId = userData.accessId));
            inPlace = true;
        }
        await importData(userId, convertedData, inPlace);
        log.info('Import finished with success!');
        res.status(200).end();
    }
    catch (err) {
        (0, helpers_1.asyncErr)(res, err, 'when importing data');
    }
}
exports.importOFX_ = importOFX_;
exports.testing = {
    ofxToKresus: ofx_1.ofxToKresus,
    encryptData,
    decryptData,
    getAllData,
};
