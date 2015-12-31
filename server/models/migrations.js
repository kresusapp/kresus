import Access from './access';
import Account from './account';
import Bank from './bank';
import Config from './config';
import Operation from './operation';
import Category from './category';
import Type from './operationtype';

import { makeLogger } from '../helpers';

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

let migrations = [

    // migration #1: remove weboob-log and weboob-installed from the db
    async function m1() {
        let weboobLog = await Config.byName('weboob-log');
        if (weboobLog) {
            log.info('Destroying Config[weboob-log].');
            await weboobLog.destroy();
        }

        let weboobInstalled = await Config.byName('weboob-installed');
        if (weboobInstalled) {
            log.info('Destroying Config[weboob-installed].');
            await weboobInstalled.destroy();
        }
    },

    // migration #2: check that operations with types and categories are
    // consistent
    async function m2() {
        let ops = await Operation.all();
        let categories = await Category.all();
        let types = await Type.all();

        let typeSet = new Set;
        for (let t of types) {
            typeSet.add(t.id);
        }

        let categorySet = new Set;
        for (let c of categories) {
            categorySet.add(c.id);
        }

        let typeNum = 0;
        let categoryNum = 0;
        for (let op of ops) {
            let needsSave = false;

            if (typeof op.operationTypeID !== 'undefined' &&
                !typeSet.has(op.operationTypeID)) {
                needsSave = true;
                delete op.operationTypeID;
                typeNum += 1;
            }

            if (typeof op.categoryId !== 'undefined' &&
                !categorySet.has(op.categoryId)) {
                needsSave = true;
                delete op.categoryId;
                categoryNum += 1;
            }

            if (needsSave) {
                await op.save();
            }
        }

        if (typeNum)
            log.info(`${typeNum} operations had an inconsistent type.`);
        if (categoryNum)
            log.info(`${categoryNum} operations had an inconsistent category.`);
    },

    // migration #3: replace NONE_CATEGORY_ID by undefined
    async function m3() {
        let ops = await Operation.all();

        let num = 0;
        for (let o of ops) {
            if (typeof o.categoryId !== 'undefined' &&
                o.categoryId.toString() === '-1') {
                delete o.categoryId;
                await o.save();
                num += 1;
            }
        }

        if (num)
            log.info(`${num} operations had -1 as categoryId, now undefined.`);
    },

    // migration #4: migrate websites to the customFields format
    async function m4() {

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
            log.info(`${num} accesses updated to the new customFields format.`);
    },

    // migration #5: migrate HelloBank users to BNP, migrate BNP users to the
    // new website format.
    async function m5() {
        let accesses = await Access.all();

        let updateFieldsBnp = customFields => {
            if (customFields.filter(field => field.name === 'website').length)
                return customFields;
            customFields.push({
                name: 'website',
                value: 'pp'
            });
            log.info('BNP access updated to the new website format.');
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
                log.info('HelloBank access updated to the new website format.');
                continue;
            }
        }

        let banks = await Bank.all();
        for (let b of banks) {
            if (b.uuid !== 'hellobank')
                continue;
            log.info('Removing HelloBank from the list of banks...');
            await b.destroy();
            log.info('done!');
        }
    }

];

export async function run() {
    for (let m of migrations) {
        await m();
    }
}
