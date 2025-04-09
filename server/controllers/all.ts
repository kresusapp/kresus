import express from 'express';
import crypto from 'crypto';

import {
    Access,
    Account,
    Alert,
    Budget,
    Category,
    RecurringTransaction,
    Setting,
    Transaction,
    TransactionRule,
    AppliedRecurringTransaction,
    View,
    User,
} from '../models';

import runDataMigrations from '../models/data-migrations';

import {
    assert,
    makeLogger,
    isEmailEnabled,
    KError,
    asyncErr,
    getErrorCode,
    UNKNOWN_TRANSACTION_TYPE,
    isAppriseApiEnabled,
    unwrap,
} from '../helpers';

import { bankVendorByUuid } from '../lib/bank-vendors';
import {
    InstancePropertiesType,
    getAll as getAllInstanceProperties,
    ConfigGhostSettings,
} from '../lib/instance';
import { validatePassword } from '../shared/helpers';
import DefaultSettings from '../shared/default-settings';
import { DEFAULT_ACCOUNT_ID, DEMO_MODE } from '../../shared/settings';

import { cleanData, Remapping } from './helpers';
import { isDemoEnabled } from './instance';
import { ofxToKresus } from './ofx';
import { IdentifiedRequest } from './routes';
import diffAccount from '../lib/diff-accounts';
import diffTransactions from '../lib/diff-transactions';

const log = makeLogger('controllers/all');

const ERR_MSG_LOADING_ALL = 'Error when loading all Kresus data';

interface GetAllDataOptions {
    isExport?: boolean;
    cleanPassword?: boolean;
}

// FIXME also contains all the fields from Access.
interface ClientAccess {
    vendorId: string;
    enabled?: boolean;
    fields: { name: string; value: string }[];
    password?: string | null;
    session?: string | null;
    customLabel: string | null;
    label?: string | null;
}

type AllData = {
    accounts: Account[];
    accesses: ClientAccess[];
    alerts: Alert[];
    categories: Category[];
    transactions: Transaction[];
    settings: Setting[];
    instance: InstancePropertiesType;
    // For exports only.
    budgets?: Budget[];
    transactionRules?: TransactionRule[];
    recurringTransactions?: RecurringTransaction[];
    appliedRecurringTransactions?: AppliedRecurringTransaction[];
    views: View[];
    user?: User;
};

type StartupTask = () => Promise<void>;
type UserId = number;

// Startup tasks are cleanup tasks that will be run the next time a user will run the /all initial
// request.
const STARTUP_TASKS: Record<UserId, StartupTask[]> = {};

// Registers a new startup task for the given user.
export function registerStartupTask(userId: UserId, f: StartupTask) {
    STARTUP_TASKS[userId] = STARTUP_TASKS[userId] || [];
    STARTUP_TASKS[userId].push(f);
}

// Run startup tasks for the user, if any.
async function runStartupTasks(userId: number) {
    if (STARTUP_TASKS[userId]) {
        while (STARTUP_TASKS[userId].length) {
            const task = unwrap(STARTUP_TASKS[userId].pop());
            await task();
        }
    }
}

async function getAllData(userId: number, options: GetAllDataOptions = {}): Promise<AllData> {
    const { isExport = false, cleanPassword = true } = options;

    let ret: AllData = {
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

    const accesses = await Access.all(userId);
    for (const access of accesses) {
        const clientAccess: ClientAccess = { ...access };

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

        const bank = bankVendorByUuid(clientAccess.vendorId);
        if (bank && bank.name) {
            clientAccess.label = bank.name;
        }

        ret.accesses.push(clientAccess);
    }

    ret.accounts = await Account.all(userId);
    ret.categories = await Category.all(userId);
    ret.transactions = await Transaction.all(userId);
    ret.settings = await Setting.all(userId);
    ret.recurringTransactions = await RecurringTransaction.all(userId);
    ret.views = await View.all(userId);

    if (isExport) {
        ret.budgets = await Budget.all(userId);

        // This fetches the associated conditions and actions data, so no need
        // to join explicitly here.
        ret.transactionRules = await TransactionRule.allOrdered(userId);

        // We only need to export the applied recurring transactions from the current month since
        // the recurring transactions won't be created for the past at next poll.
        const now = new Date();
        ret.appliedRecurringTransactions = await AppliedRecurringTransaction.byMonthAndYear(
            userId,
            now.getMonth(),
            now.getFullYear()
        );
    } else {
        ret.instance = await getAllInstanceProperties();

        const user = await User.find(userId);
        if (user) {
            ret.user = user;
        }
    }

    if (isExport || isEmailEnabled() || isAppriseApiEnabled()) {
        ret.alerts = await Alert.all(userId);
    } else {
        ret.alerts = [];
    }

    if (isExport) {
        ret = cleanData(ret);
    }

    return ret;
}

export async function all(req: IdentifiedRequest<any>, res: express.Response) {
    try {
        const { id: userId } = req.user;
        await runStartupTasks(userId);
        const ret = await getAllData(userId);
        res.status(200).json(ret);
    } catch (err) {
        err.code = ERR_MSG_LOADING_ALL;
        asyncErr(res, err, 'when loading all data');
    }
}

const ENCRYPTION_ALGORITHM = 'aes-256-ctr';
const ENCRYPTED_CONTENT_TAG = Buffer.from('KRE');

function encryptData(data: Record<string, unknown>, passphrase: string) {
    assert(process.kresus.salt !== null, 'must have provided a salt');

    const initVector = crypto.randomBytes(16);
    const key = crypto.pbkdf2Sync(passphrase, process.kresus.salt, 100000, 32, 'sha512');
    const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, key, initVector);

    return Buffer.concat([
        initVector,
        ENCRYPTED_CONTENT_TAG,
        cipher.update(JSON.stringify(data)),
        cipher.final(),
    ]).toString('base64');
}

function decryptData(data: string, passphrase: string) {
    assert(process.kresus.salt !== null, 'must have provided a salt');

    const rawData = Buffer.from(data, 'base64');
    const [initVector, tag, encrypted] = [
        rawData.slice(0, 16),
        rawData.slice(16, 16 + 3),
        rawData.slice(16 + 3),
    ];

    if (tag.toString() !== ENCRYPTED_CONTENT_TAG.toString()) {
        throw new KError(
            'submitted file is not a valid kresus encrypted file',
            400,
            getErrorCode('INVALID_ENCRYPTED_EXPORT')
        );
    }

    const key = crypto.pbkdf2Sync(passphrase, process.kresus.salt, 100000, 32, 'sha512');

    const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, key, initVector);
    return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString();
}

export async function export_(req: IdentifiedRequest<any>, res: express.Response) {
    try {
        const { id: userId } = req.user;

        let passphrase: string | null = null;
        if (req.body.encrypted) {
            if (typeof req.body.passphrase !== 'string' || !req.body.passphrase) {
                throw new KError('missing parameter "passphrase"', 400);
            }

            if (process.kresus.salt === null) {
                throw new KError(
                    "server hasn't been configured for encryption; " +
                        'please ask your administrator to provide a salt'
                );
            }

            passphrase = req.body.passphrase;
            assert(passphrase !== null, 'passphrase must be set here');

            // Check password strength
            if (!validatePassword(passphrase)) {
                throw new KError('submitted passphrase is too weak', 400);
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
        } else {
            ret = {
                encrypted: false,
                data,
            };
        }

        res.status(200).json(ret);
    } catch (err) {
        err.code = ERR_MSG_LOADING_ALL;
        asyncErr(res, err, 'when exporting data');
    }
}

type AnyObject = { [key: string]: AnyObject } | any;

function applyRenamings(model: any): (arg: AnyObject) => AnyObject {
    if (typeof model.renamings === 'undefined') {
        return obj => obj;
    }
    return (obj: AnyObject): AnyObject => {
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

export function parseDate(date: any) {
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

type AccessRemapping = {
    [key: number]: {
        // Remapped ID of the Kresus access in our database.
        id: number;
        // Was the access known, i.e. it exists in Kresus' database?
        wasKnown: boolean;
        // Optional vendor id of the access.
        vendorId?: string;
    };
};

// Import the given data from the `world` object, created by interpreting the JSON created from a
// call to `export_()` in this same file.
//
// If `dontCreateAccess` is true, it is assumed that the access id refers to a valid access that is
// known in the database. Otherwise, then the access is created.
//
// Note: destroy the input `world` argument by changing its fields in place.
export async function importData(userId: number, world: any, dontCreateAccess?: boolean) {
    world.accesses = (world.accesses || []).map(applyRenamings(Access));
    world.accounts = (world.accounts || []).map(applyRenamings(Account));
    world.alerts = (world.alerts || []).map(applyRenamings(Alert));
    world.budgets = (world.budgets || []).map(applyRenamings(Budget));
    world.categories = (world.categories || []).map(applyRenamings(Category));
    // Keep backward compat with 'operations'.
    world.transactions = (world.transactions || world.operations || []).map(
        applyRenamings(Transaction)
    );
    world.settings = (world.settings || []).map(applyRenamings(Setting));
    world.transactionRules = world.transactionRules || [];
    world.recurringTransactions = world.recurringTransactions || [];
    world.appliedRecurringTransactions = world.appliedRecurringTransactions || [];
    world.views = world.views || [];

    // Static data.
    // Keep backward compat with 'operationtypes'.
    world.transactiontypes = world.transactiontypes || world.operationtypes || [];

    // Importing only known settings prevents assertion errors in the client when
    // importing Kresus data in an older version of kresus.
    world.settings = world.settings.filter((s: any) => DefaultSettings.has(s.key)) || [];

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
    const accessMap: AccessRemapping = {};
    for (const access of world.accesses) {
        const accessId = access.id;
        delete access.id;
        delete access.userId;

        // Try to match the vendor id and login against an existing pair in the database.
        const foundKnown: Access | null = await Access.byCredentials(userId, {
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
            log.info(
                `Ignoring import of access ${access.vendorId} (${access.login}) as it already exists.`
            );
            continue;
        }

        const sanitizedCustomFields: { name: string; value: string }[] = [];

        // Support legacy "customFields" value.
        if (typeof access.customFields === 'string' && !access.fields) {
            try {
                access.fields = JSON.parse(access.customFields);
            } catch (e) {
                log.error('Invalid JSON customFields, ignoring fields:', e.toString());
            }
        }

        for (const { name, value } of access.fields || []) {
            if (typeof name !== 'string') {
                log.warn('Ignoring customField because of non-string "name" property.');
                continue;
            }
            if (typeof value !== 'string') {
                log.warn(
                    `Ignoring custom field for key ${name} because of non-string "value" property`
                );
                continue;
            }
            sanitizedCustomFields.push({ name, value });
        }

        access.fields = sanitizedCustomFields;

        if (dontCreateAccess) {
            // The access id given from the `world` object is valid, according to this function's
            // contract, so the mapping doesn't need to redirect to another access we created.
            accessMap[accessId] = { id: accessId, wasKnown: true };
            log.info(
                `Not creating new known access ${access.vendorId} (${access.login}) because it's explicitly marked as known.`
            );
        } else {
            const created = await Access.create(userId, access);
            accessMap[accessId] = { id: created.id, wasKnown: false };
            log.info(`Creating new unknown access ${access.vendorId} (${access.login}).`);
        }
    }
    log.info('Done.');

    log.info('Import accounts...');
    const accountIdToAccount: Map<number, number> = new Map();
    const vendorToOwnAccountId: Map<string, number> = new Map();
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
            let latestOpDate: Date | null = null;
            if (world.transactions) {
                const accountOps = world.transactions.filter(
                    (op: any) => op.accountId === accountId
                );
                for (const op of accountOps) {
                    const opDate = parseDate(op.date);
                    if (opDate !== null && (latestOpDate === null || opDate > latestOpDate)) {
                        latestOpDate = opDate;
                    }
                }
            }
            account.lastCheckDate = latestOpDate || new Date();
        }

        // If the access containing this account was known, then try to match this account against
        // one known in the database.
        const accessRemap = accessMap[account.accessId];
        account.accessId = accessRemap?.id;

        if (accessRemap?.wasKnown) {
            const knownAccounts = await Account.byAccess(userId, { id: accessRemap.id });
            if (typeof knownAccounts !== 'undefined') {
                const vendorId = accessRemap.vendorId ?? undefined;

                const diffResult = diffAccount(knownAccounts, [account], vendorId);

                // There can be at most one perfect match, since we provided only one account.
                if (diffResult.perfectMatches.length === 1) {
                    const firstMatchPair = diffResult.perfectMatches[0];
                    const knownAccount = firstMatchPair[0];

                    // The account was found as a perfect match: do not import it, and reuse it
                    // instead.
                    accountIdToAccount.set(accountId, knownAccount.id);
                    vendorToOwnAccountId.set(account.vendorAccountId, knownAccount.id);

                    log.info(
                        `Ignoring import of account ${account.label} (${account.vendorAccountId}) as it already exists.`
                    );

                    continue;
                }
            }
        }

        log.info(`Importing new unknown account ${account.label} (${account.vendorAccountId}).`);
        const created = await Account.create(userId, account);
        accountIdToAccount.set(accountId, created.id);
        vendorToOwnAccountId.set(created.vendorAccountId, created.id);
    }
    log.info('Done.');

    log.info('Import views...');
    const viewsMap: Remapping = {};
    for (const view of world.views) {
        const viewId = view.id;
        delete view.id;

        if (!view.createdByUser) {
            log.warn('Ignoring view not created by user:\n', view);
            continue;
        }

        const viewAccounts = [];
        for (const viewAcc of view.accounts) {
            if (
                typeof viewAcc.accountId !== 'undefined' &&
                accountIdToAccount.has(viewAcc.accountId)
            ) {
                viewAcc.accountId = accountIdToAccount.get(viewAcc.accountId);
                viewAccounts.push(viewAcc);
            } else {
                log.warn('Ignoring account in view:\n', view);
            }
        }

        if (viewAccounts.length === 0) {
            log.warn('Ignoring view without accounts:\n', view);
            continue;
        }

        const created = await View.create(userId, Object.assign(view, { accounts: viewAccounts }));
        viewsMap[viewId] = created.id;
    }
    log.info('Done.');

    log.info('Import categories...');
    const existingCategories = await Category.all(userId);
    const existingCategoriesMap = new Map();
    for (const category of existingCategories) {
        existingCategoriesMap.set(category.label, category);
    }

    const categoryMap: Remapping = {};
    for (const category of world.categories) {
        const catId = category.id;
        delete category.id;
        delete category.userId;
        if (existingCategoriesMap.has(category.label)) {
            const existing = existingCategoriesMap.get(category.label);
            categoryMap[catId] = existing.id;
        } else {
            const created = await Category.create(userId, category);
            categoryMap[catId] = created.id;
        }
    }
    log.info('Done.');

    log.info('Import budgets...');
    const makeBudgetKey = (b: Budget) => `${b.categoryId}-${b.year}-${b.month}`;

    const existingBudgets = await Budget.all(userId);
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
            if (
                !existingBudget.threshold ||
                existingBudget.threshold !== importedBudget.threshold
            ) {
                await Budget.update(userId, existingBudget.id, {
                    threshold: importedBudget.threshold,
                });
            }
        } else {
            delete importedBudget.id;
            delete importedBudget.userId;
            const newBudget = await Budget.create(userId, importedBudget);

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
    const newByAccountId: Map<number, any[]> = new Map();
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
        } else {
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
            } else {
                tr.type = UNKNOWN_TRANSACTION_TYPE;
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
        const known = await Transaction.byAccount(userId, accountId);

        const diffResult = diffTransactions(known, provided as Partial<Transaction>[]);

        // Ignore perfect matches and knownOrphans. Only import the "provider" (import) orphans
        // and the duplicate candidates, since we're not too sure about those.
        const transactions = diffResult.providerOrphans;
        const candidates = diffResult.duplicateCandidates.map(pair => pair[1]);
        transactions.push(...candidates);

        if (transactions.length > 0) {
            log.info(`Importing ${transactions.length} transactions for account ${accountId}.`);
            await Transaction.bulkCreate(userId, transactions);
        } else {
            log.info(`No transactions to import for account ${accountId}.`);
        }
    }

    log.info('Done.');

    log.info('Import settings...');
    for (const setting of world.settings) {
        if (ConfigGhostSettings.has(setting.key)) {
            continue;
        }

        // Reset the default account id, if it's set.
        if (
            setting.key === DEFAULT_ACCOUNT_ID &&
            setting.value !== DefaultSettings.get(DEFAULT_ACCOUNT_ID)
        ) {
            const settingAsNumber = Number.parseInt(setting.value, 10);
            if (!accountIdToAccount.has(settingAsNumber)) {
                log.warn(`unknown default account id: ${setting.value}, skipping.`);
                continue;
            }
            setting.value = accountIdToAccount.get(settingAsNumber);

            await Setting.updateByKey(userId, DEFAULT_ACCOUNT_ID, setting.value);
            continue;
        }

        // Overwrite the previous value of the demo-mode, if it was set.
        if (setting.key === DEMO_MODE && setting.value === 'true') {
            const found = await Setting.byKey(userId, DEMO_MODE);
            if (found && found.value !== 'true') {
                await Setting.updateByKey(userId, DEMO_MODE, 'true');
                continue;
            }
        }

        delete setting.userId;

        // Note that former existing values are not overwritten!
        await Setting.findOrCreateByKey(userId, setting.key, setting.value);
    }

    log.info('Done.');

    log.info('Import alerts...');
    const existingAlerts = await Alert.all(userId);

    for (const a of world.alerts) {
        // Map alert to account.
        if (typeof a.accountId !== 'undefined') {
            if (!accountIdToAccount.has(a.accountId)) {
                log.warn('Ignoring orphan alert:\n', a);
                continue;
            }
            a.accountId = accountIdToAccount.get(a.accountId);
        } else {
            if (!vendorToOwnAccountId.has(a.bankAccount)) {
                log.warn('Ignoring orphan alert:\n', a);
                continue;
            }
            a.accountId = vendorToOwnAccountId.get(a.bankAccount);
        }

        // Don't reimport an existing similar alert.
        let foundDuplicate = false;
        for (const known of existingAlerts) {
            if (
                known.accountId === a.accountId &&
                known.type === a.type &&
                known.frequency === a.frequency &&
                known.limit === a.limit &&
                known.order === a.order
            ) {
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
        await Alert.create(userId, a);
    }
    log.info('Done.');

    log.info('Import transaction rules...');
    const existingRules = new Set(
        (await TransactionRule.allOrdered(userId)).map(r => TransactionRule.easyHash(r))
    );

    for (const r of world.transactionRules) {
        // Clean up actions: they must refer to existing entities.
        const removeActions = [];
        let i = 0;
        for (const a of r.actions) {
            if (
                typeof a.categoryId === 'undefined' ||
                typeof categoryMap[a.categoryId] === 'undefined'
            ) {
                log.warn('Ignoring unknown category action.');
                removeActions.push(i);
            } else {
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

        if (!existingRules.has(TransactionRule.easyHash(r))) {
            await TransactionRule.create(userId, r);
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
                continue;
            }
            rt.accountId = accountIdToAccount.get(rt.accountId);
        }

        if (typeof rt.label === 'undefined') {
            log.warn('Ignoring recurring transaction without label/rawLabel:\n', rt);
            continue;
        }

        const exists = await RecurringTransaction.exists(userId, rt.id);
        if (!exists) {
            await RecurringTransaction.create(userId, rt);
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
            continue;
        }
        art.accountId = accountIdToAccount.get(art.accountId);

        const exists = await AppliedRecurringTransaction.exists(
            userId,
            art.accountId,
            art.month,
            art.year
        );
        if (!exists) {
            await AppliedRecurringTransaction.create(userId, art);
        }
    }
    log.info('Done.');

    log.info('Apply banks migrations');
    await runDataMigrations(userId);
    log.info('Done.');
}

export async function import_(req: IdentifiedRequest<any>, res: express.Response) {
    try {
        const { id: userId } = req.user;

        if (await isDemoEnabled(userId)) {
            throw new KError("importing accesses isn't allowed in demo mode", 400);
        }

        if (!req.body.data) {
            throw new KError('missing parameter "data" in the file', 400);
        }

        let world = req.body.data;
        if (req.body.encrypted) {
            if (typeof req.body.data !== 'string') {
                throw new KError('content of an encrypted export should be an encoded string', 400);
            }
            if (typeof req.body.passphrase !== 'string') {
                throw new KError('missing parameter "passphrase"', 400);
            }

            if (process.kresus.salt === null) {
                throw new KError(
                    "server hasn't been configured for encryption; " +
                        'please ask your administrator to provide a salt'
                );
            }

            world = decryptData(world, req.body.passphrase);

            try {
                world = JSON.parse(world);
            } catch (err) {
                throw new KError(
                    'Invalid JSON file or bad passphrase.',
                    400,
                    getErrorCode('INVALID_PASSWORD_JSON_EXPORT')
                );
            }
        } else if (typeof req.body.data !== 'object') {
            throw new KError('content of a JSON export should be a JSON object', 400);
        }

        await importData(userId, world);

        log.info('Import finished with success!');
        res.status(200).end();
    } catch (err) {
        asyncErr(res, err, 'when importing data');
    }
}

export async function importOFX_(req: IdentifiedRequest<any>, res: express.Response) {
    try {
        const { id: userId } = req.user;

        log.info('Parsing OFX file...');

        const userData = JSON.parse(req.body);
        const convertedData = await ofxToKresus(userData.data);
        let dontCreateAccess = false;

        // Set the accessId set by the user.
        if (typeof userData.accessId === 'number' && convertedData) {
            // Make sure the access exists.
            if (!Access.exists(userId, userData.accessId)) {
                throw new KError('No existing access for this access id', 400);
            }

            // Replace the accessId in the converted data by this one.
            convertedData.accesses[0].id = userData.accessId;
            convertedData.accounts.forEach(acc => (acc.accessId = userData.accessId));
            dontCreateAccess = true;
        }

        await importData(userId, convertedData, dontCreateAccess);

        log.info('Import finished with success!');
        res.status(200).end();
    } catch (err) {
        asyncErr(res, err, 'when importing data');
    }
}

export const testing = {
    ofxToKresus,
    encryptData,
    decryptData,
    getAllData,
};
