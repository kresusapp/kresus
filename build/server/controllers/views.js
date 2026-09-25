"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.preloadView = preloadView;
exports.create = create;
exports.update = update;
exports.destroy = destroy;
const helpers_1 = require("../helpers");
const models_1 = require("../models");
const instance_1 = require("./instance");
// Prefills the @view field with a queried bank account.
async function preloadView(req, res, nextHandler, viewId) {
    try {
        const { id: userId } = req.user;
        const view = await models_1.View.find(userId, viewId);
        if (!view) {
            throw new helpers_1.KError('View not found', 404);
        }
        if (!req.preloaded) {
            req.preloaded = {};
        }
        req.preloaded.view = view;
        nextHandler();
    }
    catch (err) {
        (0, helpers_1.asyncErr)(res, err, 'when preloading a view');
    }
}
async function checkViewAccounts(userId, accounts) {
    const accountIds = [];
    if (accounts instanceof Array) {
        for (const viewAccount of accounts) {
            if (typeof (viewAccount === null || viewAccount === void 0 ? void 0 : viewAccount.accountId) !== 'number') {
                throw new helpers_1.KError('a view account must have a numeric accountId', 400);
            }
            if (accountIds.includes(viewAccount.accountId)) {
                throw new helpers_1.KError('a view cannot include an account several times', 400);
            }
            accountIds.push(viewAccount.accountId);
        }
    }
    if (!accountIds.length) {
        throw new helpers_1.KError('a view should have at least one account', 400);
    }
    const accountsFromIds = await models_1.Account.findMany(userId, accountIds);
    if (accountsFromIds.length !== accountIds.length) {
        throw new helpers_1.KError('some view accounts could not be found', 404);
    }
    const currencies = new Set(await Promise.all(accountsFromIds.map(account => account.getCurrency())));
    if (currencies.size > 1) {
        throw new helpers_1.KError('a view cannot contain accounts of different currencies', 400);
    }
}
async function create(req, res) {
    try {
        const { id: userId } = req.user;
        const newView = req.body;
        if (!newView || typeof newView.label !== 'string') {
            throw new helpers_1.KError('missing parameters', 400);
        }
        await checkViewAccounts(userId, newView.accounts);
        const view = await models_1.View.create(userId, newView);
        res.status(201).json(view);
    }
    catch (err) {
        (0, helpers_1.asyncErr)(res, err, 'when creating a view');
    }
}
async function update(req, res) {
    try {
        const { id: userId } = req.user;
        const newFields = req.body;
        const view = req.preloaded.view;
        // Always validate, even for a plain rename: a view which already mixes currencies (it
        // may predate this restriction, or an account's currency may have changed on the bank's
        // side) must be fixed by the user before it can be modified at all.
        const accounts = newFields && typeof newFields.accounts !== 'undefined'
            ? newFields.accounts
            : view.accounts;
        await checkViewAccounts(userId, accounts);
        const newView = await models_1.View.update(userId, view.id, newFields);
        res.status(200).json(newView);
    }
    catch (err) {
        (0, helpers_1.asyncErr)(res, err, 'when updating a view');
    }
}
async function destroy(req, res) {
    try {
        const { id: userId } = req.user;
        if (await (0, instance_1.isDemoEnabled)(userId)) {
            throw new helpers_1.KError("view deletion isn't allowed in demo mode", 400);
        }
        const view = req.preloaded.view;
        await models_1.View.destroy(userId, view.id);
        res.status(204).end();
    }
    catch (err) {
        (0, helpers_1.asyncErr)(res, err, 'when destroying a view');
    }
}
