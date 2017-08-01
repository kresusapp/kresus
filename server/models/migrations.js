import Access from './access';
import Account from './account';
import Alert from './alert';
import Bank from './bank';
import Config from './config';
import Operation from './operation';
import Category from './category';
import Type from './operationtype';

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

let migrations = [

    async function m1() {
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
    },

    async function m2() {
        log.info('Checking that operations with categories are consistent...');
        let ops = await Operation.all();
        let categories = await Category.all();

        let categorySet = new Set;
        for (let c of categories) {
            categorySet.add(c.id);
        }

        let catNum = 0;
        for (let op of ops) {
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

        if (catNum)
            log.info(`\t${catNum} operations had an inconsistent category.`);
    },

    async function m3() {
        log.info('Replacing NONE_CATEGORY_ID by undefined...');
        let ops = await Operation.all();

        let num = 0;
        for (let o of ops) {
            if (typeof o.categoryId !== 'undefined' && o.categoryId.toString() === '-1') {
                delete o.categoryId;
                await o.save();
                num += 1;
            }
        }

        if (num)
            log.info(`\t${num} operations had -1 as categoryId.`);
    },

    async function m4() {
        log.info('Migrating websites to the customFields format...');

        let accesses = await Access.all();
        let num = 0;

        let updateFields = website => customFields => {
            if (customFields.filter(field => field.name === 'website').length)
                return customFields;

            customFields.push({
                name: 'website',
                value: website
            });

            return customFields;
        };

        for (let a of accesses) {
            if (typeof a.website === 'undefined' || !a.website.length)
                continue;

            let website = a.website;
            delete a.website;

            await updateCustomFields(a, updateFields(website));

            await a.save();
            num += 1;
        }

        if (num)
            log.info(`\t${num} accesses updated to the customFields format.`);
    },

    async function m5() {
        log.info('Migrating HelloBank users to BNP and BNP users to the new website format.');
        let accesses = await Access.all();

        let updateFieldsBnp = customFields => {
            if (customFields.filter(field => field.name === 'website').length)
                return customFields;

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

    },

    async function m6() {
        log.info('Ensure "importDate" field is present in accounts.');
        let accounts = await Account.all();
        for (let a of accounts) {
            if (typeof a.importDate !== 'undefined')
                continue;

            log.info(`\t${a.accountNumber} has no importDate.`);

            let ops = await Operation.byAccount(a);

            let dateNumber = Date.now();
            if (ops.length) {
                dateNumber = ops.reduce(reduceOperationsDate, Date.now());
            }

            a.importDate = new Date(dateNumber);
            await a.save();

            log.info(`\tImport date for ${a.title} (${a.accountNumber}): ${a.importDate}`);
        }
    },

    async function m7() {
        log.info('Migrate operationTypeId to type field...');
        let types = [];
        try {
            types = await Type.all();
            if (types.length) {
                let operations = await Operation.allWithOperationTypesId();
                log.info(`${operations.length} operations to migrate`);
                let typeMap = new Map();
                for (let { id, name } of types) {
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
                for (let type of types) {
                    await type.destroy();
                }
            }
        } catch (e) {
            log.error(`Error while updating operation type: ${e}`);
        }
    },

    async function m8() {
        log.info('Ensuring consistency of accounts with alerts...');

        try {
            let accountSet = new Set;

            let accounts = await Account.all();
            for (let account of accounts) {
                accountSet.add(account.accountNumber);
            }

            let alerts = await Alert.all();
            let numOrphans = 0;
            for (let al of alerts) {
                if (!accountSet.has(al.bankAccount)) {
                    numOrphans++;
                    await al.destroy();
                }
            }

            if (numOrphans)
                log.info(`\tfound and removed ${numOrphans} orphan alerts`);
        } catch (e) {
            log.error(`Error while ensuring consistency of alerts: ${e.toString()}`);
        }
    },

    async function m9() {
        log.info('Deleting banks from database');
        try {
            let banks = await Bank.all();
            for (let bank of banks) {
                await bank.destroy();
            }
        } catch (e) {
            log.error(`Error while deleting banks: ${e.toString()}`);
        }
    },

    async function m10() {
        log.info('Looking for a CMB access...');
        try {
            let accesses = await Access.byBank({ uuid: 'cmb' });
            for (let access of accesses) {
                // There is currently no other customFields, no need to update if it is defined.
                if (typeof access.customFields === 'undefined') {
                    log.info('Found CMB access, migrating to "par" website.');
                    const updateCMB = () => ([{ name: 'website', value: 'par' }]);
                    await updateCustomFields(access, updateCMB);
                }
            }
        } catch (e) {
            log.error(`Error while migrating CMB accesses: ${e.toString()}`);
        }
    },

    async function m11() {
        log.info('Looking for an s2e module...');
        try {
            let accesses = await Access.byBank({ uuid: 's2e' });
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
        } catch (e) {
            log.error(`Error while migrating s2e accesses: ${e.toString()}`);
        }
    },

    async function m12() {
        log.info('Searching accounts with IBAN value set to None');
        try {
            let accounts = await Account.all();
            for (let account of accounts.filter(acc => acc.iban === 'None')) {
                log.info(`\tDeleting iban for ${account.title} of bank ${account.bank}`);
                delete account.iban;
                await account.save();
            }
        } catch (e) {
            log.error(`Error while deleting iban with None value: ${e.toString()}`);
        }
    }
];

export async function run() {
    for (let m = 1; m <= migrations.length; m++) {
        const dbMigration = await Config.findOrCreateDefault('db-migration');
        if (dbMigration.value >= m) {
            log.info(`Migration m${m} is already applied, no need to apply again.`);
            continue;
        }

        await migrations[m - 1]();

        dbMigration.value = m;
        await dbMigration.save();
    }
}
