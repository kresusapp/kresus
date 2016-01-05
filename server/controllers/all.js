import Bank          from '../models/bank';
import Access        from '../models/access';
import Account       from '../models/account';
import Alert         from '../models/alert';
import Category      from '../models/category';
import Operation     from '../models/operation';
import OperationType from '../models/operationtype';
import Config        from '../models/config';
import Cozy          from '../models/cozyinstance';

import { makeLogger, sendErr, asyncErr } from '../helpers';

let log = makeLogger('controllers/all');

const ERR_MSG_LOADING_ALL = 'Error when loading all Kresus data';

async function getAllData() {
    let ret = {};
    ret.accounts = await Account.all();
    ret.alerts = await Alert.all();
    ret.banks = await Bank.all();
    ret.categories = await Category.all();
    ret.cozy = await Cozy.all();
    ret.operations = await Operation.all();
    ret.operationtypes = await OperationType.all();
    ret.settings = await Config.all();
    return ret;
}

export async function all(req, res) {
    try {
        let ret = await getAllData();
        res.status(200).send(ret);
    } catch (err) {
        err.code = ERR_MSG_LOADING_ALL;
        return asyncErr(res, err, 'when loading all data');
    }
}

// Strip away Couchdb/pouchdb metadata.
function cleanMeta(obj) {
    delete obj._id;
    delete obj._rev;
}

// Sync function
function cleanData(world) {

    // Bank information is static and shouldn't be exported.
    delete world.banks;

    // Cozy information is very tied to the instance.
    if (world.cozy)
        delete world.cozy;

    let accessMap = {};
    let nextAccessId = 0;

    world.accesses = world.accesses || [];
    for (let a of world.accesses) {
        accessMap[a.id] = nextAccessId;
        a.id = nextAccessId++;
        // Strip away password
        delete a.password;
        cleanMeta(a);
    }

    world.accounts = world.accounts || [];
    for (let a of world.accounts) {
        a.bankAccess = accessMap[a.bankAccess];
        // Strip away id
        delete a.id;
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

    let opTypeMap = {};
    let nextOpTypeId = 0;
    world.operationtypes = world.operationtypes || [];
    for (let o of world.operationtypes) {
        opTypeMap[o.id] = nextOpTypeId;
        o.id = nextOpTypeId++;
        cleanMeta(o);
    }

    world.operations = world.operations || [];
    for (let o of world.operations) {

        if (typeof o.categoryId !== 'undefined') {
            let cid = o.categoryId;
            if (typeof categoryMap[cid] === 'undefined')
                log.warn(`unexpected category id: ${cid}`);
            else
                o.categoryId = categoryMap[cid];
        }

        if (typeof o.operationTypeID !== 'undefined') {
            let oid = o.operationTypeID;
            if (typeof opTypeMap[oid] === 'undefined')
                log.warn(`unexpected operation type id: ${oid}`);
            else
                o.operationTypeID = opTypeMap[oid];
        }

        // Strip away id
        delete o.id;
        cleanMeta(o);
    }

    world.settings = world.settings || [];
    for (let s of world.settings) {
        delete s.id;
        cleanMeta(s);
    }

    world.alerts = world.alerts || [];
    for (let a of world.alerts) {
        delete a.id;
        cleanMeta(a);
    }
    return world;
}


module.exports.export = async function(req, res) {
    try {
        let ret = await getAllData();
        ret.accesses = await Access.all();
        ret = cleanData(ret);
        res.setHeader('Content-Type', 'application/json');
        res.status(200).send(JSON.stringify(ret, null, '   '));
    } catch (err) {
        err.code = ERR_MSG_LOADING_ALL;
        return asyncErr(res, err, 'when exporting data');
    }
};

module.exports.import = async function(req, res) {
    if (!req.body.all)
        return sendErr(res, 'missing parameter all', 400,
                       "missing parameter 'all' in the file");

    let world = req.body.all;
    world.accesses       = world.accesses       || [];
    world.accounts       = world.accounts       || [];
    world.alerts         = world.alerts         || [];
    world.categories     = world.categories     || [];
    world.operationtypes = world.operationtypes || [];
    world.operations     = world.operations     || [];
    world.settings       = world.settings       || [];

    try {
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
        for (let account of world.accounts) {
            if (!accessMap[account.bankAccess]) {
                throw { status: 400,
                        message: `unknown bank access ${account.bankAccess}` };
            }
            account.bankAccess = accessMap[account.bankAccess];
            await Account.create(account);
        }
        log.info('Done.');

        log.info('Import categories...');
        let existingCategories = await Category.all();
        let existingCategoriesMap = new Map;
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

        log.info('Import operation types...');
        let existingTypes = await OperationType.all();
        let existingTypesMap = new Map;
        for (let t of existingTypes) {
            existingTypesMap.set(+t.weboobvalue, t);
        }

        let opTypeMap = {};
        for (let type of world.operationtypes) {
            let opTypeId = type.id;
            delete type.id;
            if (existingTypesMap.has(+type.weboobvalue)) {
                let existing = existingTypesMap.get(+type.weboobvalue);
                opTypeMap[opTypeId] = existing.id;
            } else {
                let created = await OperationType.create(type);
                opTypeMap[opTypeId] = created.id;
            }
        }
        log.info('Done.');

        log.info('Import operations...');
        for (let op of world.operations) {
            let categoryId = op.categoryId;
            if (typeof categoryId !== 'undefined') {
                if (!categoryMap[categoryId]) {
                    throw { status: 400,
                            message: `unknown category ${categoryId}` };
                }
                op.categoryId = categoryMap[categoryId];
            }
            let operationTypeID = op.operationTypeID;
            if (typeof operationTypeID !== 'undefined') {
                if (!opTypeMap[operationTypeID]) {
                    throw { status: 400,
                            message: `unknown type ${op.operationTypeID}` };
                }
                op.operationTypeID = opTypeMap[operationTypeID];
            }
            await Operation.create(op);
        }
        log.info('Done.');

        log.info('Import settings...');
        for (let setting of world.settings) {
            if (setting.name === 'weboob-log' ||
                setting.name === 'weboob-installed')
                continue;

            // Note that former existing values are not clobbered!
            await Config.findOrCreateByName(setting.name, setting.value);
        }
        log.info('Done.');

        log.info('Import alerts...');
        for (let a of world.alerts) {
            await Alert.create(a);
        }
        log.info('Done.');

        log.info('Import finished with success!');
        res.sendStatus(200);
    } catch (err) {
        return asyncErr(res, err, 'when importing data');
    }
};
