import Accesses from './accesses';
import Accounts from './accounts';
import Alerts from './alerts';
import Budgets from './budgets';
import Categories from './categories';
import Settings from './settings';
import Transactions from './transactions';

import Bank from './deprecated-bank';
import TransactionType from './deprecated-operationtype';

import User from './users';
import { ConfigGhostSettings } from './static-data';

import { makeLogger, UNKNOWN_OPERATION_TYPE } from '../helpers';

let log = makeLogger('models/migrations');

// For a given access, retrieves the custom fields and gives them to the
// changeFn, which must return a new version of the custom fields (deleted
// fields won't be kept in database). After which they're saved (it's not
// changeFn's responsability to call save/update).
async function updateCustomFields(userId, access, changeFn) {
    // "deep copy", lol
    let newCustomFields = JSON.parse(access.customFields || '[]');
    newCustomFields = changeFn(newCustomFields);

    log.debug(`Updating custom fields for ${access.id}`);
    await Accesses.update(userId, access.id, {
        customFields: JSON.stringify(newCustomFields)
    });
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
    async function m0(userId) {
        log.info('Removing weboob-log and weboob-installed from the db...');
        let weboobLog = await Settings.byName(userId, 'weboob-log');
        if (weboobLog) {
            log.info('\tDestroying Settings[weboob-log].');
            await Settings.destroy(userId, weboobLog.id);
        }

        let weboobInstalled = await Settings.byName(userId, 'weboob-installed');
        if (weboobInstalled) {
            log.info('\tDestroying Settings[weboob-installed].');
            await Settings.destroy(userId, weboobInstalled.id);
        }
        return true;
    },

    async function m1(userId) {
        log.info('Checking that operations with categories are consistent...');

        let operations = await Transactions.all(userId);
        let categories = await Categories.all(userId);

        let categorySet = new Set();
        for (let c of categories) {
            categorySet.add(c.id);
        }

        let catNum = 0;
        for (let op of operations) {
            if (typeof op.categoryId !== 'undefined' && !categorySet.has(op.categoryId)) {
                op.categoryId = null;
                await Transactions.update(userId, op.id, { categoryId: null });
                catNum += 1;
            }
        }

        if (catNum) {
            log.info(`\t${catNum} operations had an inconsistent category.`);
        }
        return true;
    },

    async function m2(userId) {
        log.info('Replacing NONE_CATEGORY_ID by null...');

        let operations = await Transactions.all(userId);

        let num = 0;
        for (let o of operations) {
            if (typeof o.categoryId !== 'undefined' && o.categoryId.toString() === '-1') {
                o.categoryId = null;
                await Transactions.update(userId, o.id, { categoryId: null });
                num += 1;
            }
        }

        if (num) {
            log.info(`\t${num} operations had -1 as categoryId.`);
        }

        return true;
    },

    async function m3(userId) {
        log.info('Migrating websites to the customFields format...');

        let accesses = await Accesses.all(userId);

        let num = 0;

        let updateFields = website => customFields => {
            if (customFields.some(field => field.name === 'website')) {
                return customFields;
            }

            customFields.push({
                name: 'website',
                value: website
            });

            return customFields;
        };

        for (let a of accesses) {
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

    async function m4(userId) {
        log.info('Migrating HelloBank users to BNP and BNP users to the new website format.');

        let accesses = await Accesses.all(userId);

        let updateFieldsBnp = customFields => {
            if (customFields.some(field => field.name === 'website')) {
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

        for (let a of accesses) {
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

    async function m5(userId) {
        log.info('Ensure "importDate" field is present in accounts.');

        let accounts = await Accounts.all(userId);

        for (let a of accounts) {
            if (typeof a.importDate !== 'undefined') {
                continue;
            }

            log.info(`\t${a.accountNumber} has no importDate.`);

            let ops = await Transactions.byAccount(userId, a);

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

    async function m6(userId) {
        log.info('Migrate operationTypeId to type field...');
        try {
            let types = await TransactionType.all();

            if (types.length) {
                let operations = await Transactions.allWithOperationTypesId(userId);
                log.info(`${operations.length} operations to migrate`);
                let typeMap = new Map();
                for (let { id, name } of types) {
                    typeMap.set(id, name);
                }

                for (let operation of operations) {
                    let type;
                    if (operation.operationTypeID && typeMap.has(operation.operationTypeID)) {
                        type = typeMap.get(operation.operationTypeID);
                    } else {
                        type = UNKNOWN_OPERATION_TYPE;
                    }
                    await Transactions.update(userId, operation.id, {
                        type,
                        operationTypeID: null
                    });
                }

                // Delete operation types
                for (let type of types) {
                    if (typeof type.id !== 'undefined') {
                        await TransactionType.destroy(type.id);
                    }
                }
            }

            return true;
        } catch (e) {
            log.error(`Error while updating operation type: ${e}`);
            return false;
        }
    },

    async function m7(userId) {
        log.info('Ensuring consistency of accounts with alerts...');

        try {
            let accountSet = new Set();

            let accounts = await Accounts.all(userId);
            let alerts = await Alerts.all(userId);

            for (let account of accounts) {
                accountSet.add(account.accountNumber);
            }

            let numOrphans = 0;
            for (let al of alerts) {
                if (typeof al.bankAccount === 'undefined') {
                    continue;
                }
                if (!accountSet.has(al.bankAccount)) {
                    numOrphans++;
                    await Alerts.destroy(userId, al.id);
                }
            }

            if (numOrphans) {
                log.info(`\tfound and removed ${numOrphans} orphan alerts`);
            }

            return true;
        } catch (e) {
            log.error(`Error while ensuring consistency of alerts: ${e.toString()}`);
            return false;
        }
    },

    async function m8() {
        log.info('Deleting banks from database');
        try {
            let banks = await Bank.all();
            for (let bank of banks) {
                if (typeof bank.id !== 'undefined') {
                    await Bank.destroy(bank.id);
                }
            }
            return true;
        } catch (e) {
            log.error(`Error while deleting banks: ${e.toString()}`);
            return false;
        }
    },

    async function m9() {
        // This migration used to set the website custom field to 'par' for the CMB accesses.
        // However this is not expected anymore, and the value should now be set to 'pro', as done
        // in m19. This migration is therefore now a no-op so that m19 can do its job (it could not
        // if the website custom field was already set).
        return true;
    },

    async function m10(userId) {
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

    async function m11(userId) {
        log.info('Searching accounts with IBAN value set to None');
        try {
            let accounts = await Accounts.all(userId);

            for (let account of accounts.filter(acc => acc.iban === 'None')) {
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

    async function m12(userId) {
        log.info("Ensuring the Settings table doesn't contain any ghost settings.");
        try {
            for (let ghostName of ConfigGhostSettings.keys()) {
                let found = await Settings.byName(userId, ghostName);
                if (found) {
                    await Settings.destroy(userId, found.id);
                    log.info(`\tRemoved ${ghostName} from the database.`);
                }
            }
            return true;
        } catch (e) {
            log.error('Error while deleting the ghost settings from the Settings table.');
            return false;
        }
    },

    async function m13(userId) {
        log.info('Migrating the email configuration...');
        try {
            let found = await Settings.byName(userId, 'mail-config');
            if (!found) {
                log.info('Not migrating: email configuration not found.');
                return true;
            }

            let { toEmail } = JSON.parse(found.value);
            if (!toEmail) {
                log.info('Not migrating: recipient email not found in current configuration.');
                await Settings.destroy(userId, found.id);
                log.info('Previous configuration destroyed.');
                return true;
            }

            log.info(`Found mail config, migrating toEmail=${toEmail}.`);

            // There's a race condition hidden here: the user could have set a
            // new email address before the migration happened, at start. In
            // this case, this will just keep the email they've set.
            await Settings.findOrCreateByName(userId, 'email-recipient', toEmail);

            await Settings.destroy(userId, found.id);
            log.info('Done migrating recipient email configuration!');
            return true;
        } catch (e) {
            log.error('Error while migrating the email configuration: ', e.toString());
            return false;
        }
    },

    async function m14(userId) {
        try {
            log.info('Migrating empty access.customFields...');

            let accesses = await Accesses.all(userId);

            for (let access of accesses) {
                try {
                    if (!(JSON.parse(access.customFields) instanceof Array)) {
                        throw new Error('customFields should be an array');
                    }
                } catch (e) {
                    log.info(
                        `Found invalid access.customFields for access with id=${
                            access.id
                        }, replacing by empty array.`
                    );
                    await Accesses.update(userId, access.id, { customFields: '[]' });
                }
            }

            return true;
        } catch (e) {
            log.error('Error while migrating empty access.customFields:', e.toString());
            return false;
        }
    },

    async function m15(userId) {
        log.info('Re-applying m12 now that "weboob-version" was moved to ghost settings.');
        return await migrations[12](userId);
    },

    async function m16(userId) {
        log.info('Linking operations to account by id instead of accountNumber');
        try {
            let operations = await Transactions.all(userId);
            let accounts = await Accounts.all(userId);

            let accountsMap = new Map();
            for (let account of accounts) {
                if (accountsMap.has(account.accountNumber)) {
                    accountsMap.get(account.accountNumber).push(account);
                } else {
                    accountsMap.set(account.accountNumber, [account]);
                }
            }

            let newOperations = [];
            let numMigratedOps = 0;
            let numOrphanOps = 0;
            for (let op of operations) {
                // Ignore already migrated operations.
                if (typeof op.bankAccount === 'undefined' || op.bankAccount === null) {
                    continue;
                }

                if (!accountsMap.has(op.bankAccount)) {
                    log.warn('Orphan operation, to be removed:', op);
                    numOrphanOps++;
                    await Transactions.destroy(userId, op.id);
                    continue;
                }

                let cloneOperation = false;
                for (let account of accountsMap.get(op.bankAccount)) {
                    if (cloneOperation) {
                        let newOp = op.clone();
                        newOp.accountId = account.id;
                        newOp = await Transactions.create(userId, newOp);
                        newOperations.push(newOp);
                    } else {
                        cloneOperation = true;
                        op.accountId = account.id;
                        op.bankAccount = null;
                        let update = { accountId: op.accountId, bankAccount: null };
                        await Transactions.update(userId, op.id, update);
                        numMigratedOps++;
                    }
                }
            }

            log.info(`${numMigratedOps} operations migrated`);
            log.info(`${numOrphanOps} orphan operations have been removed`);
            log.info(`${newOperations.length} new operations created`);
            log.info('All operations correctly migrated.');

            log.info('Linking alerts to account by id instead of accountNumber');
            let alerts = await Alerts.all(userId);
            let newAlerts = [];
            let numMigratedAlerts = 0;
            let numOrphanAlerts = 0;
            for (let alert of alerts) {
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

    async function m17(userId) {
        log.info('Trying to apply m16 again after resolution of #733.');
        return await migrations[16](userId);
    },

    async function m18(userId) {
        log.info('Migrating budgets from categories to budgets.');
        try {
            let categories = await Categories.all(userId);
            const now = new Date();
            const year = now.getFullYear();
            const month = now.getMonth();
            for (let category of categories) {
                if (category.threshold === 0) {
                    continue;
                }

                // If there is no budget for this category, create one for the current period.
                let budget = await Budgets.byCategory(userId, category.id);
                if (!budget || budget.length === 0) {
                    log.info(
                        `Migrating budget for category ${
                            category.title
                        } with period ${month}/${year}`
                    );
                    await Budgets.create(userId, {
                        categoryId: category.id,
                        threshold: category.threshold,
                        year,
                        month
                    });
                }

                await Categories.update(userId, category.id, { threshold: 0 });
            }
        } catch (e) {
            log.error('Error while migrating budgets from categories to bugdets:', e.toString());
            return false;
        }
        return true;
    },

    async function m19(userId) {
        log.info('Migrating Crédit Mutuel de Bretagne default website.');
        try {
            let accesses = await Accesses.byBank(userId, { uuid: 'cmb' });

            accessLoop: for (let access of accesses) {
                let customFields = JSON.parse(access.customFields);
                for (let customField of customFields) {
                    if (customField.name === 'website') {
                        log.info('Website already set in custom field. Leaving as is');
                        continue accessLoop;
                    }
                }

                customFields.push({ name: 'website', value: 'pro' });

                let stringified = JSON.stringify(customFields);
                await Accesses.update(userId, access.id, {
                    customFields: stringified
                });
                access.customFields = stringified;
            }
        } catch (e) {
            log.error(
                'Error while migrating Crédit Mutuel de Bretagne default website:',
                e.toString()
            );
            return false;
        }
        return true;
    },

    async function m20(userId) {
        log.info('Migrating camelCase settings to regular-case.');
        try {
            let settings = await Settings.all(userId);
            let numMigrated = 0;
            for (let s of settings) {
                let newName = null;
                switch (s.name) {
                    case 'duplicateThreshold':
                        newName = 'duplicate-threshold';
                        break;
                    case 'duplicateIgnoreDifferentCustomFields':
                        newName = 'duplicate-ignore-different-custom-fields';
                        break;
                    case 'defaultChartDisplayType':
                        newName = 'default-chart-display-type';
                        break;
                    case 'defaultChartType':
                        newName = 'default-chart-type';
                        break;
                    case 'defaultChartPeriod':
                        newName = 'default-chart-period';
                        break;
                    case 'defaultAccountId':
                        newName = 'default-account-id';
                        break;
                    case 'defaultCurrency':
                        newName = 'default-currency';
                        break;
                    case 'budgetDisplayPercent':
                        newName = 'budget-display-percent';
                        break;
                    case 'budgetDisplayNoThreshold':
                        newName = 'budget-display-no-threshold';
                        break;
                    default:
                        break;
                }

                if (newName !== null) {
                    await Settings.update(userId, s.id, { name: newName });
                    numMigrated++;
                }
            }
            log.info(numMigrated, 'camelCase settings have been migrated.');
            return true;
        } catch (e) {
            log.error('Error while migrating camelCase settings:', e.toString());
            return false;
        }
    },

    async function m21(userId) {
        log.info('Migrating banquepopulaire websites.');
        try {
            let accesses = await Accesses.byBank(userId, { uuid: 'banquepopulaire' });
            const updateBanqueBopulaire = customFields => {
                let newFields = [];
                for (let { name, value } of customFields) {
                    if (name !== 'website') {
                        newFields.push({ name, value });
                        continue;
                    }

                    let newField = { name };
                    switch (value) {
                        case 'www.ibps.alpes.banquepopulaire.fr':
                        case 'www.ibps.loirelyonnais.banquepopulaire.fr':
                        case 'www.ibps.massifcentral.banquepopulaire.fr':
                            newField.value = 'www.ibps.bpaura.banquepopulaire.fr';
                            break;
                        case 'www.ibps.alsace.banquepopulaire.fr':
                        case 'www.ibps.lorrainechampagne.banquepopulaire.fr':
                            newField.value = 'www.ibps.bpalc.banquepopulaire.fr';
                            break;
                        case 'www.ibps.atlantique.banquepopulaire.fr':
                        case 'www.ibps.ouest.banquepopulaire.fr':
                            newField.value = 'www.ibps.bpgo.banquepopulaire.fr';
                            break;
                        case 'www.ibps.bretagnenormandie.cmm.banquepopulaire.fr':
                            newField.value =
                                'www.ibps.cmgo.creditmaritime.groupe.banquepopulaire.fr';
                            break;
                        case 'www.ibps.cotedazure.banquepopulaire.fr':
                        case 'www.ibps.provencecorse.banquepopulaire.fr':
                            newField.value = 'www.ibps.mediterranee.banquepopulaire.fr';
                            break;
                        case 'www.ibps.sudouest.creditmaritime.groupe.banquepopulaire.fr':
                            newField.value = 'www.ibps.bpaca.banquepopulaire.fr';
                            break;
                        default:
                            newField.value = value;
                            break;
                    }

                    newFields.push(newField);
                }
                return newFields;
            };

            for (let access of accesses) {
                await updateCustomFields(userId, access, updateBanqueBopulaire);
            }
        } catch (e) {
            log.error('Error while migrating Banque Populaire websites:', e.toString());
            return false;
        }
        return true;
    },

    async function m22(userId) {
        log.info("Migrating bnporc 'ppold' website to 'pp'");
        try {
            let accesses = await Accesses.byBank(userId, { uuid: 'bnporc' });
            const changePpoldToPp = customFields => {
                for (let customField of customFields) {
                    if (customField.name === 'website' && customField.value === 'ppold') {
                        customField.value = 'pp';
                        break;
                    }
                }

                return customFields;
            };
            for (let access of accesses) {
                await updateCustomFields(userId, access, changePpoldToPp);
            }

            return true;
        } catch (e) {
            log.error("Error while migrating bnporc 'ppold' website to 'pp'", e.toString());
            return false;
        }
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
        let migrationVersion = await Settings.findOrCreateDefault(userId, 'migration-version');
        let firstMigrationIndex = parseInt(migrationVersion.value, 10);

        for (let m = firstMigrationIndex; m < migrations.length; m++) {
            if (!(await migrations[m](userId))) {
                log.error(`Migration #${m} failed, aborting.`);
                return;
            }

            await Settings.updateByKey(userId, 'migration-version', (m + 1).toString());
        }
    }
}
