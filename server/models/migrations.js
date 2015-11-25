import Access from './access';
import Config from './config';
import Operation from './operation';
import Category from './category';
import Type from './operationtype';

import {makeLogger} from '../helpers';

let log = makeLogger('models/migrations');

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

// migration #2: check that operations with types and categories are consistent
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

    let typeCount = 0;
    let categoryCount = 0;
    for (let op of ops) {
        let needsSave = false;

        if (typeof op.operationTypeID !== 'undefined' && !typeSet.has(op.operationTypeID)) {
            needsSave = true;
            op.operationTypeID = undefined;
            typeCount += 1;
        }

        if (typeof op.categoryId !== 'undefined' && !categorySet.has(op.categoryId)) {
            needsSave = true;
            op.categoryId = undefined;
            categoryCount += 1;
        }

        if (needsSave) {
            await op.save();
        }
    }

    if (typeCount)
        log.info(`${typeCount} operations had an inconsistent operationTypeID value.`);
    if (categoryCount)
        log.info(`${categoryCount} operations had an inconsistent categoryId value.`);
},

// migration #3: replace NONE_CATEGORY_ID by undefined
async function m3() {
    let ops = await Operation.all();

    let count = 0;
    for (let o of ops) {
        if (typeof o.categoryId !== 'undefined' && o.categoryId.toString() === '-1') {
            o.categoryId = undefined;
            await o.save();
            count += 1;
        }
    }

    if (count)
        log.info(`${count} operations had categoryId === -1, replaced to undefined.`);
},

// migration #4: migrate websites to the customFields format
async function m4() {

    let accesses = await Access.all();
    let count = 0;

    for (let a of accesses) {
        if (typeof a.website === 'undefined' || !a.website.length)
            continue;

        let website = a.website;
        a.website = undefined;
        a.customFields = JSON.parse(a.customFields || '[]');
        a.customFields.push({
            name: 'website',
            value: website
        });
        a.customFields = JSON.stringify(a.customFields);

        await a.save();
        count += 1;
    }

    if (count)
        log.info(`${count} accesses' websites updated to the new customFields format.`);
}

];

export async function run() {
    for (let m of migrations) {
        await m();
    }
}
