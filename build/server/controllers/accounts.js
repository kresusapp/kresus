"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resyncBalance = exports.destroy = exports.update = exports.destroyWithOperations = exports.fixupDefaultAccount = exports.preloadAccount = void 0;
const models_1 = require("../models");
const helpers_1 = require("../helpers");
const settings_1 = require("../../shared/settings");
const validators_1 = require("../shared/validators");
const accounts_manager_1 = __importDefault(require("../lib/accounts-manager"));
const instance_1 = require("./instance");
const accesses_1 = require("./accesses");
const log = helpers_1.makeLogger('controllers/accounts');
// Prefills the @account field with a queried bank account.
async function preloadAccount(req, res, nextHandler, accountID) {
    try {
        const { id: userId } = req.user;
        const account = await models_1.Account.find(userId, accountID);
        if (!account) {
            throw new helpers_1.KError('Bank account not found', 404);
        }
        req.preloaded = { account };
        nextHandler();
    }
    catch (err) {
        helpers_1.asyncErr(res, err, 'when preloading a bank account');
    }
}
exports.preloadAccount = preloadAccount;
async function fixupDefaultAccount(userId) {
    const found = await models_1.Setting.findOrCreateDefault(userId, settings_1.DEFAULT_ACCOUNT_ID);
    if (found && found.value !== '') {
        const accountId = parseInt(found.value, 10);
        const accountFound = await models_1.Account.find(userId, accountId);
        if (!accountFound) {
            log.info("-> Removing the default account setting since the account doesn't exist anymore.");
            await models_1.Setting.update(userId, found.id, { value: '' });
        }
    }
}
exports.fixupDefaultAccount = fixupDefaultAccount;
// Destroy an account and all its operations, alerts, and accesses if no other
// accounts are bound to this access.
async function destroyWithOperations(userId, account) {
    log.info(`Removing account ${account.label} from database...`);
    log.info(`\t-> Destroy account ${account.label}`);
    await models_1.Account.destroy(userId, account.id);
    await fixupDefaultAccount(userId);
    const accounts = await models_1.Account.byAccess(userId, { id: account.accessId });
    if (accounts && accounts.length === 0) {
        log.info('\t-> No other accounts bound: destroying access.');
        await models_1.Access.destroy(userId, account.accessId);
    }
}
exports.destroyWithOperations = destroyWithOperations;
async function update(req, res) {
    try {
        const { id: userId } = req.user;
        const newFields = req.body;
        const error = validators_1.hasForbiddenField(newFields, ['excludeFromBalance', 'customLabel']);
        if (error) {
            throw new helpers_1.KError(`when updating an account: ${error}`, 400);
        }
        const account = req.preloaded.account;
        const newAccount = await models_1.Account.update(userId, account.id, newFields);
        res.status(200).json(newAccount);
    }
    catch (err) {
        helpers_1.asyncErr(res, err, 'when updating an account');
    }
}
exports.update = update;
// Delete account, operations and alerts.
async function destroy(req, res) {
    try {
        const { id: userId } = req.user;
        if (await instance_1.isDemoEnabled(userId)) {
            throw new helpers_1.KError("account deletion isn't allowed in demo mode", 400);
        }
        await destroyWithOperations(userId, req.preloaded.account);
        res.status(204).end();
    }
    catch (err) {
        helpers_1.asyncErr(res, err, 'when destroying an account');
    }
}
exports.destroy = destroy;
async function resyncBalance(req, res) {
    try {
        const { id: userId } = req.user;
        const account = req.preloaded.account;
        const userActionFields = accesses_1.extractUserActionFields(req.body);
        const response = await accounts_manager_1.default.resyncAccountBalance(userId, account, 
        /* interactive */ true, userActionFields);
        if (response.kind === 'user_action') {
            res.status(200).json(response);
        }
        else {
            const updatedAccount = response.value;
            res.status(200).json(updatedAccount);
        }
    }
    catch (err) {
        helpers_1.asyncErr(res, err, 'when getting balance of a bank account');
    }
}
exports.resyncBalance = resyncBalance;
