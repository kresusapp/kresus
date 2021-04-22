"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAndFetchAccounts = exports.update = exports.poll = exports.fetchAccounts = exports.fetchOperations = exports.create = exports.createAndRetrieveData = exports.extractUserActionFields = exports.deleteSession = exports.destroy = exports.destroyWithData = exports.preloadAccess = void 0;
const models_1 = require("../models");
const accounts_manager_1 = __importStar(require("../lib/accounts-manager"));
const poller_1 = require("../lib/poller");
const bank_vendors_1 = require("../lib/bank-vendors");
const all_1 = require("./all");
const AccountController = __importStar(require("./accounts"));
const instance_1 = require("./instance");
const helpers_1 = require("../helpers");
const validators_1 = require("../shared/validators");
const log = helpers_1.makeLogger('controllers/accesses');
// Preloads a bank access (sets @access).
async function preloadAccess(req, res, nextHandler, accessId) {
    try {
        const { id: userId } = req.user;
        const access = await models_1.Access.find(userId, accessId);
        if (!access) {
            throw new helpers_1.KError('bank access not found', 404);
        }
        req.preloaded = { access };
        nextHandler();
    }
    catch (err) {
        helpers_1.asyncErr(res, err, 'when finding bank access');
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
        const { user: { id: userId }, } = req;
        if (await instance_1.isDemoEnabled(userId)) {
            throw new helpers_1.KError("access deletion isn't allowed in demo mode", 400);
        }
        await destroyWithData(userId, req.preloaded.access);
        res.status(204).end();
    }
    catch (err) {
        helpers_1.asyncErr(res, err, 'when destroying an access');
    }
}
exports.destroy = destroy;
async function deleteSession(req, res) {
    try {
        const { user: { id: userId }, } = req;
        const { access } = req.preloaded;
        const session = accounts_manager_1.getUserSession(userId);
        await session.reset(access);
        res.status(204).end();
    }
    catch (err) {
        helpers_1.asyncErr(res, err, 'when deleting an access session');
    }
}
exports.deleteSession = deleteSession;
function extractUserActionFields(body) {
    const fields = (body.userActionFields || null);
    delete body.userActionFields;
    return fields;
}
exports.extractUserActionFields = extractUserActionFields;
async function createAndRetrieveData(userId, params) {
    const error = validators_1.hasMissingField(params, ['vendorId', 'login', 'password']) ||
        validators_1.hasForbiddenField(params, [
            'vendorId',
            'login',
            'password',
            'fields',
            'customLabel',
            'userActionFields',
        ]);
    if (error) {
        throw new helpers_1.KError(`when creating a new access: ${error}`, 400);
    }
    const userActionFields = extractUserActionFields(params);
    let access = null;
    try {
        if (userActionFields !== null) {
            access = await models_1.Access.byCredentials(userId, {
                uuid: params.vendorId,
                login: params.login,
            });
        }
        else {
            access = await models_1.Access.create(userId, params);
        }
        const accountResponse = await accounts_manager_1.default.retrieveAndAddAccountsByAccess(userId, access, 
        /* interactive */ true, userActionFields);
        if (accountResponse.kind === 'user_action') {
            // The whole system relies on the Access object existing (in
            // particular, the session with 2fa information is tied to the
            // Access), so we can't delete the Access object here.
            //
            // Unfortunately, because of 2fa, this means the user can abort the
            // access creation and leave an inconsistent state in the database,
            // where we have an Access but there's no Account/Transaction tied.
            //
            // So we register a special task that gets run on /api/all (= next
            // loading of Kresus), which will clean the access if it has no
            // associated accounts, as a proxy of meaning the 2fa has never
            // completed.
            const prevAccess = access;
            all_1.registerStartupTask(userId, async () => {
                const accounts = await models_1.Account.byAccess(userId, prevAccess);
                if (accounts.length === 0) {
                    log.info(`Cleaning up incomplete access with id ${prevAccess.id}`);
                    await models_1.Access.destroy(userId, prevAccess.id);
                }
            });
            return accountResponse;
        }
        const transactionResponse = await accounts_manager_1.default.retrieveOperationsByAccess(userId, access, 
        /* ignoreLastFetchDate */ false, 
        /* isInteractive */ true, userActionFields);
        helpers_1.assert(transactionResponse.kind !== 'user_action', 'user action should have been requested when fetching accounts');
        const { accounts, createdTransactions: newOperations } = transactionResponse.value;
        return {
            kind: 'value',
            value: {
                accessId: access.id,
                accounts,
                newOperations,
                label: bank_vendors_1.bankVendorByUuid(access.vendorId).name,
            },
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
        const { user: { id: userId }, } = req;
        if (await instance_1.isDemoEnabled(userId)) {
            throw new helpers_1.KError("access creation isn't allowed in demo mode", 400);
        }
        const data = await createAndRetrieveData(userId, req.body);
        if (data.kind === 'user_action') {
            res.status(200).json(data);
        }
        else {
            res.status(201).json(data.value);
        }
    }
    catch (err) {
        helpers_1.asyncErr(res, err, 'when creating a bank access');
    }
}
exports.create = create;
// Fetch operations using the backend and return the operations to the client.
async function fetchOperations(req, res) {
    try {
        const { id: userId } = req.user;
        const access = req.preloaded.access;
        const bankVendor = bank_vendors_1.bankVendorByUuid(access.vendorId);
        if (!access.isEnabled() || bankVendor.deprecated) {
            const errcode = helpers_1.getErrorCode('DISABLED_ACCESS');
            throw new helpers_1.KError('disabled or deprecated access', 403, errcode);
        }
        const userActionFields = extractUserActionFields(req.body);
        const transactionResponse = await accounts_manager_1.default.retrieveOperationsByAccess(userId, access, 
        /* ignoreLastFetchDate */ false, 
        /* isInteractive */ true, userActionFields);
        if (transactionResponse.kind === 'user_action') {
            res.status(200).json(transactionResponse);
            return;
        }
        const { accounts, createdTransactions: newOperations } = transactionResponse.value;
        res.status(200).json({
            accounts,
            newOperations,
        });
    }
    catch (err) {
        helpers_1.asyncErr(res, err, 'when fetching operations');
    }
}
exports.fetchOperations = fetchOperations;
// Fetch accounts, including new accounts, and operations using the backend and
// return both to the client.
async function fetchAccounts(req, res) {
    try {
        const { id: userId } = req.user;
        const access = req.preloaded.access;
        const bankVendor = bank_vendors_1.bankVendorByUuid(access.vendorId);
        if (!access.isEnabled() || bankVendor.deprecated) {
            const errcode = helpers_1.getErrorCode('DISABLED_ACCESS');
            throw new helpers_1.KError('disabled access', 403, errcode);
        }
        const userActionFields = extractUserActionFields(req.body);
        const accountResponse = await accounts_manager_1.default.retrieveAndAddAccountsByAccess(userId, access, 
        /* interactive */ true, userActionFields);
        if (accountResponse.kind === 'user_action') {
            res.status(200).json(accountResponse);
            return;
        }
        const transactionResponse = await accounts_manager_1.default.retrieveOperationsByAccess(userId, access, 
        /* ignoreLastFetchDate */ true, 
        /* isInteractive */ true, userActionFields);
        helpers_1.assert(transactionResponse.kind !== 'user_action', 'user action should have been requested when fetching accounts');
        const { accounts, createdTransactions: newOperations } = transactionResponse.value;
        res.status(200).json({
            accounts,
            newOperations,
        });
    }
    catch (err) {
        helpers_1.asyncErr(res, err, 'when fetching accounts');
    }
}
exports.fetchAccounts = fetchAccounts;
// Fetch all the operations / accounts for all the accesses, as is done during
// any regular poll.
async function poll(req, res) {
    try {
        const { id: userId } = req.user;
        await poller_1.fullPoll(userId);
        res.status(200).json({
            status: 'OK',
        });
    }
    catch (err) {
        log.warn(`Error when doing a full poll: ${err.message}`);
        res.status(500).json({
            status: 'error',
            message: err.message,
        });
    }
}
exports.poll = poll;
// Updates a bank access.
async function update(req, res) {
    try {
        const { id: userId } = req.user;
        const { access } = req.preloaded;
        const attrs = req.body;
        const error = validators_1.hasForbiddenField(attrs, ['enabled', 'customLabel']);
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
        helpers_1.asyncErr(res, err, 'when updating bank access');
    }
}
exports.update = update;
async function updateAndFetchAccounts(req, res) {
    try {
        const { id: userId } = req.user;
        const { access } = req.preloaded;
        const attrs = req.body;
        const error = validators_1.hasForbiddenField(attrs, ['login', 'password', 'fields', 'userActionFields']);
        if (error) {
            throw new helpers_1.KError(`when updating and polling an access: ${error}`, 400);
        }
        // Hack: temporarily remove userActionFields from the entity, so the
        // ORM accepts it. Oh well.
        const { userActionFields } = attrs;
        delete attrs.userActionFields;
        if (typeof attrs.fields !== 'undefined') {
            const newFields = attrs.fields;
            delete attrs.fields;
            for (const { name, value } of newFields) {
                const previous = access.fields.find(existing => existing.name === name);
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
        // Hack: reset userActionFields (see above comment).
        req.body.userActionFields = userActionFields;
        await fetchAccounts(req, res);
    }
    catch (err) {
        helpers_1.asyncErr(res, err, 'when updating and fetching bank access');
    }
}
exports.updateAndFetchAccounts = updateAndFetchAccounts;
