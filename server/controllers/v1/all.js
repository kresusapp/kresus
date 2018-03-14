import * as crypto from 'crypto';

import Access from '../../models/access';
import Account from '../../models/account';
import Alert from '../../models/alert';
import Category from '../../models/category';
import Operation from '../../models/operation';
import Config from '../../models/config';

import DefaultSettings from '../../shared/default-settings';
import { run as runMigrations } from '../../models/migrations';

import { makeLogger, KError, asyncErr, UNKNOWN_OPERATION_TYPE } from '../../helpers';

let log = makeLogger('controllers/all');

const ERR_MSG_LOADING_ALL = 'Error when loading all Kresus data';
const ENCRYPTION_ALGORITHM = 'aes-256-ctr';
const PASSPHRASE_VALIDATION_REGEXP = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
const ENCRYPTED_CONTENT_TAG = new Buffer('KRE');

async function getAllData(isExport = false, cleanPassword = true) {
    let ret = {};
    ret.accounts = await Account.all();
    ret.accesses = await Access.all();

    if (cleanPassword) {
        ret.accesses.forEach(access => delete access.password);
    }

    ret.alerts = await Alert.all();
    ret.categories = await Category.all();
    ret.operations = await Operation.all();
    ret.settings = isExport ? await Config.allWithoutGhost() : await Config.all();

    return ret;
}

export async function all(req, res) {
    try {
        let ret = await getAllData();
        res.status(200).json(ret);
    } catch (err) {
        err.code = ERR_MSG_LOADING_ALL;
        return asyncErr(res, err, 'when loading all data');
    }
}

// Strip away Couchdb/pouchdb metadata.
function cleanMeta(obj) {
    delete obj._id;
    delete obj._rev;
    delete obj.docType;
}

// Sync function
function cleanData(world) {
    let accessMap = {};
    let nextAccessId = 0;

    world.accesses = world.accesses || [];
    for (let a of world.accesses) {
        accessMap[a.id] = nextAccessId;
        a.id = nextAccessId++;
        cleanMeta(a);
    }

    let accountMap = {};
    let nextAccountId = 0;
    world.accounts = world.accounts || [];
    for (let a of world.accounts) {
        a.bankAccess = accessMap[a.bankAccess];
        accountMap[a.id] = nextAccountId;
        a.id = nextAccountId++;
        cleanMeta(a);
    }

    let categoryMap = {};
    let nextCatId = 0;
    world.categories = world.categories || [];
    for (let c of world.categories) {
        categoryMap[c.id] = nextCatId;
        c.id = nextCatId++;
        cleanMeta(c);
    }

    world.operations = world.operations || [];
    for (let o of world.operations) {
        if (typeof o.categoryId !== 'undefined') {
            let cid = o.categoryId;
            if (typeof categoryMap[cid] === 'undefined') {
                log.warn(`unexpected category id: ${cid}`);
            } else {
                o.categoryId = categoryMap[cid];
            }
        }

        o.accountId = accountMap[o.accountId];

        // Strip away id.
        delete o.id;
        cleanMeta(o);

        // Remove attachments, if there are any.
        delete o.attachments;
        delete o.binary;
    }

    world.settings = world.settings || [];
    for (let s of world.settings) {
        delete s.id;
        cleanMeta(s);

        // Properly save the default account id if it exists.
        if (s.name === 'defaultAccountId' && s.value !== DefaultSettings.get('defaultAccountId')) {
            let accountId = s.value;
            if (typeof accountMap[accountId] === 'undefined') {
                log.warn(`unexpected default account id: ${accountId}`);
            } else {
                s.value = accountMap[accountId];
            }
        }
    }

    world.alerts = world.alerts || [];
    for (let a of world.alerts) {
        a.accountId = accountMap[a.accountId];
        delete a.id;
        cleanMeta(a);
    }

    return world;
}

function encryptData(data, passphrase) {
    let cipher = crypto.createCipher(ENCRYPTION_ALGORITHM, passphrase);
    return Buffer.concat([ENCRYPTED_CONTENT_TAG, cipher.update(data), cipher.final()]).toString(
        'base64'
    );
}

function decryptData(data, passphrase) {
    let rawData = new Buffer(data, 'base64');
    let [tag, encrypted] = [rawData.slice(0, 3), rawData.slice(3)];

    if (tag.toString() !== ENCRYPTED_CONTENT_TAG.toString()) {
        throw new KError('submitted file is not a valid kresus file', 400);
    }

    let decipher = crypto.createDecipher(ENCRYPTION_ALGORITHM, passphrase);
    return Buffer.concat([decipher.update(encrypted), decipher.final()]);
}

export async function export_(req, res) {
    try {
        let passphrase = null;

        if (req.body.encrypted === 'true') {
            if (typeof req.body.passphrase !== 'string') {
                throw new KError('missing parameter "passphrase"', 400);
            }

            passphrase = req.body.passphrase;

            // Check password strength
            if (!PASSPHRASE_VALIDATION_REGEXP.test(passphrase)) {
                throw new KError('submitted passphrase is too weak', 400);
            }
        }

        let ret = await getAllData(/* ghost settings */ false, !passphrase);

        ret = cleanData(ret);
        ret = JSON.stringify(ret, null, '   ');

        if (passphrase) {
            ret = encryptData(ret, passphrase);
            res.setHeader('Content-Type', 'text/plain');
        } else {
            res.setHeader('Content-Type', 'application/json');
        }

        res.status(200).send(ret);
    } catch (err) {
        err.code = ERR_MSG_LOADING_ALL;
        return asyncErr(res, err, 'when exporting data');
    }
}

export async function import_(req, res) {
    try {
        if (!req.body.all) {
            throw new KError('missing parameter "all" in the file', 400);
        }

        let world = req.body.all;
        if (req.body.encrypted) {
            if (typeof req.body.passphrase !== 'string') {
                throw new KError('missing parameter "passphrase"', 400);
            }

            world = decryptData(world, req.body.passphrase);

            try {
                world = JSON.parse(world);
            } catch (err) {
                throw new KError('Invalid json file or bad passphrase.', 400);
            }
        }

        world.accesses = world.accesses || [];
        world.accounts = world.accounts || [];
        world.alerts = world.alerts || [];
        world.categories = world.categories || [];
        world.operationtypes = world.operationtypes || [];
        world.operations = world.operations || [];
        world.settings = world.settings || [];

        log.info(`Importing:
            accesses:        ${world.accesses.length}
            accounts:        ${world.accounts.length}
            alerts:          ${world.alerts.length}
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

            let created = await Access.create(access);

            accessMap[accessId] = created.id;
        }
        log.info('Done.');

        log.info('Import accounts...');
        let accountIdToAccount = new Map();
        let accountNumberToAccount = new Map();
        for (let account of world.accounts) {
            if (typeof accessMap[account.bankAccess] === 'undefined') {
                log.warn('Ignoring orphan account:\n', account);
                continue;
            }

            let accountId = account.id;
            delete account.id;

            account.bankAccess = accessMap[account.bankAccess];
            let created = await Account.create(account);

            accountIdToAccount.set(accountId, created.id);
            accountNumberToAccount.set(created.accountNumber, created.id);
        }
        log.info('Done.');

        log.info('Import categories...');
        let existingCategories = await Category.all();
        let existingCategoriesMap = new Map();
        for (let c of existingCategories) {
            existingCategoriesMap.set(c.title, c);
        }

        let categoryMap = {};
        for (let category of world.categories) {
            let catId = category.id;
            delete category.id;
            if (existingCategoriesMap.has(category.title)) {
                let existing = existingCategoriesMap.get(category.title);
                categoryMap[catId] = existing.id;
            } else {
                let created = await Category.create(category);
                categoryMap[catId] = created.id;
            }
        }
        log.info('Done.');

        // No need to import operation types.

        // importedTypesMap is used to set type to imported operations (backward compatibility)
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
                if (!accountNumberToAccount.has(op.bankAccount)) {
                    log.warn('Ignoring orphan operation:\n', op);
                    continue;
                }
                op.accountId = accountNumberToAccount.get(op.bankAccount);
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

            // Remove attachments, if there were any.
            delete op.attachments;
            delete op.binary;

            await Operation.create(op);
        }
        log.info('Done.');

        log.info('Import settings...');
        let shouldResetMigration = true;
        for (let setting of world.settings) {
            if (Config.ghostSettings.has(setting.name)) {
                continue;
            }

            if (setting.name === 'migration-version') {
                // Overwrite previous value of migration-version setting.
                let found = await Config.byName('migration-version');
                if (found) {
                    shouldResetMigration = false;
                    found.value = setting.value;
                    log.debug(`Updating migration-version index to ${setting.value}.`);
                    await found.save();
                    continue;
                }
            }

            if (
                setting.name === 'defaultAccountId' &&
                setting.value !== DefaultSettings.get('defaultAccountId')
            ) {
                if (!accountIdToAccount.has(setting.value)) {
                    log.warn(`unknown default account id: ${setting.value}, skipping.`);
                    continue;
                }
                setting.value = accountIdToAccount.get(setting.value);

                // Maybe overwrite the previous value, if there was one.
                let found = await Config.byName('defaultAccountId');
                if (found) {
                    found.value = setting.value;
                    await found.save();
                    continue;
                }
            }

            // Note that former existing values are not overwritten!
            await Config.findOrCreateByName(setting.name, setting.value);
        }

        if (shouldResetMigration) {
            // If no migration-version has been set, just reset
            // migration-version value to 0, to force all the migrations to be
            // run again.
            log.info(
                'The imported file did not provide a migration-version value. ' +
                    'Resetting it to 0 to run all migrations again.'
            );
            let migrationVersion = await Config.byName('migration-version');
            migrationVersion.value = '0';
            await migrationVersion.save();
        }
        log.info('Done.');

        log.info('Import alerts...');
        for (let a of world.alerts) {
            // Map alert to account.
            if (typeof a.accountId !== 'undefined') {
                if (!accountIdToAccount.has(a.accountId)) {
                    log.warning('Ignoring orphan alert:\n', a);
                    continue;
                }
                a.accountId = accountIdToAccount.get(a.accountId);
            } else {
                if (!accountNumberToAccount.has(a.bankAccount)) {
                    log.warning('Ignoring orphan alert:\n', a);
                    continue;
                }
                a.accountId = accountNumberToAccount.get(a.bankAccount);
            }

            // Remove bankAccount as the alert is now linked to account with accountId prop.
            delete a.bankAccount;
            await Alert.create(a);
        }
        log.info('Done.');

        log.info('Running migrations...');
        await runMigrations();
        log.info('Done.');

        log.info('Import finished with success!');
        res.status(200).end();
    } catch (err) {
        return asyncErr(res, err, 'when importing data');
    }
}
