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

import { ConfigGhostSettings } from '../../lib/ghost-settings';
import { makeLogger, UNKNOWN_OPERATION_TYPE } from '../../helpers';

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

function makeRenameField(Model, formerFieldName, newFieldName) {
    return async function(userId) {
        let { displayName = '(some model)' } = Model;
        try {
            log.info(`Renaming ${displayName}.${formerFieldName} to ${newFieldName}`);
            let allEntities = await Model.all(userId);

            for (let entity of allEntities) {
                if (typeof entity.id === 'undefined') {
                    // Could happen for e.g. ghost settings.
                    continue;
                }

                if (typeof entity[formerFieldName] === 'undefined') {
                    // The object might have been migrated already; in this
                    // case, migrating again will clobber the migrated value.
                    // Don't do this!
                    continue;
                }

                await Model.update(userId, entity.id, {
                    [newFieldName]: entity[formerFieldName],
                    [formerFieldName]: null
                });
            }

            return true;
        } catch (e) {
            log.error(
                `Error while renaming field ${displayName}.${formerFieldName} to ${newFieldName}:`,
                e.toString()
            );
            return false;
        }
    };
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
        let weboobLog = await Settings.byKey(userId, 'weboob-log');
        if (weboobLog) {
            log.info('\tDestroying Settings[weboob-log].');
            await Settings.destroy(userId, weboobLog.id);
        }

        let weboobInstalled = await Settings.byKey(userId, 'weboob-installed');
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

            await updateCustomFields(userId, a, updateFields(a.website));

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
            if (a.vendorId === 'bnporc') {
                await updateCustomFields(userId, a, updateFieldsBnp);
                continue;
            }

            if (a.vendorId === 'hellobank') {
                // Update access
                await updateCustomFields(userId, a, updateFieldsHelloBank);

                // Update accounts
                let accounts = await Accounts.byVendorId(userId, { uuid: 'hellobank' });
                for (let acc of accounts) {
                    await Accounts.update(userId, acc.id, { vendorId: 'bnporc' });
                }

                await Accesses.update(userId, a.id, { vendorId: 'bnporc' });
                log.info("\tHelloBank access updated to use BNP's backend.");
                continue;
            }
        }

        return true;
    },

    async function m5(userId) {
        log.info('Ensure "importDate" field is present in accounts.');

        let accounts = await Accounts.all(userId);

        let reducer = (oldest, operation) => {
            let importTimestamp = +new Date(operation.importDate);
            if (isNaN(importTimestamp)) {
                return oldest;
            }
            return Math.min(oldest, importTimestamp);
        };

        for (let a of accounts) {
            if (typeof a.importDate !== 'undefined') {
                continue;
            }

            log.info(`\t${a.vendorAccountId} has no importDate.`);

            let ops = await Transactions.byAccount(userId, a);

            let dateNumber = Date.now();
            if (ops.length) {
                dateNumber = ops.reduce(reducer, Date.now());
            }

            let importDate = new Date(dateNumber);
            await Accounts.update(userId, a.id, { importDate });

            log.info(`\tImport date for ${a.label} (${a.vendorAccountId}): ${importDate}`);
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
                accountSet.add(account.vendorAccountId);
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
            let accesses = await Accesses.byVendorId(userId, { uuid: 's2e' });
            for (let access of accesses) {
                let customFields = JSON.parse(access.customFields);
                let { value: website } = customFields.find(f => f.name === 'website');

                let vendorId = null;
                switch (website) {
                    case 'smartphone.s2e-net.com':
                        log.info('\tMigrating s2e module to bnpere...');
                        vendorId = 'bnppere';
                        break;
                    case 'mobile.capeasi.com':
                        log.info('\tMigrating s2e module to capeasi...');
                        vendorId = 'capeasi';
                        break;
                    case 'm.esalia.com':
                        log.info('\tMigrating s2e module to esalia...');
                        vendorId = 'esalia';
                        break;
                    case 'mobi.ere.hsbc.fr':
                        log.error('\tCannot migrate module s2e.');
                        log.error('\tPlease create a new access using erehsbc module (HSBC ERE).');
                        continue;
                    default:
                        log.error(`Invalid value for s2e module: ${website}`);
                        continue;
                }

                if (vendorId !== null) {
                    await Accesses.update(userId, access.id, { customFields: '[]', vendorId });
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
                log.info(`\tDeleting iban for ${account.label} of bank ${account.vendorId}`);
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
            for (let ghostKey of ConfigGhostSettings.keys()) {
                let found = await Settings.byKey(userId, ghostKey);
                if (found) {
                    await Settings.destroy(userId, found.id);
                    log.info(`\tRemoved ${ghostKey} from the database.`);
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
            let found = await Settings.byKey(userId, 'mail-config');
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
            await Settings.findOrCreateByKey(userId, 'email-recipient', toEmail);

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
                        `Found invalid access.customFields for access with id=${access.id}, replacing by empty array.`
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
        log.info('Linking operations to account by id instead of vendorAccountId');
        try {
            let operations = await Transactions.all(userId);
            let accounts = await Accounts.all(userId);

            let accountsMap = new Map();
            for (let account of accounts) {
                if (accountsMap.has(account.vendorAccountId)) {
                    accountsMap.get(account.vendorAccountId).push(account);
                } else {
                    accountsMap.set(account.vendorAccountId, [account]);
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
                        delete newOp.bankAccount;
                        newOp = await Transactions.create(userId, newOp);
                        newOperations.push(newOp);
                    } else {
                        cloneOperation = true;
                        await Transactions.update(userId, op.id, {
                            accountId: account.id,
                            bankAccount: null
                        });
                        numMigratedOps++;
                    }
                }
            }

            log.info(`${numMigratedOps} operations migrated`);
            log.info(`${numOrphanOps} orphan operations have been removed`);
            log.info(`${newOperations.length} new operations created`);
            log.info('All operations correctly migrated.');

            log.info('Linking alerts to account by id instead of vendorAccountId');
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
                        delete newAlert.bankAccount;
                        newAlert = await Alerts.create(userId, newAlert);
                        newAlerts.push(newAlert);
                    } else {
                        cloneAlert = true;
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
                        `Migrating budget for category ${category.label} with period ${month}/${year}`
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
            let accesses = await Accesses.byVendorId(userId, { uuid: 'cmb' });

            accessLoop: for (let access of accesses) {
                let customFields = JSON.parse(access.customFields);
                for (let customField of customFields) {
                    if (customField.name === 'website') {
                        log.info('Website already set in custom field. Leaving as is');
                        continue accessLoop;
                    }
                }

                customFields.push({ name: 'website', value: 'pro' });

                await Accesses.update(userId, access.id, {
                    customFields: JSON.stringify(customFields)
                });
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
                let newKey = null;
                switch (s.key) {
                    case 'duplicateThreshold':
                        newKey = 'duplicate-threshold';
                        break;
                    case 'duplicateIgnoreDifferentCustomFields':
                        newKey = 'duplicate-ignore-different-custom-fields';
                        break;
                    case 'defaultChartDisplayType':
                        newKey = 'default-chart-display-type';
                        break;
                    case 'defaultChartType':
                        newKey = 'default-chart-type';
                        break;
                    case 'defaultChartPeriod':
                        newKey = 'default-chart-period';
                        break;
                    case 'defaultAccountId':
                        newKey = 'default-account-id';
                        break;
                    case 'defaultCurrency':
                        newKey = 'default-currency';
                        break;
                    case 'budgetDisplayPercent':
                        newKey = 'budget-display-percent';
                        break;
                    case 'budgetDisplayNoThreshold':
                        newKey = 'budget-display-no-threshold';
                        break;
                    default:
                        break;
                }

                if (newKey !== null) {
                    await Settings.update(userId, s.id, { key: newKey });
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
            let accesses = await Accesses.byVendorId(userId, { uuid: 'banquepopulaire' });
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
            let accesses = await Accesses.byVendorId(userId, { uuid: 'bnporc' });
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
    },

    // m23: rename Accounts.initialAmount to initialBalance.
    makeRenameField(Accounts, 'initialAmount', 'initialBalance'),

    async function m24(userId) {
        try {
            log.info("Deleting 'enabled' flag for accesses.");
            let accesses = await Accesses.all(userId);
            for (let access of accesses) {
                let newFields = {};
                if (typeof access.enabled !== 'undefined' && !access.enabled) {
                    newFields.password = null;
                }
                newFields.enabled = null;
                await Accesses.update(userId, access.id, newFields);
            }
            return true;
        } catch (e) {
            log.error('Error while deleting enabled flag for accesses:', e.toString());
            return false;
        }
    },

    // m25: rename Categories.title to Categories.label.
    makeRenameField(Categories, 'title', 'label'),

    // m26: rename Accesses.bank to Accesses.vendorId.
    makeRenameField(Accesses, 'bank', 'vendorId'),

    // m27: rename Accounts.bank to Accounts.vendorId.
    makeRenameField(Accounts, 'bank', 'vendorId'),

    async function m28(userId) {
        try {
            log.info("Migrating accesses' customFields to their own data structure");
            let accesses = await Accesses.all(userId);

            for (let access of accesses) {
                let { customFields } = access;
                // Ignore already migrated accesses.
                if (customFields === null) {
                    continue;
                }

                let fields = [];
                try {
                    fields = JSON.parse(customFields);
                } catch (e) {
                    log.error('Invalid JSON customFields, ignoring fields:', e.toString());
                }

                await Accesses.update(userId, access.id, { customFields: null, fields });
            }
            return true;
        } catch (e) {
            log.error(
                "Error while migrating accesses' customFields to their own data structure:",
                e.toString()
            );
            return false;
        }
    },

    // m28: rename Transactions.raw to Transactions.rawLabel.
    makeRenameField(Transactions, 'raw', 'rawLabel'),

    // m29: rename Transactions.dateImport to Transactions.importDate.
    makeRenameField(Transactions, 'dateImport', 'importDate'),

    // m30: rename Accounts.lastChecked to Accounts.lastCheckDate.
    makeRenameField(Accounts, 'lastChecked', 'lastCheckDate'),

    // m31: rename Accounts.bankAccess to Accounts.accessId.
    makeRenameField(Accounts, 'bankAccess', 'accessId'),

    // m32: rename Accounts.accountNumber to Accounts.vendorAccountId.
    makeRenameField(Accounts, 'accountNumber', 'vendorAccountId'),

    // m33: rename Accounts.title to Accounts.label.
    makeRenameField(Accounts, 'title', 'label'),

    // m34: rename Transactions.title to Transactions.label.
    makeRenameField(Transactions, 'title', 'label'),

    // m35: rename Settings.name to Settings.key.
    async function(userId) {
        try {
            // There's a catch here! Before the migration runs, settings could
            // have been re-created since Settings.createOrFindByKey may
            // encounter misses.
            //
            // Our problem here is that:
            // - we don't want to end up with duplicated settings, otherwise
            // the behavior may be undefined.
            // - we want to be able to run this migration several times if
            // needed (because an import could reset the last migration).
            //
            // We do this in 3 steps:
            // - remember which settings had a key before the renaming.
            // - do the renaming.
            // - after the renaming, check if some settings have been
            // duplicated; if so, remove the one that was present before the
            // migration, since it was transient.

            // 1. Remember previous settings.
            let previousSettings = await Settings.allWithoutGhost(userId);
            let previousIdMap = new Map();
            for (let s of previousSettings) {
                if (typeof s.key !== 'undefined') {
                    previousIdMap.set(s.key, s.id);
                }
            }

            // 2. Do the actual renaming.
            let rename = makeRenameField(Settings, 'name', 'key');
            if (!(await rename(userId))) {
                return false;
            }

            // 3. Remove duplicated settings, if we introduced any.
            let newSettings = await Settings.all(userId);
            for (let s of newSettings) {
                if (previousIdMap.has(s.key)) {
                    if (newSettings.filter(pair => pair.key === s.key).length > 1) {
                        log.info(`Removing duplicated setting ${s.key}...`);
                        await Settings.destroy(userId, previousIdMap.get(s.key));
                        previousIdMap.delete(s.key);
                    }
                }
            }

            return true;
        } catch (e) {
            log.error('Error while cleaning up transient settings:', e.toString());
            return false;
        }
    },

    // m36: remove theme setting from DB
    async function m36(userId) {
        log.info('Removing theme setting from the database (now stored locally).');
        try {
            let found = await Settings.byKey(userId, 'theme');
            if (found) {
                await Settings.destroy(userId, found.id);
                log.info('\tRemoved theme setting from the database.');
            }

            return true;
        } catch (e) {
            log.error(
                'Error while deleting the theme setting from the Settings table.',
                e.toString()
            );
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
