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
};

type StartupTask = () => Promise<void>;
const STARTUP_TASKS: Record<number, StartupTask[]> = {};

export function registerStartupTask(userId: number, f: StartupTask) {
    STARTUP_TASKS[userId] = STARTUP_TASKS[userId] || [];
    STARTUP_TASKS[userId].push(f);
}

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

    if (isExport) {
        ret.budgets = await Budget.all(userId);

        // This fetches the associated conditions and actions data, so no need
        // to join explicitly here.
        ret.transactionRules = await TransactionRule.allOrdered(userId);

        ret.recurringTransactions = await RecurringTransaction.all(userId);

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

// Note: destroy the input `world` argument by changing its fields in place.
export async function importData(userId: number, world: any, inPlace?: boolean) {
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
    `);

    log.info('Import accesses...');
    const accessMap: Remapping = {};
    for (const access of world.accesses) {
        const accessId = access.id;
        delete access.id;
        delete access.userId;

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

        if (inPlace) {
            accessMap[accessId] = accessId;
        } else {
            const created = await Access.create(userId, access);

            accessMap[accessId] = created.id;
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

        account.accessId = accessMap[account.accessId];
        const created = await Account.create(userId, account);

        accountIdToAccount.set(accountId, created.id);
        vendorToOwnAccountId.set(created.vendorAccountId, created.id);
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
    const skipTransactions: number[] = [];
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
        } else {
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
            } else {
                op.type = UNKNOWN_TRANSACTION_TYPE;
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
    await Transaction.bulkCreate(userId, world.transactions);
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
            if (!accountIdToAccount.has(setting.value)) {
                log.warn(`unknown default account id: ${setting.value}, skipping.`);
                continue;
            }
            setting.value = accountIdToAccount.get(setting.value);

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
                skipTransactions.push(i);
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
            skipTransactions.push(i);
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
        const convertedData = ofxToKresus(userData.data);
        let inPlace = false;

        // Set the accessId set by the user.
        if (typeof userData.accessId === 'number' && convertedData) {
            // Make sure the access exists.
            if (!Access.exists(userId, userData.accessId)) {
                throw new KError('No existing access for this access id', 400);
            }

            // Replace the accessId in the converted data by this one.
            convertedData.accesses[0].id = userData.accessId;
            convertedData.accounts.forEach(acc => (acc.accessId = userData.accessId));
            inPlace = true;
        }

        await importData(userId, convertedData, inPlace);

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
