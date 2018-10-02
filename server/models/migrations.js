import Access from './access';
import Account from './account';
import Alert from './alert';
import Bank from './bank';
import Config from './config';
import Operation from './operation';
import Category from './category';
import Type from './operationtype';
import User from './users';

import { makeLogger, UNKNOWN_OPERATION_TYPE } from '../helpers';

let log = makeLogger('models/migrations');

// For a given access, retrieves the custom fields and gives them to the
// changeFn, which must return a new version of the custom fields (deleted
// fields won't be kept in database). After which they're saved (it's not
// changeFn's responsability to call save/updateAttributes).
async function updateCustomFields(access, changeFn) {
    let originalCustomFields = JSON.parse(access.customFields || '[]');

    // "deep copy", lol
    let newCustomFields = JSON.parse(access.customFields || '[]');
    newCustomFields = changeFn(newCustomFields);

    let pairToString = pair => `${pair.name}:${pair.value}`;
    let buildSig = fields => fields.map(pairToString).join('/');

    let needsUpdate = false;
    if (originalCustomFields.length !== newCustomFields.length) {
        // If one has more fields than the other, update.
        needsUpdate = true;
    } else {
        // If the name:value/name2:value2 strings are different, update.
        let originalSignature = buildSig(originalCustomFields);
        let newSignature = buildSig(newCustomFields);
        needsUpdate = originalSignature !== newSignature;
    }

    if (needsUpdate) {
        log.debug(`updating custom fields for ${access.id}`);
        await access.updateAttributes({
            customFields: JSON.stringify(newCustomFields)
        });
    }
}

function reduceOperationsDate(oldest, operation) {
    return Math.min(oldest, +new Date(operation.dateImport));
}

/**
 * This is an array of all the migrations to apply on the database, in order to
 * automatically keep database schema in sync with Kresus code.
 *
 * _Note_: As only the necessary migrations are run at each startup, you should
 * NEVER update a given migration, but instead add a new migration to reflect
 * the changes you want to apply on the db. Updating an existing migration
 * might not update the database as expected.
 */
let migrations = [
    async function m0() {
        log.info('Removing weboob-log and weboob-installed from the db...');
        let weboobLog = await Config.byName('weboob-log');
        if (weboobLog) {
            log.info('\tDestroying Config[weboob-log].');
            await weboobLog.destroy();
        }

        let weboobInstalled = await Config.byName('weboob-installed');
        if (weboobInstalled) {
            log.info('\tDestroying Config[weboob-installed].');
            await weboobInstalled.destroy();
        }
        return true;
    },

    async function m1(cache, userId) {
        log.info('Checking that operations with categories are consistent...');

        cache.operations = cache.operations || (await Operation.all(userId));
        cache.categories = cache.categories || (await Category.all(userId));

        let categorySet = new Set();
        for (let c of cache.categories) {
            categorySet.add(c.id);
        }

        let catNum = 0;
        for (let op of cache.operations) {
            let needsSave = false;

            if (typeof op.categoryId !== 'undefined' && !categorySet.has(op.categoryId)) {
                needsSave = true;
                delete op.categoryId;
                catNum += 1;
            }

            if (needsSave) {
                await op.save();
            }
        }

        if (catNum) {
            log.info(`\t${catNum} operations had an inconsistent category.`);
        }
        return true;
    },

    async function m2(cache, userId) {
        log.info('Replacing NONE_CATEGORY_ID by undefined...');

        cache.operations = cache.operations || (await Operation.all(userId));

        let num = 0;
        for (let o of cache.operations) {
            if (typeof o.categoryId !== 'undefined' && o.categoryId.toString() === '-1') {
                delete o.categoryId;
                await o.save();
                num += 1;
            }
        }

        if (num) {
            log.info(`\t${num} operations had -1 as categoryId.`);
        }

        return true;
    },

    async function m3(cache, userId) {
        log.info('Migrating websites to the customFields format...');

        cache.accesses = cache.accesses || (await Access.all(userId));

        let num = 0;

        let updateFields = website => customFields => {
            if (customFields.filter(field => field.name === 'website').length) {
                return customFields;
            }

            customFields.push({
                name: 'website',
                value: website
            });

            return customFields;
        };

        for (let a of cache.accesses) {
            if (typeof a.website === 'undefined' || !a.website.length) {
                continue;
            }

            let website = a.website;
            delete a.website;

            await updateCustomFields(a, updateFields(website));

            await a.save();
            num += 1;
        }

        if (num) {
            log.info(`\t${num} accesses updated to the customFields format.`);
        }

        return true;
    },

    async function m4(cache, userId) {
        log.info('Migrating HelloBank users to BNP and BNP users to the new website format.');

        cache.accesses = cache.accesses || (await Access.all(userId));

        let updateFieldsBnp = customFields => {
            if (customFields.filter(field => field.name === 'website').length) {
                return customFields;
            }

            customFields.push({
                name: 'website',
                value: 'pp'
            });

            log.info('\tBNP access updated to the new website format.');
            return customFields;
        };

        let updateFieldsHelloBank = customFields => {
            customFields.push({
                name: 'website',
                value: 'hbank'
            });
            return customFields;
        };

        for (let a of cache.accesses) {
            if (a.bank === 'bnporc') {
                await updateCustomFields(a, updateFieldsBnp);
                continue;
            }

            if (a.bank === 'hellobank') {
                // Update access
                await updateCustomFields(a, updateFieldsHelloBank);

                // Update accounts
                let accounts = await Account.byBank({ uuid: 'hellobank' });
                for (let acc of accounts) {
                    await acc.updateAttributes({ bank: 'bnporc' });
                }

                await a.updateAttributes({ bank: 'bnporc' });
                log.info("\tHelloBank access updated to use BNP's backend.");
                continue;
            }
        }

        return true;
    },

    async function m5(cache, userId) {
        log.info('Ensure "importDate" field is present in accounts.');

        cache.accounts = cache.accounts || (await Account.all(userId));

        for (let a of cache.accounts) {
            if (typeof a.importDate !== 'undefined') {
                continue;
            }

            log.info(`\t${a.accountNumber} has no importDate.`);

            let ops = await Operation.byAccount(userId, a);

            let dateNumber = Date.now();
            if (ops.length) {
                dateNumber = ops.reduce(reduceOperationsDate, Date.now());
            }

            a.importDate = new Date(dateNumber);
            await a.save();

            log.info(`\tImport date for ${a.title} (${a.accountNumber}): ${a.importDate}`);
        }

        return true;
    },

    async function m6(cache) {
        log.info('Migrate operationTypeId to type field...');
        try {
            cache.types = cache.types || (await Type.all());

            if (cache.types.length) {
                let operations = await Operation.allWithOperationTypesId();
                log.info(`${operations.length} operations to migrate`);
                let typeMap = new Map();
                for (let { id, name } of cache.types) {
                    typeMap.set(id, name);
                }

                for (let operation of operations) {
                    if (operation.operationTypeID && typeMap.has(operation.operationTypeID)) {
                        operation.type = typeMap.get(operation.operationTypeID);
                    } else {
                        operation.type = UNKNOWN_OPERATION_TYPE;
                    }
                    delete operation.operationTypeID;
                    await operation.save();
                }

                // Delete operation types
                for (let type of cache.types) {
                    await type.destroy();
                }
                delete cache.types;
            }

            return true;
        } catch (e) {
            log.error(`Error while updating operation type: ${e}`);
            return false;
        }
    },

    async function m7(cache, userId) {
        log.info('Ensuring consistency of accounts with alerts...');

        try {
            let accountSet = new Set();

            cache.accounts = cache.accounts || (await Account.all(userId));
            cache.alerts = cache.alerts || (await Alert.all());

            for (let account of cache.accounts) {
                accountSet.add(account.accountNumber);
            }

            let numOrphans = 0;
            for (let al of cache.alerts) {
                if (typeof al.bankAccount === 'undefined') {
                    continue;
                }
                if (!accountSet.has(al.bankAccount)) {
                    numOrphans++;
                    await al.destroy();
                }
            }
            // Purge the alerts cache, next migration requiring it will rebuild
            // an updated cache.
            delete cache.alerts;

            if (numOrphans) {
                log.info(`\tfound and removed ${numOrphans} orphan alerts`);
            }

            return true;
        } catch (e) {
            log.error(`Error while ensuring consistency of alerts: ${e.toString()}`);
            return false;
        }
    },

    async function m8(cache) {
        log.info('Deleting banks from database');
        try {
            cache.banks = cache.banks || (await Bank.all());
            for (let bank of cache.banks) {
                await bank.destroy();
            }
            delete cache.banks;
            return true;
        } catch (e) {
            log.error(`Error while deleting banks: ${e.toString()}`);
            return false;
        }
    },

    async function m9(cache, userId) {
        log.info('Looking for a CMB access...');
        try {
            let accesses = await Access.byBank(userId, { uuid: 'cmb' });
            for (let access of accesses) {
                // There is currently no other customFields, no need to update if it is defined.
                if (typeof access.customFields === 'undefined') {
                    log.info('Found CMB access, migrating to "par" website.');
                    const updateCMB = () => [{ name: 'website', value: 'par' }];
                    await updateCustomFields(access, updateCMB);
                }
            }
            return true;
        } catch (e) {
            log.error(`Error while migrating CMB accesses: ${e.toString()}`);
            return false;
        }
    },

    async function m10(cache, userId) {
        log.info('Looking for an s2e module...');
        try {
            let accesses = await Access.byBank(userId, { uuid: 's2e' });
            for (let access of accesses) {
                let customFields = JSON.parse(access.customFields);
                let { value: website } = customFields.find(f => f.name === 'website');

                switch (website) {
                    case 'smartphone.s2e-net.com':
                        log.info('\tMigrating s2e module to bnpere...');
                        access.bank = 'bnppere';
                        break;
                    case 'mobile.capeasi.com':
                        log.info('\tMigrating s2e module to capeasi...');
                        access.bank = 'capeasi';
                        break;
                    case 'm.esalia.com':
                        log.info('\tMigrating s2e module to esalia...');
                        access.bank = 'esalia';
                        break;
                    case 'mobi.ere.hsbc.fr':
                        log.error('\tCannot migrate module s2e.');
                        log.error('\tPlease create a new access using erehsbc module (HSBC ERE).');
                        break;
                    default:
                        log.error(`Invalid value for s2e module: ${website}`);
                }
                if (access.bank !== 's2e') {
                    delete access.customFields;
                    await access.save();
                }
            }
            return true;
        } catch (e) {
            log.error(`Error while migrating s2e accesses: ${e.toString()}`);
            return false;
        }
    },

    async function m11(cache, userId) {
        log.info('Searching accounts with IBAN value set to None');
        try {
            cache.accounts = cache.accounts || (await Account.all(userId));

            for (let account of cache.accounts.filter(acc => acc.iban === 'None')) {
                log.info(`\tDeleting iban for ${account.title} of bank ${account.bank}`);
                delete account.iban;
                await account.save();
            }
            return true;
        } catch (e) {
            log.error(`Error while deleting iban with None value: ${e.toString()}`);
            return false;
        }
    },

    async function m12() {
        log.info("Ensuring the Config table doesn't contain any ghost settings.");
        try {
            for (let ghostName of Config.ghostSettings.keys()) {
                let found = await Config.byName(ghostName);
                if (found) {
                    await found.destroy();
                    log.info(`\tRemoved ${ghostName} from the database.`);
                }
            }
            return true;
        } catch (e) {
            log.error('Error while deleting the ghost settings from the Config table.');
            return false;
        }
    },

    async function m13() {
        log.info('Migrating the email configuration...');
        try {
            let found = await Config.byName('mail-config');
            if (!found) {
                log.info('Not migrating: email configuration not found.');
                return true;
            }

            let { toEmail } = JSON.parse(found.value);
            if (!toEmail) {
                log.info('Not migrating: recipient email not found in current configuration.');
                await found.destroy();
                log.info('Previous configuration destroyed.');
                return true;
            }

            log.info(`Found mail config, migrating toEmail=${toEmail}.`);

            // There's a race condition hidden here: the user could have set a
            // new email address before the migration happened, at start. In
            // this case, this will just keep the email they've set.
            await Config.findOrCreateByName('email-recipient', toEmail);

            await found.destroy();
            log.info('Done migrating recipient email configuration!');
            return true;
        } catch (e) {
            log.error('Error while migrating the email configuration: ', e.toString());
            return false;
        }
    },

    async function m14(cache, userId) {
        try {
            log.info('Migrating empty access.customFields...');

            cache.accesses = cache.accesses || (await Access.all(userId));

            for (let access of cache.accesses) {
                if (typeof access.customFields === 'undefined') {
                    continue;
                }

                try {
                    JSON.parse(access.customFields);
                } catch (e) {
                    log.info(
                        `Found invalid access.customFields for access with id=${
                            access.id
                        }, replacing by empty array.`
                    );
                    access.customFields = '[]';
                    await access.save();
                }
            }

            return true;
        } catch (e) {
            log.error('Error while migrating empty access.customFields:', e.toString());
            return false;
        }
    },

    async function m15() {
        log.info('Removing weboob-version from the database...');
        try {
            let found = await Config.byName('weboob-version');
            if (found) {
                await found.destroy();
                log.info('Found and deleted weboob-version.');
            }
            return true;
        } catch (e) {
            log.error('Error while removing weboob-version: ', e.toString());
            return false;
        }
    },

    async function m16(cache, userId) {
        log.info('Linking operations to account by id instead of accountNumber');
        try {
            cache.operations = cache.operations || (await Operation.all(userId));
            cache.accounts = cache.accounts || (await Account.all(userId));

            let accountsMap = new Map();
            for (let account of cache.accounts) {
                if (accountsMap.has(account.accountNumber)) {
                    accountsMap.get(account.accountNumber).push(account);
                } else {
                    accountsMap.set(account.accountNumber, [account]);
                }
            }

            let newOperations = [];
            let numMigratedOps = 0;
            let numOrphanOps = 0;
            for (let op of cache.operations) {
                // Ignore already migrated operations.
                if (typeof op.bankAccount === 'undefined') {
                    continue;
                }

                if (!accountsMap.has(op.bankAccount)) {
                    log.warn('Orphan operation, to be removed:', op);
                    numOrphanOps++;
                    await op.destroy();
                    continue;
                }

                let cloneOperation = false;
                for (let account of accountsMap.get(op.bankAccount)) {
                    if (cloneOperation) {
                        let newOp = op.clone();
                        newOp.accountId = account.id;
                        newOp = await Operation.create(userId, newOp);
                        newOperations.push(newOp);
                    } else {
                        cloneOperation = true;
                        op.accountId = account.id;
                        delete op.bankAccount;
                        await op.save();
                        numMigratedOps++;
                    }
                }
            }

            cache.operations = cache.operations.concat(newOperations);
            log.info(`${numMigratedOps} operations migrated`);
            log.info(`${numOrphanOps} orphan operations have been removed`);
            log.info(`${newOperations.length} new operations created`);
            log.info('All operations correctly migrated.');

            log.info('Linking alerts to account by id instead of accountNumber');
            cache.alerts = cache.alerts || (await Alert.all());
            let newAlerts = [];
            let numMigratedAlerts = 0;
            let numOrphanAlerts = 0;
            for (let alert of cache.alerts) {
                // Ignore already migrated alerts.
                if (typeof alert.bankAccount === 'undefined') {
                    continue;
                }

                if (!accountsMap.has(alert.bankAccount)) {
                    log.warn('Orphan alert, to be removed:', alert);
                    numOrphanAlerts++;
                    await alert.destroy();
                    continue;
                }

                let cloneAlert = false;
                for (let account of accountsMap.get(alert.bankAccount)) {
                    if (cloneAlert) {
                        let newAlert = alert.clone();
                        newAlert.accountId = account.id;
                        newAlert = await Alert.create(newAlert);
                        newAlerts.push(newAlert);
                    } else {
                        cloneAlert = true;
                        alert.accountId = account.id;
                        delete alert.bankAccount;
                        await alert.save();
                        numMigratedAlerts++;
                    }
                }
            }

            cache.alerts = cache.alerts.concat(newAlerts);
            log.info(`${numMigratedAlerts} alerts migrated`);
            log.info(`${numOrphanAlerts} orphan alerts have been removed`);
            log.info(`${newAlerts.length} new alerts created`);
            log.info('All alerts correctly migrated.');
            return true;
        } catch (e) {
            log.error('Error while linking operations and alerts to account by id: ', e.toString());
            return false;
        }
    },

    async function m17(cache, userId) {
        log.info('Trying to apply m16 again after resolution of #733.');
        return await migrations[16](cache, userId);
    }
];

/**
 * Run all the required migrations.
 *
 * To determine whether a migration has to be run or not, we are comparing its
 * index in the migrations Array above with the `migration-version` config
 * value, which indicates the next migration to run.
 */
export async function run() {
    const users = await User.all();
    for (let user of users) {
        let migrationVersion = await Config.findOrCreateDefault('migration-version');
        let firstMigrationIndex = parseInt(migrationVersion.value, 10);

        // Cache to prevent loading multiple times the same data from the db.
        let cache = {};

        for (let m = firstMigrationIndex; m < migrations.length; m++) {
            if (!(await migrations[m](cache, user.id))) {
                log.error(`Migration #${m} failed, aborting.`);
                return;
            }

            migrationVersion.value = (m + 1).toString();
            await migrationVersion.save();
        }
    }
}
