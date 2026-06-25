"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.preloadAccess = preloadAccess;
exports.destroyWithData = destroyWithData;
exports.destroy = destroy;
exports.deleteSession = deleteSession;
exports.extractUserActionFields = extractUserActionFields;
exports.createAndRetrieveData = createAndRetrieveData;
exports.create = create;
exports.fetchAccountsAndTransactions = fetchAccountsAndTransactions;
exports.fetchTransactions = fetchTransactions;
exports.poll = poll;
exports.update = update;
exports.updateAndFetchAccounts = updateAndFetchAccounts;
const models_1 = require("../models");
const accounts_manager_1 = __importStar(require("../lib/accounts-manager"));
const poller_1 = require("../lib/poller");
const providers_1 = require("../providers");
const all_1 = require("./all");
const AccountController = __importStar(require("./accounts"));
const instance_1 = require("./instance");
const helpers_1 = require("../helpers");
const validators_1 = require("../shared/validators");
const log = (0, helpers_1.makeLogger)('controllers/accesses');
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
        (0, helpers_1.asyncErr)(res, err, 'when finding bank access');
    }
}
async function destroyWithData(userId, access) {
    log.info(`Removing access ${access.id} for bank ${access.vendorId}...`);
    await models_1.Access.destroy(userId, access.id);
    await AccountController.fixupDefaultAccount(userId);
    log.info('Done!');
}
// Destroy a given access, including accounts, alerts and transactions.
async function destroy(req, res) {
    try {
        const { user: { id: userId }, } = req;
        if (await (0, instance_1.isDemoEnabled)(userId)) {
            throw new helpers_1.KError("access deletion isn't allowed in demo mode", 400);
        }
        await destroyWithData(userId, req.preloaded.access);
        res.status(204).end();
    }
    catch (err) {
        (0, helpers_1.asyncErr)(res, err, 'when destroying an access');
    }
}
async function deleteSession(req, res) {
    try {
        const { user: { id: userId }, } = req;
        const { access } = req.preloaded;
        const session = accounts_manager_1.GLOBAL_CONTEXT.getUserSession(userId);
        await session.reset(access);
        res.status(204).end();
    }
    catch (err) {
        (0, helpers_1.asyncErr)(res, err, 'when deleting an access session');
    }
}
function extractUserActionFields(body) {
    if (!body) {
        return null;
    }
    const fields = (body.userActionFields || null);
    delete body.userActionFields;
    return fields;
}
async function createAndRetrieveData(userId, params, storeCredentials = true) {
    const error = (0, validators_1.hasMissingField)(params, ['vendorId', 'fields']) ||
        (0, validators_1.hasForbiddenField)(params, [
            'vendorId',
            'fields',
            'customLabel',
            'userActionFields',
            'excludeFromPoll',
            'accessId',
        ]);
    if (error) {
        throw new helpers_1.KError(`when creating a new access: ${error}`, 400);
    }
    (0, helpers_1.assert)(Array.isArray(params.fields), 'fields should be an array');
    const userActionFields = extractUserActionFields(params);
    let access = null;
    try {
        if (userActionFields !== null) {
            // The access must exist, as this is a second step of a 2FA. Use the access id
            // provided in the first step's response to find it.
            (0, helpers_1.assert)(typeof params.accessId === 'number', 'accessId is required for 2FA continuation');
            access = (0, helpers_1.unwrap)(await models_1.Access.find(userId, params.accessId));
        }
        else if (storeCredentials) {
            access = await models_1.Access.create(userId, params);
        }
        else {
            // Create the access without storing fields.
            access = await models_1.Access.create(userId, {
                ...params,
                fields: undefined,
            });
        }
        // Store the access enablement status now, before re-injecting fields.
        const wasAccessEnabled = access.isEnabled();
        // Re-inject fields in memory only for accesses that need it (storeCredentials set to false).
        if (!wasAccessEnabled && params.fields) {
            access.fields = params.fields;
        }
        let providerErrors = [];
        const accountResponse = await accounts_manager_1.default.syncAccounts(userId, access, {
            addNewAccounts: true,
            updateProvider: false, // TODO infer from setting?
            isInteractive: true,
            userActionFields,
        });
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
            (0, all_1.registerStartupTask)(userId, async () => {
                const accounts = await models_1.Account.byAccess(userId, prevAccess);
                if (accounts.length === 0) {
                    log.info(`Cleaning up incomplete access with id ${prevAccess.id}`);
                    await models_1.Access.destroy(userId, prevAccess.id);
                }
            });
            return { ...accountResponse, accessId: access.id };
        }
        const accountInfoMap = accountResponse.value;
        if (accountResponse.errors) {
            providerErrors = providerErrors.concat(accountResponse.errors);
        }
        const transactionResponse = await accounts_manager_1.default.syncTransactions(userId, access, accountInfoMap, 
        /* ignoreLastFetchDate */ true, 
        /* isInteractive */ true, userActionFields);
        (0, helpers_1.assert)(transactionResponse.kind !== 'user_action', 'user action should have been requested when fetching accounts');
        if (transactionResponse.errors) {
            providerErrors = providerErrors.concat(transactionResponse.errors);
        }
        const { accounts, createdTransactions: newTransactions } = transactionResponse.value;
        // New views have automatically been created along with accounts.
        const views = await models_1.View.all(userId);
        return {
            kind: 'value',
            value: {
                accessId: access.id,
                accounts,
                views,
                newTransactions,
                label: (0, providers_1.bankVendorByUuid)(access.vendorId).name,
                errors: providerErrors,
                enabled: wasAccessEnabled,
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
// Creates a new bank access (expecting at least (vendorId / login /
// password)), and retrieves its accounts and transactions.
async function create(req, res) {
    try {
        const { user: { id: userId }, } = req;
        if (await (0, instance_1.isDemoEnabled)(userId)) {
            throw new helpers_1.KError("access creation isn't allowed in demo mode", 400);
        }
        const storeCredentials = req.body.storeCredentials !== false;
        delete req.body.storeCredentials;
        const data = await createAndRetrieveData(userId, req.body, storeCredentials);
        if (data.kind === 'user_action') {
            res.status(200).json(data);
        }
        else {
            res.status(201).json(data.value);
        }
    }
    catch (err) {
        (0, helpers_1.asyncErr)(res, err, 'when creating a bank access');
    }
}
// Do not use this method as a controller directly: express will pass a `next` middleware as third
// argument, and `focusOnTransactionsFetch` will never default to false.
const _fetchAccountsAndTransactions = async (req, 
// On transactions fetch, the accounts balance should be updated too, but we should not throw an error if it happens,
// nor should we create new accounts, nor should we ignore the last fetch date.
focusOnTransactionsFetch = false) => {
    const { id: userId } = req.user;
    const access = req.preloaded.access;
    const bankVendor = (0, providers_1.bankVendorByUuid)(access.vendorId);
    if (!access.isEnabled() || bankVendor.deprecated) {
        const errcode = (0, helpers_1.getErrorCode)('DISABLED_ACCESS');
        throw new helpers_1.KError('disabled access', 403, errcode);
    }
    const userActionFields = extractUserActionFields(req.body);
    let providerErrors = [];
    let accountResponse = null;
    // To deal with banks that often throw errors when dealing with recurrent requests,
    // we wrap the accounts update requests in a try/catch, and still fetch the transactions
    // if it fails, if addnewsAccounts is true: we likely are in a poll and the updated accounts
    // are really important: we should throw an error. Else, in a transactions fetch,
    // the balance might be out of sync with the new transactions but we consider it
    // a minor issue.
    try {
        accountResponse = await accounts_manager_1.default.syncAccounts(userId, access, {
            addNewAccounts: focusOnTransactionsFetch === false,
            updateProvider: false, // TODO shouldn't this be inferred from the settings?
            isInteractive: true,
            userActionFields,
        });
    }
    catch (err) {
        if (!focusOnTransactionsFetch) {
            throw err;
        }
    }
    if (accountResponse && accountResponse.kind === 'user_action') {
        return accountResponse;
    }
    const accountInfoMap = accountResponse ? accountResponse.value : null;
    if (accountResponse && accountResponse.errors) {
        providerErrors = providerErrors.concat(accountResponse.errors);
    }
    const transactionResponse = await accounts_manager_1.default.syncTransactions(userId, access, accountInfoMap, 
    /* ignoreLastFetchDate */ !focusOnTransactionsFetch, 
    /* isInteractive */ true, userActionFields);
    (0, helpers_1.assert)(transactionResponse.kind !== 'user_action', 'user action should have been requested when fetching accounts');
    if (transactionResponse.errors) {
        providerErrors = providerErrors.concat(transactionResponse.errors);
    }
    const { accounts, createdTransactions: newTransactions } = transactionResponse.value;
    // New views have automatically been created along with accounts.
    const views = await models_1.View.all(userId);
    return { accounts, views, newTransactions, errors: providerErrors };
};
// Fetch accounts, including new accounts, and transactions using the backend and
// return both to the client.
async function fetchAccountsAndTransactions(req, res) {
    try {
        const result = await _fetchAccountsAndTransactions(req);
        res.status(200).json(result);
    }
    catch (err) {
        (0, helpers_1.asyncErr)(res, err, 'when fetching accounts and transactions');
    }
}
// Fetch accounts (for up-to-date balances) transactions using the backend and return the transactions to the client.
// Does not add new found accounts.
async function fetchTransactions(req, res) {
    try {
        const result = await _fetchAccountsAndTransactions(req, true);
        res.status(200).json(result);
    }
    catch (err) {
        (0, helpers_1.asyncErr)(res, err, 'when fetching accounts and transactions');
    }
}
// Fetch all the transactions / accounts for all the accesses, as is done during
// any regular poll.
async function poll(req, res) {
    try {
        const { id: userId } = req.user;
        await (0, poller_1.fullPoll)(userId);
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
// Updates a bank access.
async function update(req, res) {
    try {
        const { id: userId } = req.user;
        const { access } = req.preloaded;
        const attrs = req.body;
        const error = (0, validators_1.hasForbiddenField)(attrs, ['enabled', 'customLabel', 'excludeFromPoll']);
        if (error) {
            throw new helpers_1.KError(`when updating an access: ${error}`, 400);
        }
        if (attrs.enabled === false) {
            await models_1.AccessField.destroyAllFromAccessId(userId, access.id);
            delete attrs.enabled;
        }
        if (attrs.customLabel === '') {
            attrs.customLabel = null;
        }
        await models_1.Access.update(userId, access.id, attrs);
        res.status(201).json({ status: 'OK' });
    }
    catch (err) {
        (0, helpers_1.asyncErr)(res, err, 'when updating bank access');
    }
}
async function updateAndFetchAccounts(req, res) {
    try {
        const { id: userId } = req.user;
        const { access } = req.preloaded;
        const attrs = req.body;
        const error = (0, validators_1.hasForbiddenField)(attrs, [
            'login',
            'password',
            'fields',
            'userActionFields',
            'storeCredentials',
        ]);
        if (error) {
            throw new helpers_1.KError(`when updating and polling an access: ${error}`, 400);
        }
        // Hack: temporarily remove userActionFields from the entity, so the
        // ORM accepts it. Oh well.
        const { userActionFields } = attrs;
        delete attrs.userActionFields;
        const providedAccessFields = attrs.fields;
        delete attrs.fields;
        const wasAccessEnabled = access.isEnabled();
        const storeCredentials = !!attrs.storeCredentials;
        delete attrs.storeCredentials;
        if (typeof providedAccessFields !== 'undefined') {
            if (storeCredentials) {
                // Persist the credential updates to DB.
                for (const { name, value } of providedAccessFields) {
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
        }
        else if (!wasAccessEnabled) {
            throw new helpers_1.KError('when updating and fetching bank access: access disabled and no access fields provided by user', 401);
        }
        // The preloaded access needs to be updated before calling fetchAccounts.
        req.preloaded.access = await models_1.Access.update(userId, access.id, attrs);
        if (!storeCredentials) {
            // Make sure previous credentials are erased.
            await models_1.AccessField.destroyAllFromAccessId(userId, access.id);
            // Since fields are not stored in DB, re-apply in-memory fields after the DB reload (Access.update reloads from DB).
            if (providedAccessFields) {
                req.preloaded.access.fields = providedAccessFields;
            }
        }
        // Hack: reset userActionFields (see above comment).
        req.body.userActionFields = userActionFields;
        const result = await _fetchAccountsAndTransactions(req);
        if ('kind' in result) {
            res.status(200).json(result);
            return;
        }
        res.status(200).json({ ...result, enabled: storeCredentials });
    }
    catch (err) {
        (0, helpers_1.asyncErr)(res, err, 'when updating and fetching bank access');
    }
}
