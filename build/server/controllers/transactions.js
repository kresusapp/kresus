"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.preloadTransaction = preloadTransaction;
exports.preloadOtherTransaction = preloadOtherTransaction;
exports.update = update;
exports.merge = merge;
exports.create = create;
exports.destroy = destroy;
const models_1 = require("../models");
const transaction_types_1 = require("../lib/transaction-types");
const helpers_1 = require("../helpers");
async function preload(varName, req, res, nextHandler, transactionId) {
    const { id: userId } = req.user;
    try {
        const transaction = await models_1.Transaction.find(userId, transactionId);
        if (!transaction) {
            throw new helpers_1.KError('bank transaction not found', 404);
        }
        req.preloaded = req.preloaded || {};
        req.preloaded[varName] = transaction;
        nextHandler();
    }
    catch (err) {
        (0, helpers_1.asyncErr)(res, err, 'when preloading a transaction');
    }
}
async function preloadTransaction(req, res, nextHandler, transactionId) {
    await preload('transaction', req, res, nextHandler, transactionId);
}
async function preloadOtherTransaction(req, res, nextHandler, othertransactionId) {
    await preload('otherTransaction', req, res, nextHandler, othertransactionId);
}
async function update(req, res) {
    try {
        const { id: userId } = req.user;
        const attr = req.body;
        // We can only update the category id, transaction type, custom label, budget date
        // or date (only if it was created by the user) of a transaction.
        if (typeof attr.categoryId === 'undefined' &&
            typeof attr.type === 'undefined' &&
            typeof attr.customLabel === 'undefined' &&
            typeof attr.budgetDate === 'undefined' &&
            (typeof attr.date === 'undefined' || !req.preloaded.transaction.createdByUser)) {
            throw new helpers_1.KError('Missing parameter', 400);
        }
        const opUpdate = {};
        if (typeof attr.categoryId !== 'undefined') {
            if (attr.categoryId !== null) {
                const found = await models_1.Category.find(userId, attr.categoryId);
                if (!found) {
                    throw new helpers_1.KError('Category not found', 404);
                }
            }
            opUpdate.categoryId = attr.categoryId;
        }
        if (typeof attr.type !== 'undefined') {
            if ((0, transaction_types_1.isKnownTransactionTypeName)(attr.type)) {
                opUpdate.type = attr.type;
            }
            else {
                opUpdate.type = helpers_1.UNKNOWN_TRANSACTION_TYPE;
            }
        }
        if (typeof opUpdate.type !== 'undefined') {
            opUpdate.isUserDefinedType = true;
        }
        if (typeof attr.customLabel !== 'undefined') {
            if (attr.customLabel === '') {
                opUpdate.customLabel = null;
            }
            else {
                opUpdate.customLabel = attr.customLabel;
            }
        }
        if (typeof attr.budgetDate !== 'undefined') {
            if (attr.budgetDate === null) {
                opUpdate.budgetDate = null;
            }
            else {
                opUpdate.budgetDate = new Date(attr.budgetDate);
            }
        }
        if (typeof attr.date !== 'undefined') {
            opUpdate.date = new Date(attr.date);
            if (typeof attr.debitDate !== 'undefined') {
                opUpdate.debitDate = new Date(attr.debitDate);
            }
        }
        await models_1.Transaction.update(userId, req.preloaded.transaction.id, opUpdate);
        res.status(200).end();
    }
    catch (err) {
        (0, helpers_1.asyncErr)(res, err, 'when updating attributes of transaction');
    }
}
async function merge(req, res) {
    try {
        const { id: userId } = req.user;
        // @transaction is the one to keep, @otherTransaction is the one to delete.
        const otherTr = req.preloaded.otherTransaction;
        let tr = req.preloaded.transaction;
        // Transfer various fields upon deletion
        const newFields = tr.mergeWith(otherTr);
        tr = await models_1.Transaction.update(userId, tr.id, newFields);
        await models_1.Transaction.destroy(userId, otherTr.id);
        const account = await models_1.Account.find(userId, otherTr.accountId);
        if (!account) {
            throw new helpers_1.KError('bank account not found', 404);
        }
        res.status(200).json({
            transaction: tr,
            accountBalance: account.balance,
            accountId: otherTr.accountId,
        });
    }
    catch (err) {
        (0, helpers_1.asyncErr)(res, err, 'when merging two transactions');
    }
}
// Create a new transaction.
async function create(req, res) {
    try {
        const { id: userId } = req.user;
        const transaction = req.body;
        if (!models_1.Transaction.isTransaction(transaction)) {
            throw new helpers_1.KError('Not a transaction', 400);
        }
        if (typeof transaction.categoryId !== 'undefined' && transaction.categoryId !== null) {
            const found = await models_1.Category.find(userId, transaction.categoryId);
            if (!found) {
                throw new helpers_1.KError('Category not found', 404);
            }
        }
        // We fill potentially missing fields.
        transaction.rawLabel = transaction.rawLabel || transaction.label;
        transaction.importDate = transaction.importDate || new Date();
        transaction.debitDate = transaction.debitDate || transaction.date;
        transaction.createdByUser = true;
        if (typeof transaction.type !== 'undefined' &&
            transaction.type !== helpers_1.UNKNOWN_TRANSACTION_TYPE) {
            transaction.isUserDefinedType = true;
        }
        const newTransaction = await models_1.Transaction.create(userId, transaction);
        // Send back the transaction as well as the (possibly) updated account balance.
        const account = await models_1.Account.find(userId, newTransaction.accountId);
        if (!account) {
            throw new helpers_1.KError('bank account not found', 404);
        }
        res.status(201).json({
            transaction: newTransaction,
            accountBalance: account.balance,
            accountId: newTransaction.accountId,
        });
    }
    catch (err) {
        (0, helpers_1.asyncErr)(res, err, 'when creating transaction for a bank account');
    }
}
// Delete a transaction
async function destroy(req, res) {
    try {
        const { id: userId } = req.user;
        const op = req.preloaded.transaction;
        await models_1.Transaction.destroy(userId, op.id);
        // Send back the transaction as well as the (possibly) updated account balance.
        const account = await models_1.Account.find(userId, op.accountId);
        if (!account) {
            throw new helpers_1.KError('bank account not found', 404);
        }
        res.status(200).json({
            accountBalance: account.balance,
            accountId: op.accountId,
        });
    }
    catch (err) {
        (0, helpers_1.asyncErr)(res, err, 'when deleting transaction');
    }
}
