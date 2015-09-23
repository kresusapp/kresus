let Bank          = require('../models/bank');
let Access        = require('../models/access');
let Account       = require('../models/account');
let Category      = require('../models/category');
let Operation     = require('../models/operation');
let OperationType = require('../models/operationtype');
let Config        = require('../models/kresusconfig');
let Cozy          = require('../models/cozyinstance');
let h             = require('../helpers');

let async = require('async');

let log = require('printit')({
    prefix: 'controllers/all',
    date: true
})

const ERR_MSG_LOADING_ALL = 'Error when loading all Kresus data';

function GetAllData(cb) {
    function errorFunc(err, object) {
        cb(`when loading ${object}: ${err}`);
        return
    }

    let ret = {};
    Bank.all((err, banks) => {
        if (err)
            return errorFunc(err, 'banks');
        ret.banks = banks;

        Account.all((err, accounts) => {
            if (err)
                return errorFunc(err, 'accounts');
            ret.accounts = accounts

            Operation.all((err, ops) => {
                if (err)
                    return errorFunc(err, 'operations');
                ret.operations = ops;

                OperationType.all((err, types) => {
                    if (err)
                        return errorFunc(err, 'operationtypes');
                    ret.operationtypes = types;

                    Category.all((err, cats) => {
                        if (err)
                            return errorFunc(err, 'categories');
                        ret.categories = cats;

                        Config.all((err, configs) => {
                            if (err)
                                return errorFunc(err, 'configs');
                            ret.settings = configs;

                            Cozy.all((err, cozy) => {
                                if (err)
                                    return errorFunc(err, 'cozy');
                                ret.cozy = cozy;
                                cb(null, ret);
                            });
                        });
                    });
                });
            });
        });
    });
}


export function all(req, res) {
    GetAllData((err, ret) => {
        if (err)
            return h.sendErr(res, err, 500, ERR_MSG_LOADING_ALL);
        res.status(200).send(ret);
    });
}

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
    }

    all.accounts = all.accounts || [];
    for (let a of all.accounts) {
        a.bankAccess = accessMap[a.bankAccess];
        // Strip away id
        a.id = undefined;
    }

    let categoryMap = {};
    let nextCatId = 0;
    all.categories = all.categories || [];
    for (let c of all.categories) {
        categoryMap[c.id] = nextCatId;
        c.id = nextCatId++;
    }

    let opTypeMap = {};
    let nextOpTypeId = 0;
    all.operationtypes = all.operationtypes || [];
    for (let o of all.operationtypes) {
        opTypeMap[o.id] = nextOpTypeId;
        o.id = nextOpTypeId++;
    }

    all.operations = all.operations || [];
    for (let o of all.operations) {

        if (typeof o.categoryId !== 'undefined') {
            let cid = o.categoryId;
            if (+cid === -1) // None category
                o.categoryId = undefined;
            else if (typeof categoryMap[cid] === 'undefined')
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
    }

    all.settings = all.settings || [];
    all.settings = all.settings.filter(s => ['weboob-log', 'weboob-installed'].indexOf(s.name) === -1);
    for (let s of all.settings) {
        s.id = undefined;
    }
    return all;
}


module.exports.export = function(req, res) {
    GetAllData((err, ret) => {
        if (err)
            return h.sendErr(res, err, 500, ERR_MSG_LOADING_ALL);

        Access.all((err, accesses) => {
            if (err)
                return h.sendErr(res, 'when loading accesses', 500, ERR_MSG_LOADING_ALL);

            ret.accesses = accesses;

            CleanData(ret);

            res.setHeader('Content-Type', 'application/json');
            res.status(200).send(JSON.stringify(ret, null, '   '));
        });
    });
}

module.exports.import = function(req, res) {
    if (!req.body.all)
         return h.sendErr(res, "missing parameter all", 400, "missing parameter 'all' in the file");

    let all = req.body.all;
    all.accesses       = all.accesses       || [];
    all.accounts       = all.accounts       || [];
    all.categories     = all.categories     || [];
    all.operationtypes = all.operationtypes || [];
    all.operations     = all.operations     || [];
    all.settings       = all.settings       || [];

    let accessMap = {};
    function importAccess(access, cb) {
        let accessId = access.id;
        access.id = undefined;
        Access.create(access, (err, created) => {
            if (err)
                return cb(err);
            accessMap[accessId] = created.id;
            cb(null, created);
        });
    }

    function importAccount(account, cb) {
        if (!accessMap[account.bankAccess])
            return h.sendErr(res, `unknown bank access ${account.bankAccess}`, 400, "unknown bank access");
        account.bankAccess = accessMap[account.bankAccess];
        Account.create(account, cb);
    }

    let categoryMap = {};
    function importCategory(cat, cb) {
        let catId = cat.id;
        cat.id = undefined;
        Category.create(cat, (err, created) => {
            if (err)
                return cb(err);
            categoryMap[catId] = created.id;
            cb(null, created);
        });
    }

    let opTypeMap = {};
    function importOperationType(type, cb) {
        let opTypeId = type.id;
        type.id = undefined;
        OperationType.create(type, (err, created) => {
            if (err)
                return cb(err);
            opTypeMap[opTypeId] = created.id;
            cb(null, created);
        });
    }

    function importOperation(op, cb) {
        if (typeof op.categoryId !== 'undefined') {
            if (!categoryMap[op.categoryId])
                return h.sendErr(res, `unknown category ${op.categoryId}`, 400, "unknown category");
            op.categoryId = categoryMap[op.categoryId];
        }

        if (typeof op.operationTypeID !== 'undefined') {
            if (!opTypeMap[op.operationTypeID])
                return h.sendErr(res, `unknown operation type ${op.operationTypeID}`, 400, "unknown operation type");
            op.operationTypeID = opTypeMap[op.operationTypeID];
        }

        Operation.create(op, cb);
    }

    let importSetting = Config.create.bind(Config);

    log.info(`Importing:
    accesses:        ${all.accesses.length}
    accounts:        ${all.accounts.length}
    categories:      ${all.categories.length}
    operation-types: ${all.operationtypes.length}
    operations:      ${all.operations.length}
    settings:        ${all.settings.length}
    `);

    async.each(all.accesses, importAccess, err => {
        if (err)
            return h.sendErr(res, `When creating access: ${err.toString()}`);

        async.each(all.accounts, importAccount, err => {
            if (err)
                return h.sendErr(res, `When creating account: ${err.toString()}`);

            async.each(all.categories, importCategory, err => {
                if (err)
                    return h.sendErr(res, `When creating category: ${err.toString()}`);

                async.each(all.operationtypes, importOperationType, err => {
                    if (err)
                        return h.sendErr(res, `When creating operation type: ${err.toString()}`);

                    async.eachSeries(all.operations, importOperation, err => {
                        if (err)
                            return h.sendErr(res, `When creating operation: ${err.toString()}`);

                        async.each(all.settings, importSetting, err => {
                            if (err)
                                return h.sendErr(res, `When creating setting: ${err.toString()}`);

                            log.info("Import finished with success!");
                            res.sendStatus(200);
                        });
                    });
                });
            });
        });
    });
}

