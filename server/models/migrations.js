import Accesses from './accesses';
import Accounts from './accounts';
import Alerts from './alerts';
import TransactionType from './deprecated-operationtype';

import Bank from './bank';
import Budget from './budget';
import Config from './config';
import Operation from './operation';
import Category from './category';
import User from './users';
import { ConfigGhostSettings } from './static-data';

import { makeLogger, UNKNOWN_OPERATION_TYPE } from '../helpers';

let log = makeLogger('models/migrations');

// For a given access, retrieves the custom fields and gives them to the
// changeFn, which must return a new version of the custom fields (deleted
// fields won't be kept in database). After which they're saved (it's not
// changeFn's responsability to call save/update).
async function updateCustomFields(userId, access, changeFn) {
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
        await Accesses.update(userId, access.id, {
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
    async function m0(cache, userId) {
        log.info('Removing weboob-log and weboob-installed from the db...');
        let weboobLog = await Config.byName(userId, 'weboob-log');
        if (weboobLog) {
            log.info('\tDestroying Config[weboob-log].');
            await Config.destroy(userId, weboobLog.id);
        }

        let weboobInstalled = await Config.byName(userId, 'weboob-installed');
        if (weboobInstalled) {
            log.info('\tDestroying Config[weboob-installed].');
            await Config.destroy(userId, weboobInstalled.id);
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
            if (typeof op.categoryId !== 'undefined' && !categorySet.has(op.categoryId)) {
                op.categoryId = null;
                await Operation.update(userId, op.id, { categoryId: null });
                catNum += 1;
            }
        }

        if (catNum) {
            log.info(`\t${catNum} operations had an inconsistent category.`);
        }
        return true;
    },

    async function m2(cache, userId) {
        log.info('Replacing NONE_CATEGORY_ID by null...');

        cache.operations = cache.operations || (await Operation.all(userId));

        let num = 0;
        for (let o of cache.operations) {
            if (typeof o.categoryId !== 'undefined' && o.categoryId.toString() === '-1') {
                o.categoryId = null;
                await Operation.update(userId, o.id, { categoryId: null });
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

        cache.accesses = cache.accesses || (await Accesses.all(userId));

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

            await updateCustomFields(userId, a, updateFields(website));

            num += 1;
        }

        if (num) {
            log.info(`\t${num} accesses updated to the customFields format.`);
        }

        return true;
    },

    async function m4(cache, userId) {
        log.info('Migrating HelloBank users to BNP and BNP users to the new website format.');

        cache.accesses = cache.accesses || (await Accesses.all(userId));

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
                await updateCustomFields(userId, a, updateFieldsBnp);
                continue;
            }

            if (a.bank === 'hellobank') {
                // Update access
                await updateCustomFields(userId, a, updateFieldsHelloBank);

                // Update accounts
                let accounts = await Accounts.byBank(userId, { uuid: 'hellobank' });
                for (let acc of accounts) {
                    await Accounts.update(userId, acc.id, { bank: 'bnporc' });
                }

                await Accesses.update(userId, a.id, { bank: 'bnporc' });
                log.info("\tHelloBank access updated to use BNP's backend.");
                continue;
            }
        }

        return true;
    },

    async function m5(cache, userId) {
        log.info('Ensure "importDate" field is present in accounts.');

        cache.accounts = cache.accounts || (await Accounts.all(userId));

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
            await Accounts.update(userId, a.id, { importDate: a.importDate });

            log.info(`\tImport date for ${a.title} (${a.accountNumber}): ${a.importDate}`);
        }

        return true;
    },

    async function m6(cache, userId) {
        log.info('Migrate operationTypeId to type field...');
        try {
            cache.types = cache.types || (await TransactionType.all());

            if (cache.types.length) {
                let operations = await Operation.allWithOperationTypesId(userId);
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
                    let update = { type: operation.type };
                    await Operation.update(userId, operation.id, update);
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

            cache.accounts = cache.accounts || (await Accounts.all(userId));
            cache.alerts = cache.alerts || (await Alerts.all(userId));

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
                    await Alerts.destroy(userId, al.id);
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
            let accesses = await Accesses.byBank(userId, { uuid: 'cmb' });
            for (let access of accesses) {
                // There is currently no other customFields, no need to update if it is defined.
                if (typeof access.customFields === 'undefined') {
                    log.info('Found CMB access, migrating to "par" website.');
                    const updateCMB = () => [{ name: 'website', value: 'par' }];
                    await updateCustomFields(userId, access, updateCMB);
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
            let accesses = await Accesses.byBank(userId, { uuid: 's2e' });
            for (let access of accesses) {
                let customFields = JSON.parse(access.customFields);
                let { value: website } = customFields.find(f => f.name === 'website');

                let bank = null;
                switch (website) {
                    case 'smartphone.s2e-net.com':
                        log.info('\tMigrating s2e module to bnpere...');
                        bank = 'bnppere';
                        break;
                    case 'mobile.capeasi.com':
                        log.info('\tMigrating s2e module to capeasi...');
                        bank = 'capeasi';
                        break;
                    case 'm.esalia.com':
                        log.info('\tMigrating s2e module to esalia...');
                        bank = 'esalia';
                        break;
                    case 'mobi.ere.hsbc.fr':
                        log.error('\tCannot migrate module s2e.');
                        log.error('\tPlease create a new access using erehsbc module (HSBC ERE).');
                        continue;
                    default:
                        log.error(`Invalid value for s2e module: ${website}`);
                        continue;
                }

                if (bank !== null) {
                    access.customFields = '[]';
                    access.bank = bank;
                    await Accesses.update(userId, access.id, { customFields: '[]', bank });
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
            cache.accounts = cache.accounts || (await Accounts.all(userId));

            for (let account of cache.accounts.filter(acc => acc.iban === 'None')) {
                log.info(`\tDeleting iban for ${account.title} of bank ${account.bank}`);
                account.iban = null;
                await Accounts.update(userId, account.id, { iban: null });
            }
            return true;
        } catch (e) {
            log.error(`Error while deleting iban with None value: ${e.toString()}`);
            return false;
        }
    },

    async function m12(cache, userId) {
        log.info("Ensuring the Config table doesn't contain any ghost settings.");
        try {
            for (let ghostName of ConfigGhostSettings.keys()) {
                let found = await Config.byName(userId, ghostName);
                if (found) {
                    await Config.destroy(userId, found.id);
                    log.info(`\tRemoved ${ghostName} from the database.`);
                }
            }
            return true;
        } catch (e) {
            log.error('Error while deleting the ghost settings from the Config table.');
            return false;
        }
    },

    async function m13(cache, userId) {
        log.info('Migrating the email configuration...');
        try {
            let found = await Config.byName(userId, 'mail-config');
            if (!found) {
                log.info('Not migrating: email configuration not found.');
                return true;
            }

            let { toEmail } = JSON.parse(found.value);
            if (!toEmail) {
                log.info('Not migrating: recipient email not found in current configuration.');
                await Config.destroy(userId, found.id);
                log.info('Previous configuration destroyed.');
                return true;
            }

            log.info(`Found mail config, migrating toEmail=${toEmail}.`);

            // There's a race condition hidden here: the user could have set a
            // new email address before the migration happened, at start. In
            // this case, this will just keep the email they've set.
            await Config.findOrCreateByName(userId, 'email-recipient', toEmail);

            await Config.destroy(userId, found.id);
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

            cache.accesses = cache.accesses || (await Accesses.all(userId));

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
                    await Accesses.update(userId, access.id, { customField: '[]' });
                }
            }

            return true;
        } catch (e) {
            log.error('Error while migrating empty access.customFields:', e.toString());
            return false;
        }
    },

    async function m15(cache, userId) {
        log.info('Removing weboob-version from the database...');
        try {
            let found = await Config.byName(userId, 'weboob-version');
            if (found) {
                await Config.destroy(userId, found.id);
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
            cache.accounts = cache.accounts || (await Accounts.all(userId));

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
                if (typeof op.bankAccount === 'undefined' || op.bankAccount === null) {
                    continue;
                }

                if (!accountsMap.has(op.bankAccount)) {
                    log.warn('Orphan operation, to be removed:', op);
                    numOrphanOps++;
                    await Operation.destroy(userId, op.id);
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
                        op.bankAccount = null;
                        let update = { accountId: op.accountId, bankAccount: null };
                        await Operation.update(userId, op.id, update);
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
            cache.alerts = cache.alerts || (await Alerts.all(userId));
            let newAlerts = [];
            let numMigratedAlerts = 0;
            let numOrphanAlerts = 0;
            for (let alert of cache.alerts) {
                // Ignore already migrated alerts.
                if (typeof alert.bankAccount === 'undefined' || alert.bankAccount === null) {
                    continue;
                }

                if (!accountsMap.has(alert.bankAccount)) {
                    log.warn('Orphan alert, to be removed:', alert);
                    numOrphanAlerts++;
                    await Alerts.destroy(userId, alert.id);
                    continue;
                }

                let cloneAlert = false;
                for (let account of accountsMap.get(alert.bankAccount)) {
                    if (cloneAlert) {
                        let newAlert = alert.clone();
                        newAlert.accountId = account.id;
                        newAlert = await Alerts.create(newAlert);
                        newAlerts.push(newAlert);
                    } else {
                        cloneAlert = true;
                        alert.accountId = account.id;
                        alert.bankAccount = null;
                        await Alerts.update(userId, alert.id, {
                            bankAccount: null,
                            accountId: account.id
                        });
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
    },

    async function m18(cache, userId) {
        log.info('Migrating budgets from categories to budgets.');
        try {
            cache.categories = cache.categories || (await Category.all(userId));
            const now = new Date();
            const year = now.getFullYear();
            const month = now.getMonth();
            for (let category of cache.categories) {
                if (category.threshold === 0) {
                    continue;
                }

                // If there is no budget for this category, create one for the current period.
                let budget = await Budget.byCategory(userId, category.id);
                if (!budget || budget.length === 0) {
                    log.info(
                        `Migrating budget for category ${
                            category.title
                        } with period ${month}/${year}`
                    );
                    await Budget.create(userId, {
                        categoryId: category.id,
                        threshold: category.threshold,
                        year,
                        month
                    });
                }

                category.threshold = 0;
                await Category.update(userId, category.id, { threshold: 0 });
            }
        } catch (e) {
            log.error('Error while migrating budgets from categories to bugdets:', e.toString());
            return false;
        }
        return true;
    }
];

export const testing = { migrations };

/**
 * Run all the required migrations.
 *
 * To determine whether a migration has to be run or not, we are comparing its
 * index in the migrations Array above with the `migration-version` config
 * value, which indicates the next migration to run.
 */
export async function run() {
    const users = await User.all();
    for (let { id: userId } of users) {
        let migrationVersion = await Config.findOrCreateDefault(userId, 'migration-version');
        let firstMigrationIndex = parseInt(migrationVersion.value, 10);

        // Cache to prevent loading multiple times the same data from the db.
        let cache = {};

        for (let m = firstMigrationIndex; m < migrations.length; m++) {
            if (!(await migrations[m](cache, userId))) {
                log.error(`Migration #${m} failed, aborting.`);
                return;
            }

            await Config.updateByKey(userId, 'migration-version', (m + 1).toString());
        }
    }
}
