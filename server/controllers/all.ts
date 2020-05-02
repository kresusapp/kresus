import express from 'express';
import crypto from 'crypto';

import { Access, Account, Alert, Budget, Category, Setting, Transaction } from '../models';

import runDataMigrations from '../models/data-migrations';

import {
    assert,
    makeLogger,
    isEmailEnabled,
    KError,
    asyncErr,
    getErrorCode,
    UNKNOWN_OPERATION_TYPE,
    isAppriseApiEnabled,
} from '../helpers';

import { ConfigGhostSettings } from '../lib/ghost-settings';
import { validatePassword } from '../shared/helpers';
import DefaultSettings from '../shared/default-settings';

import { cleanData, Remapping } from './helpers';
import { isDemoEnabled } from './settings';
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
    enabled?: boolean;
    fields: { name: string; value: string }[];
    password?: string | null;
    session?: string | null;
}

interface AllData {
    accounts: Account[];
    accesses: ClientAccess[];
    alerts: Alert[];
    categories: Category[];
    operations: Transaction[];
    settings: Setting[];
    budgets?: Budget[];
}

async function getAllData(userId: number, options: GetAllDataOptions = {}) {
    const { isExport = false, cleanPassword = true } = options;

    const ret: AllData = {
        accounts: [],
        accesses: [],
        alerts: [],
        categories: [],
        operations: [],
        settings: [],
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

        ret.accesses.push(clientAccess);
    }

    ret.accounts = await Account.all(userId);
    ret.categories = await Category.all(userId);
    ret.operations = await Transaction.all(userId);
    ret.settings = isExport ? await Setting.allWithoutGhost(userId) : await Setting.all(userId);

    if (isExport) {
        ret.budgets = await Budget.all(userId);
    }

    if (isExport || isEmailEnabled() || isAppriseApiEnabled()) {
        ret.alerts = await Alert.all(userId);
    } else {
        ret.alerts = [];
    }

    return ret;
}

export async function all(req: IdentifiedRequest<any>, res: express.Response) {
    try {
        const { id: userId } = req.user;
        const ret = await getAllData(userId);
        res.status(200).json(ret);
    } catch (err) {
        err.code = ERR_MSG_LOADING_ALL;
        asyncErr(res, err, 'when loading all data');
    }
}

const ENCRYPTION_ALGORITHM = 'aes-256-ctr';
const ENCRYPTED_CONTENT_TAG = Buffer.from('KRE');

function encryptData(data: object, passphrase: string) {
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
            if (typeof req.body.passphrase !== 'string' || req.body.passphrase === null) {
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

        let data = await getAllData(userId, { isExport: true, cleanPassword: !passphrase });
        data = cleanData(data);

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

export async function importData(userId: number, world: any) {
    world.accesses = (world.accesses || []).map(applyRenamings(Access));
    world.accounts = (world.accounts || []).map(applyRenamings(Account));
    world.alerts = (world.alerts || []).map(applyRenamings(Alert));
    world.budgets = (world.budgets || []).map(applyRenamings(Budget));
    world.categories = (world.categories || []).map(applyRenamings(Category));
    world.operations = (world.operations || []).map(applyRenamings(Transaction));
    world.settings = (world.settings || []).map(applyRenamings(Setting));

    // Static data.
    world.operationtypes = world.operationtypes || [];

    // Importing only known settings prevents assertion errors in the client when
    // importing Kresus data in an older version of kresus.
    world.settings = world.settings.filter((s: any) => DefaultSettings.has(s.key)) || [];

    log.info(`Importing:
        accesses:        ${world.accesses.length}
        accounts:        ${world.accounts.length}
        alerts:          ${world.alerts.length}
        budgets:         ${world.budgets.length}
        categories:      ${world.categories.length}
        operation-types: ${world.operationtypes.length}
        settings:        ${world.settings.length}
        operations:      ${world.operations.length}
    `);

    log.info('Import accesses...');
    const accessMap: Remapping = {};
    for (const access of world.accesses) {
        const accessId = access.id;
        delete access.id;

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

        const created = await Access.create(userId, access);

        accessMap[accessId] = created.id;
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

        // For an initial import which does not come from Kresus (ex: a
        // handmade JSON file), there might be no lastCheckDate.
        account.lastCheckDate = parseDate(account.lastCheckDate);
        if (account.lastCheckDate === null) {
            let latestOpDate: Date | null = null;
            if (world.operations) {
                const accountOps = world.operations.filter((op: any) => op.accountId === accountId);
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
            await Budget.create(userId, importedBudget);
        }
    }
    log.info('Done.');

    // No need to import operation types.

    // importedTypesMap is used to set type to imported operations (backward compatibility).
    const importedTypes = world.operationtypes || [];
    const importedTypesMap = new Map();
    for (const type of importedTypes) {
        importedTypesMap.set(type.id.toString(), type.name);
    }

    log.info('Import transactions...');
    const skipTransactions: number[] = [];
    for (let i = 0; i < world.operations.length; i++) {
        const op = world.operations[i];

        op.date = parseDate(op.date);
        op.debitDate = parseDate(op.debitDate);
        op.importDate = parseDate(op.importDate);

        if (op.date === null) {
            log.warn('Ignoring operation without date\n', op);
            skipTransactions.push(i);
            continue;
        }

        if (typeof op.amount !== 'number' || isNaN(op.amount)) {
            log.warn('Ignoring operation without valid amount\n', op);
            skipTransactions.push(i);
            continue;
        }

        // Map operation to account.
        if (typeof op.accountId !== 'undefined') {
            if (!accountIdToAccount.has(op.accountId)) {
                log.warn('Ignoring orphan operation:\n', op);
                skipTransactions.push(i);
                continue;
            }
            op.accountId = accountIdToAccount.get(op.accountId);
        } else {
            if (!vendorToOwnAccountId.has(op.bankAccount)) {
                log.warn('Ignoring orphan operation:\n', op);
                skipTransactions.push(i);
                continue;
            }
            op.accountId = vendorToOwnAccountId.get(op.bankAccount);
        }

        // Remove bankAccount as the operation is now linked to account with accountId prop.
        delete op.bankAccount;

        const categoryId = op.categoryId;
        if (typeof categoryId !== 'undefined' && categoryId !== null) {
            if (typeof categoryMap[categoryId] === 'undefined') {
                log.warn('Unknown category, unsetting for operation:\n', op);
            }
            op.categoryId = categoryMap[categoryId];
        }

        // Set operation type base on operationId.
        if (typeof op.operationTypeID !== 'undefined') {
            const key = op.operationTypeID.toString();
            if (importedTypesMap.has(key)) {
                op.type = importedTypesMap.get(key);
            } else {
                op.type = UNKNOWN_OPERATION_TYPE;
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
    }
    if (skipTransactions.length) {
        for (let i = skipTransactions.length - 1; i >= 0; i--) {
            world.operations.splice(skipTransactions[i], 1);
        }
    }
    await Transaction.bulkCreate(userId, world.operations);
    log.info('Done.');

    log.info('Import settings...');
    for (const setting of world.settings) {
        if (ConfigGhostSettings.has(setting.key) || setting.key === 'migration-version') {
            continue;
        }

        // Reset the default account id, if it's set.
        if (
            setting.key === 'default-account-id' &&
            setting.value !== DefaultSettings.get('default-account-id')
        ) {
            if (!accountIdToAccount.has(setting.value)) {
                log.warn(`unknown default account id: ${setting.value}, skipping.`);
                continue;
            }
            setting.value = accountIdToAccount.get(setting.value);

            await Setting.updateByKey(userId, 'default-account-id', setting.value);
            continue;
        }

        // Overwrite the previous value of the demo-mode, if it was set.
        if (setting.key === 'demo-mode' && setting.value === 'true') {
            const found = await Setting.byKey(userId, 'demo-mode');
            if (found && found.value !== 'true') {
                await Setting.updateByKey(userId, 'demo-mode', 'true');
                continue;
            }
        }

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
        await Alert.create(userId, a);
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

        await importData(userId, ofxToKresus(req.body));

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
