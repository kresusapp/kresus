let log = require('printit')({
    prefix: 'models/migrations',
    date: true
});

import Config from './config';
import Operation from './operation';
import Category from './category';
import Type from './operationtype';

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
}

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
        let attr = null;

        if (typeof op.operationTypeID !== 'undefined' && !typeSet.has(op.operationTypeID)) {
            attr = attr || {};
            attr.operationTypeID = undefined;
            typeCount += 1;
        }

        if (typeof op.categoryId !== 'undefined' && !categorySet.has(op.categoryId)) {
            attr = attr || {};
            attr.categoryId = undefined;
            categoryCount += 1;
        }

        if (attr !== null) {
            await op.updateAttributes(attr);
        }
    }

    if (typeCount)
        log.info(`${typeCount} operations had an inconsistent operationTypeID value.`);
    if (categoryCount)
        log.info(`${categoryCount} operations had an inconsistent categoryId value.`);
}

export async function run() {
    await m1();
    await m2();
}
