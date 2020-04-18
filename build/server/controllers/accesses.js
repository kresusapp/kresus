"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("../models");
const accounts_manager_1 = __importDefault(require("../lib/accounts-manager"));
const poller_1 = require("../lib/poller");
const bank_vendors_1 = require("../lib/bank-vendors");
const AccountController = __importStar(require("./accounts"));
const settings_1 = require("./settings");
const helpers_1 = require("../helpers");
const validators_1 = require("../shared/validators");
let log = helpers_1.makeLogger('controllers/accesses');
// Preloads a bank access (sets @access).
async function preloadAccess(req, res, next, accessId) {
    try {
        let { id: userId } = req.user;
        let access = await models_1.Access.find(userId, accessId);
        if (!access) {
            throw new helpers_1.KError('bank access not found', 404);
        }
        req.preloaded = { access };
        return next();
    }
    catch (err) {
        return helpers_1.asyncErr(res, err, 'when finding bank access');
    }
}
exports.preloadAccess = preloadAccess;
async function destroyWithData(userId, access) {
    log.info(`Removing access ${access.id} for bank ${access.vendorId}...`);
    await models_1.Access.destroy(userId, access.id);
    await AccountController.fixupDefaultAccount(userId);
    log.info('Done!');
}
exports.destroyWithData = destroyWithData;
// Destroy a given access, including accounts, alerts and operations.
async function destroy(req, res) {
    try {
        let { user: { id: userId } } = req;
        if (await settings_1.isDemoEnabled(userId)) {
            throw new helpers_1.KError("access deletion isn't allowed in demo mode", 400);
        }
        await destroyWithData(userId, req.preloaded.access);
        res.status(204).end();
    }
    catch (err) {
        return helpers_1.asyncErr(res, err, 'when destroying an access');
    }
}
exports.destroy = destroy;
async function createAndRetrieveData(userId, params) {
    let error = validators_1.checkHasAllFields(params, ['vendorId', 'login', 'password']) ||
        validators_1.checkAllowedFields(params, ['vendorId', 'login', 'password', 'fields', 'customLabel']);
    if (error) {
        throw new helpers_1.KError(`when creating a new access: ${error}`, 400);
    }
    let access = null;
    try {
        access = await models_1.Access.create(userId, params);
        await accounts_manager_1.default.retrieveAndAddAccountsByAccess(userId, access, /* interactive */ true);
        let { accounts, newOperations } = await accounts_manager_1.default.retrieveOperationsByAccess(userId, access, 
        /* ignoreLastFetchDate */ false, 
        /* isInteractive */ true);
        return {
            accessId: access.id,
            accounts,
            newOperations
        };
    }
    catch (err) {
        log.error('The access process creation failed, cleaning up...');
        // Let sql remove all the dependent data for us.
        if (access !== null) {
            log.info('\tdeleting access...');
            await models_1.Access.destroy(userId, access.id);
        }
        // Rethrow the error
        throw err;
    }
}
exports.createAndRetrieveData = createAndRetrieveData;
// Creates a new bank access (expecting at least (vendorId / login /
// password)), and retrieves its accounts and operations.
async function create(req, res) {
    try {
        let { user: { id: userId } } = req;
        if (await settings_1.isDemoEnabled(userId)) {
            throw new helpers_1.KError("access creation isn't allowed in demo mode", 400);
        }
        const data = await createAndRetrieveData(userId, req.body);
        res.status(201).json(data);
    }
    catch (err) {
        return helpers_1.asyncErr(res, err, 'when creating a bank access');
    }
}
exports.create = create;
// Fetch operations using the backend and return the operations to the client.
async function fetchOperations(req, res) {
    try {
        let { id: userId } = req.user;
        let access = req.preloaded.access;
        let bankVendor = bank_vendors_1.bankVendorByUuid(access.vendorId);
        if (!access.isEnabled() || bankVendor.deprecated) {
            let errcode = helpers_1.getErrorCode('DISABLED_ACCESS');
            throw new helpers_1.KError('disabled access', 403, errcode);
        }
        let { accounts, newOperations } = await accounts_manager_1.default.retrieveOperationsByAccess(userId, access, 
        /* ignoreLastFetchDate */ false, 
        /* isInteractive */ true);
        res.status(200).json({
            accounts,
            newOperations
        });
    }
    catch (err) {
        return helpers_1.asyncErr(res, err, 'when fetching operations');
    }
}
exports.fetchOperations = fetchOperations;
// Fetch accounts, including new accounts, and operations using the backend and
// return both to the client.
async function fetchAccounts(req, res) {
    try {
        let { id: userId } = req.user;
        let access = req.preloaded.access;
        let bankVendor = bank_vendors_1.bankVendorByUuid(access.vendorId);
        if (!access.isEnabled() || bankVendor.deprecated) {
            let errcode = helpers_1.getErrorCode('DISABLED_ACCESS');
            throw new helpers_1.KError('disabled access', 403, errcode);
        }
        await accounts_manager_1.default.retrieveAndAddAccountsByAccess(userId, access, /* interactive */ true);
        let { accounts, newOperations } = await accounts_manager_1.default.retrieveOperationsByAccess(userId, access, 
        /* ignoreLastFetchDate */ true, 
        /* isInteractive */ true);
        res.status(200).json({
            accounts,
            newOperations
        });
    }
    catch (err) {
        return helpers_1.asyncErr(res, err, 'when fetching accounts');
    }
}
exports.fetchAccounts = fetchAccounts;
// Fetch all the operations / accounts for all the accesses, as is done during
// any regular poll.
async function poll(req, res) {
    try {
        let { id: userId } = req.user;
        await poller_1.fullPoll(userId);
        res.status(200).json({
            status: 'OK'
        });
    }
    catch (err) {
        log.warn(`Error when doing a full poll: ${err.message}`);
        res.status(500).json({
            status: 'error',
            message: err.message
        });
    }
}
exports.poll = poll;
// Updates a bank access.
async function update(req, res) {
    try {
        let { id: userId } = req.user;
        let { access } = req.preloaded;
        let attrs = req.body;
        let error = validators_1.checkAllowedFields(attrs, ['enabled', 'customLabel']);
        if (error) {
            throw new helpers_1.KError(`when updating an access: ${error}`, 400);
        }
        if (attrs.enabled === false) {
            attrs.password = null;
            delete attrs.enabled;
        }
        if (attrs.customLabel === '') {
            attrs.customLabel = null;
        }
        await models_1.Access.update(userId, access.id, attrs);
        res.status(201).json({ status: 'OK' });
    }
    catch (err) {
        return helpers_1.asyncErr(res, err, 'when updating bank access');
    }
}
exports.update = update;
async function updateAndFetchAccounts(req, res) {
    try {
        let { id: userId } = req.user;
        let { access } = req.preloaded;
        let attrs = req.body;
        let error = validators_1.checkAllowedFields(attrs, ['login', 'password', 'fields']);
        if (error) {
            throw new helpers_1.KError(`when updating and polling an access: ${error}`, 400);
        }
        if (typeof attrs.fields !== 'undefined') {
            let newFields = attrs.fields;
            delete attrs.fields;
            for (let { name, value } of newFields) {
                let previous = access.fields.find(existing => existing.name === name);
                if (value === null) {
                    // Delete the custom field if necessary.
                    if (typeof previous !== 'undefined') {
                        await models_1.AccessField.destroy(userId, previous.id);
                    }
                }
                else if (typeof previous !== 'undefined') {
                    // Update the custom field if necessary.
                    if (previous.value !== value) {
                        await models_1.AccessField.update(userId, previous.id, { name, value });
                    }
                }
                else {
                    // Create it.
                    await models_1.AccessField.create(userId, { name, value, accessId: access.id });
                }
            }
        }
        // The preloaded access needs to be updated before calling fetchAccounts.
        req.preloaded.access = await models_1.Access.update(userId, access.id, attrs);
        await fetchAccounts(req, res);
    }
    catch (err) {
        return helpers_1.asyncErr(res, err, 'when updating and fetching bank access');
    }
}
exports.updateAndFetchAccounts = updateAndFetchAccounts;
