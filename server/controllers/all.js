import Bank          from '../models/bank';
import Access        from '../models/access';
import Account       from '../models/account';
import Alert         from '../models/alert';
import Category      from '../models/category';
import Operation     from '../models/operation';
import OperationType from '../models/operationtype';
import Config        from '../models/config';
import Cozy          from '../models/cozyinstance';

import {sendErr, asyncErr} from '../helpers';

let log = require('printit')({
    prefix: 'controllers/all',
    date: true
})

const ERR_MSG_LOADING_ALL = 'Error when loading all Kresus data';

async function GetAllData() {
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
        let ret = await GetAllData();
        res.status(200).send(ret);
    } catch(err) {
        err.code = ERR_MSG_LOADING_ALL;
        return asyncErr(res, err, "when loading all data");
    }
}

// Strip away Couchdb/pouchdb metadata.
function CleanMeta(obj) {
    obj._id = undefined;
    obj._rev = undefined;
}

// Sync function
function CleanData(all) {

    // Bank information is static and shouldn't be exported.
    delete all.banks;

    // Cozy information is very tied to the instance.
    if (all.cozy)
        delete all.cozy;

    let accessMap = {};
    let nextAccessId = 0;

    all.accesses = all.accesses || [];
    for (let a of all.accesses) {
        accessMap[a.id] = nextAccessId;
        a.id = nextAccessId++;
        // Strip away password
        a.password = undefined;
        CleanMeta(a);
    }

    all.accounts = all.accounts || [];
    for (let a of all.accounts) {
        a.bankAccess = accessMap[a.bankAccess];
        // Strip away id
        a.id = undefined;
        CleanMeta(a);
    }

    let categoryMap = {};
    let nextCatId = 0;
    all.categories = all.categories || [];
    for (let c of all.categories) {
        categoryMap[c.id] = nextCatId;
        c.id = nextCatId++;
        CleanMeta(c);
    }

    let opTypeMap = {};
    let nextOpTypeId = 0;
    all.operationtypes = all.operationtypes || [];
    for (let o of all.operationtypes) {
        opTypeMap[o.id] = nextOpTypeId;
        o.id = nextOpTypeId++;
        CleanMeta(o);
    }

    all.operations = all.operations || [];
    for (let o of all.operations) {

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
        o.id = undefined;
        CleanMeta(o);
    }

    all.settings = all.settings || [];
    for (let s of all.settings) {
        s.id = undefined;
        CleanMeta(s);
    }

    all.alerts = all.alerts || [];
    for (let a of all.alerts) {
        a.id = undefined;
        CleanMeta(a);
    }
    return all;
}


module.exports.export = async function(req, res) {
    try {
        let ret = await GetAllData();
        ret.accesses = await Access.all();
        ret = CleanData(ret);
        res.setHeader('Content-Type', 'application/json');
        res.status(200).send(JSON.stringify(ret, null, '   '));
    } catch (err) {
        err.code = ERR_MSG_LOADING_ALL;
        return asyncErr(res, err, "when exporting data");
    }
}

module.exports.import = async function(req, res) {
    if (!req.body.all)
         return sendErr(res, "missing parameter all", 400, "missing parameter 'all' in the file");

    let all = req.body.all;
    all.accesses       = all.accesses       || [];
    all.accounts       = all.accounts       || [];
    all.alerts         = all.alerts         || [];
    all.categories     = all.categories     || [];
    all.operationtypes = all.operationtypes || [];
    all.operations     = all.operations     || [];
    all.settings       = all.settings       || [];

    try {
        log.info(`Importing:
            accesses:        ${all.accesses.length}
            accounts:        ${all.accounts.length}
            alerts:          ${all.alerts.length}
            categories:      ${all.categories.length}
            operation-types: ${all.operationtypes.length}
            settings:        ${all.settings.length}
            operations:      ${all.operations.length}
        `);

        log.info('Import accesses...');
        let accessMap = {};
        for (let access of all.accesses) {
            let accessId = access.id;
            access.id = undefined;
            let created = await Access.create(access);
            accessMap[accessId] = created.id;
        }
        log.info('Done.');

        log.info('Import accounts...');
        for (let account of all.accounts) {
            if (!accessMap[account.bankAccess]) {
                throw { status: 400, message: `unknown bank access ${account.bankAccess}` }
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
        for (let category of all.categories) {
            let catId = category.id;
            category.id = undefined;
            if (existingCategoriesMap.has(category.title)) {
                categoryMap[catId] = existingCategoriesMap.get(category.title).id;
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
        for (let type of all.operationtypes) {
            let opTypeId = type.id;
            type.id = undefined;
            if (existingTypesMap.has(+type.weboobvalue)) {
                opTypeMap[opTypeId] = existingTypesMap.get(+type.weboobvalue).id;
            } else {
                let created = await OperationType.create(type);
                opTypeMap[opTypeId] = created.id;
            }
        }
        log.info('Done.');

        log.info('Import operations...');
        for (let op of all.operations) {
            if (typeof op.categoryId !== 'undefined') {
                if (!categoryMap[op.categoryId]) {
                    throw { status: 400, message: `unknown category ${op.categoryId}` };
                }
                op.categoryId = categoryMap[op.categoryId];
            }
            if (typeof op.operationTypeID !== 'undefined') {
                if (!opTypeMap[op.operationTypeID]) {
                    throw { status: 400, message: `unknown operation type ${op.categoryId}` };
                }
                op.operationTypeID = opTypeMap[op.operationTypeID];
            }
            await Operation.create(op);
        }
        log.info('Done.');

        log.info('Import settings...');
        let existingSettings = await Config.all();
        let existingSettingsMap = new Map;
        for (let s of existingSettings) {
            existingSettingsMap.set(s.name, s);
        }
        for (let setting of all.settings) {
            if (['weboob-log', 'weboob-installed'].indexOf(setting.name) !== -1) {
                continue;
            } else if (existingSettingsMap.has(setting.name)) {
                await existingSettingsMap.get(setting.name).updateAttributes(setting);
            } else {
                await Config.create(setting);
            }
        }
        log.info('Done.');

        log.info('Import alerts...');
        for (let a of all.alerts) {
            await Alert.create(a);
        }
        log.info('Done.');

        log.info("Import finished with success!");
        res.sendStatus(200);
    } catch (err) {
        return asyncErr(res, err, "when importing data");
    }
}

