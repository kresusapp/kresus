"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.preload = preload;
exports.getByAccountId = getByAccountId;
exports.create = create;
exports.update = update;
exports.destroy = destroy;
const helpers_1 = require("../helpers");
const models_1 = require("../models");
const validators_1 = require("../shared/validators");
async function preload(req, res, nextHandler, recurringTransactionId) {
    try {
        const { id: userId } = req.user;
        const recurringTransaction = await models_1.RecurringTransaction.find(userId, recurringTransactionId);
        if (!recurringTransaction) {
            throw new helpers_1.KError('Recurring Transaction not found', 404);
        }
        req.preloaded = { recurringTransaction };
        nextHandler();
    }
    catch (err) {
        (0, helpers_1.asyncErr)(res, err, 'when preloading a recurringTransaction');
    }
}
async function getByAccountId(req, res) {
    try {
        const userId = req.user.id;
        const accountId = parseInt(req.params.accountId, 10);
        if (isNaN(accountId)) {
            throw new helpers_1.KError('Invalid account id', 400);
        }
        const accountExists = await models_1.Account.exists(userId, accountId);
        if (!accountExists) {
            throw new helpers_1.KError(`Account ${accountId} not found`, 404);
        }
        const recurringTransactions = await models_1.RecurringTransaction.byAccountId(userId, accountId);
        res.status(200).json(recurringTransactions);
    }
    catch (err) {
        (0, helpers_1.asyncErr)(res, err, 'when retrieving recurringTransactions');
    }
}
async function create(req, res) {
    try {
        const userId = req.user.id;
        const accountId = parseInt(req.params.accountId, 10);
        if (isNaN(accountId)) {
            throw new helpers_1.KError('Invalid account id', 400);
        }
        const error = (0, validators_1.hasForbiddenOrMissingField)(req.body, [
            'label',
            'type',
            'amount',
            'dayOfMonth',
            'listOfMonths',
        ]);
        if (error) {
            throw new helpers_1.KError(error, 400);
        }
        if (!models_1.RecurringTransaction.isValidListOfMonths(req.body.listOfMonths)) {
            throw new helpers_1.KError('Invalid listOfMonths attribute', 400);
        }
        const recurringTransaction = {
            ...req.body,
            accountId,
        };
        const created = await models_1.RecurringTransaction.create(userId, recurringTransaction);
        res.status(200).json(created);
    }
    catch (err) {
        (0, helpers_1.asyncErr)(res, err, 'when creating a recurringTransaction');
    }
}
async function update(req, res) {
    try {
        const { id: userId } = req.user;
        const { recurringTransaction } = req.preloaded;
        const newAccountRecurringTransaction = await models_1.RecurringTransaction.update(userId, recurringTransaction.id, req.body);
        res.status(200).json(newAccountRecurringTransaction);
    }
    catch (err) {
        (0, helpers_1.asyncErr)(res, err, 'when updating a recurringTransaction');
    }
}
async function destroy(req, res) {
    try {
        const { id: userId } = req.user;
        const { recurringTransaction } = req.preloaded;
        await models_1.RecurringTransaction.destroy(userId, recurringTransaction.id);
        res.status(200).end();
    }
    catch (err) {
        (0, helpers_1.asyncErr)(res, err, 'when deleting a recurringTransaction');
    }
}
