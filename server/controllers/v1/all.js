import * as crypto from 'crypto';

import Accesses from '../../models/accesses';
import Accounts from '../../models/accounts';
import Alerts from '../../models/alerts';
import Budgets from '../../models/budgets';
import Categories from '../../models/categories';
import Settings from '../../models/settings';
import Transactions from '../../models/transactions';

import { run as runMigrations } from '../../models/migrations';
import { ConfigGhostSettings } from '../../models/static-data';

import { validatePassword } from '../../shared/helpers';
import DefaultSettings from '../../shared/default-settings';

import {
    assert,
    makeLogger,
    KError,
    asyncErr,
    getErrorCode,
    UNKNOWN_OPERATION_TYPE
} from '../../helpers';
import { cleanData } from './helpers';

let log = makeLogger('controllers/all');

const ERR_MSG_LOADING_ALL = 'Error when loading all Kresus data';

// Strip away Couchdb/pouchdb metadata.
function cleanMeta(obj) {
    delete obj._id;
    delete obj._rev;
    delete obj.docType;
    return obj;
}

async function getAllData(userId, isExport = false, cleanPassword = true) {
    let ret = {};
    ret.accounts = (await Accounts.all(userId)).map(cleanMeta);
    ret.accesses = (await Accesses.all(userId)).map(cleanMeta);

    for (let access of ret.accesses) {
        // Process enabled status only for the /all request.
        if (!isExport) {
            access.enabled = access.isEnabled();
        }

        // Just keep the name and the value of the field.
        access.fields = access.fields.map(({ name, value }) => {
            return { name, value };
        });

        if (cleanPassword) {
            delete access.password;
        }
    }

    ret.categories = (await Categories.all(userId)).map(cleanMeta);
    ret.operations = (await Transactions.all(userId)).map(cleanMeta);
    ret.settings = (isExport
        ? await Settings.allWithoutGhost(userId)
        : await Settings.all(userId)
    ).map(cleanMeta);

    if (isExport) {
        ret.budgets = (await Budgets.all(userId)).map(cleanMeta);
    }

    // Return alerts only if there is an email recipient.
    let emailRecipient = ret.settings.find(s => s.key === 'email-recipient');
    if (emailRecipient && emailRecipient.value !== DefaultSettings.get('email-recipient')) {
        ret.alerts = (await Alerts.all(userId)).map(cleanMeta);
    } else {
        ret.alerts = [];
    }

    return ret;
}

export async function all(req, res) {
    try {
        let { id: userId } = req.user;
        let ret = await getAllData(userId);
        res.status(200).json(ret);
    } catch (err) {
        err.code = ERR_MSG_LOADING_ALL;
        return asyncErr(res, err, 'when loading all data');
    }
}

const ENCRYPTION_ALGORITHM = 'aes-256-ctr';
const ENCRYPTED_CONTENT_TAG = Buffer.from('KRE');

function encryptData(data, passphrase) {
    assert(process.kresus.salt !== null, 'must have provided a salt');

    let initVector = crypto.randomBytes(16);
    let key = crypto.pbkdf2Sync(passphrase, process.kresus.salt, 100000, 32, 'sha512');
    let cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, key, initVector);

    return Buffer.concat([
        initVector,
        ENCRYPTED_CONTENT_TAG,
        cipher.update(JSON.stringify(data)),
        cipher.final()
    ]).toString('base64');
}

function decryptData(data, passphrase) {
    assert(process.kresus.salt !== null, 'must have provided a salt');

    let rawData = Buffer.from(data, 'base64');
    let [initVector, tag, encrypted] = [
        rawData.slice(0, 16),
        rawData.slice(16, 16 + 3),
        rawData.slice(16 + 3)
    ];

    if (tag.toString() !== ENCRYPTED_CONTENT_TAG.toString()) {
        throw new KError(
            'submitted file is not a valid kresus encrypted file',
            400,
            getErrorCode('INVALID_ENCRYPTED_EXPORT')
        );
    }

    let key = crypto.pbkdf2Sync(passphrase, process.kresus.salt, 100000, 32, 'sha512');

    let decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, key, initVector);
    return Buffer.concat([decipher.update(encrypted), decipher.final()]);
}

export async function export_(req, res) {
    try {
        let { id: userId } = req.user;

        let passphrase = null;
        if (req.body.encrypted) {
            if (typeof req.body.passphrase !== 'string') {
                throw new KError('missing parameter "passphrase"', 400);
            }

            if (process.kresus.salt === null) {
                throw new KError(
                    "server hasn't been configured for encryption; " +
                        'please ask your administrator to provide a salt'
                );
            }

            passphrase = req.body.passphrase;

            // Check password strength
            if (!validatePassword(passphrase)) {
                throw new KError('submitted passphrase is too weak', 400);
            }
        }

        let data = await getAllData(userId, /* isExport = */ true, !passphrase);
        data = cleanData(data);

        let ret = {};
        if (passphrase) {
            data = encryptData(data, passphrase);
            ret = {
                encrypted: true,
                data
            };
        } else {
            ret = {
                encrypted: false,
                data
            };
        }

        res.status(200).json(ret);
    } catch (err) {
        err.code = ERR_MSG_LOADING_ALL;
        return asyncErr(res, err, 'when exporting data');
    }
}

export async function importData(userId, world) {
    world.accesses = world.accesses || [];
    world.accounts = world.accounts || [];
    world.alerts = world.alerts || [];
    world.budgets = world.budgets || [];
    world.categories = world.categories || [];
    world.operationtypes = world.operationtypes || [];
    world.operations = world.operations || [];
    world.settings = world.settings || [];

    // Importing only known settings prevents assertion errors in the client when
    // importing Kresus data in an older version of kresus.
    world.settings = world.settings.filter(s => DefaultSettings.has(s.key)) || [];

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
    let accessMap = {};
    for (let access of world.accesses) {
        let accessId = access.id;
        delete access.id;

        let created = await Accesses.create(userId, access);

        accessMap[accessId] = created.id;
    }
    log.info('Done.');

    log.info('Import accounts...');
    let accountIdToAccount = new Map();
    let vendorToOwnAccountId = new Map();
    for (let account of world.accounts) {
        if (typeof accessMap[account.accessId] === 'undefined') {
            log.warn('Ignoring orphan account:\n', account);
            continue;
        }

        let accountId = account.id;
        delete account.id;

        // For an initial import which does not come from Kresus (ex: a
        // handmade JSON file), there might be no lastCheckDate.
        if (!account.lastCheckDate) {
            let latestOpDate = null;
            if (world.operations) {
                let accountOps = world.operations.filter(op => op.accountId === accountId);
                for (let op of accountOps) {
                    if (!latestOpDate || op.date > latestOpDate) {
                        latestOpDate = op.date;
                    }
                }
            }

            account.lastCheckDate = latestOpDate || new Date();
        }

        account.accessId = accessMap[account.accessId];
        let created = await Accounts.create(userId, account);

        accountIdToAccount.set(accountId, created.id);
        vendorToOwnAccountId.set(created.vendorAccountId, created.id);
    }
    log.info('Done.');

    log.info('Import categories...');
    let existingCategories = await Categories.all(userId);
    let existingCategoriesMap = new Map();
    for (let category of existingCategories) {
        existingCategoriesMap.set(category.label, category);
    }

    let categoryMap = {};
    for (let category of world.categories) {
        let catId = category.id;
        delete category.id;
        if (existingCategoriesMap.has(category.label)) {
            let existing = existingCategoriesMap.get(category.label);
            categoryMap[catId] = existing.id;
        } else {
            let created = await Categories.create(userId, category);
            categoryMap[catId] = created.id;
        }
    }
    log.info('Done.');

    log.info('Import budgets...');
    let makeBudgetKey = b => `${b.categoryId}-${b.year}-${b.month}`;

    let existingBudgets = await Budgets.all(userId);
    let existingBudgetsMap = new Map();
    for (let budget of existingBudgets) {
        existingBudgetsMap.set(makeBudgetKey(budget), budget);
    }

    for (let importedBudget of world.budgets) {
        // Note the order here: first map to the actual category id, so the
        // map lookup thereafter uses an existing category id.
        importedBudget.categoryId = categoryMap[importedBudget.categoryId];
        let existingBudget = existingBudgetsMap.get(makeBudgetKey(importedBudget));
        if (existingBudget) {
            if (
                !existingBudget.threshold ||
                existingBudget.threshold !== importedBudget.threshold
            ) {
                await Budgets.update(userId, existingBudget.id, {
                    threshold: importedBudget.threshold
                });
            }
        } else {
            delete importedBudget.id;
            await Budgets.create(userId, importedBudget);
        }
    }
    log.info('Done.');

    // No need to import operation types.

    // importedTypesMap is used to set type to imported operations (backward compatibility).
    let importedTypes = world.operationtypes || [];
    let importedTypesMap = new Map();
    for (let type of importedTypes) {
        importedTypesMap.set(type.id.toString(), type.name);
    }

    log.info('Import operations...');
    for (let op of world.operations) {
        // Map operation to account.
        if (typeof op.accountId !== 'undefined') {
            if (!accountIdToAccount.has(op.accountId)) {
                log.warn('Ignoring orphan operation:\n', op);
                continue;
            }
            op.accountId = accountIdToAccount.get(op.accountId);
        } else {
            if (!vendorToOwnAccountId.has(op.bankAccount)) {
                log.warn('Ignoring orphan operation:\n', op);
                continue;
            }
            op.accountId = vendorToOwnAccountId.get(op.bankAccount);
        }

        // Remove bankAccount as the operation is now linked to account with accountId prop.
        delete op.bankAccount;

        let categoryId = op.categoryId;
        if (typeof categoryId !== 'undefined') {
            if (typeof categoryMap[categoryId] === 'undefined') {
                log.warn('Unknown category, unsetting for operation:\n', op);
            }

            op.categoryId = categoryMap[categoryId];
        }

        // Set operation type base on operationId
        if (typeof op.operationTypeID !== 'undefined') {
            let key = op.operationTypeID.toString();
            if (importedTypesMap.has(key)) {
                op.type = importedTypesMap.get(key);
            } else {
                op.type = UNKNOWN_OPERATION_TYPE;
            }
            delete op.operationTypeID;
        }

        // If there is no label use the rawLabel, and vice-versa
        if (typeof op.label === 'undefined') {
            op.label = op.rawLabel;
        }

        if (typeof op.rawLabel === 'undefined') {
            op.rawLabel = op.label;
        }

        // Remove attachments, if there were any.
        delete op.attachments;
        delete op.binary;

        await Transactions.create(userId, op);
    }
    log.info('Done.');

    log.info('Import settings...');
    let shouldResetMigration = true;
    for (let setting of world.settings) {
        if (ConfigGhostSettings.has(setting.key)) {
            continue;
        }

        if (setting.key === 'migration-version') {
            // Overwrite previous value of migration-version setting.
            let found = await Settings.byKey(userId, 'migration-version');
            if (found) {
                shouldResetMigration = false;
                log.debug(`Updating migration-version index to ${setting.value}.`);
                await Settings.update(userId, found.id, { value: setting.value });
                continue;
            }
        }

        if (
            setting.key === 'default-account-id' &&
            setting.value !== DefaultSettings.get('default-account-id')
        ) {
            if (!accountIdToAccount.has(setting.value)) {
                log.warn(`unknown default account id: ${setting.value}, skipping.`);
                continue;
            }
            setting.value = accountIdToAccount.get(setting.value);

            await Settings.updateByKey(userId, 'default-account-id', setting.value);
            continue;
        }

        // Note that former existing values are not overwritten!
        await Settings.findOrCreateByKey(userId, setting.key, setting.value);
    }

    if (shouldResetMigration) {
        // If no migration-version has been set, just reset
        // migration-version value to 0, to force all the migrations to be
        // run again.
        log.info(
            'The imported file did not provide a migration-version value. ' +
                'Resetting it to 0 to run all migrations again.'
        );
        await Settings.updateByKey(userId, 'migration-version', '0');
    }
    log.info('Done.');

    log.info('Import alerts...');
    for (let a of world.alerts) {
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
        await Alerts.create(userId, a);
    }
    log.info('Done.');
}

export async function import_(req, res) {
    try {
        let { id: userId } = req.user;

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

        log.info('Running migrations...');
        await runMigrations();
        log.info('Done.');

        log.info('Import finished with success!');
        res.status(200).end();
    } catch (err) {
        return asyncErr(res, err, 'when importing data');
    }
}
