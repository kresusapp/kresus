import express from 'express';
import { IdentifiedRequest, PreloadedRequest } from './routes';

import { Account, Category, Transaction } from '../models';
import { isKnownTransactionTypeName } from '../lib/transaction-types';
import { KError, asyncErr, UNKNOWN_TRANSACTION_TYPE } from '../helpers';

async function preload(
    varName: string,
    req: IdentifiedRequest<Transaction>,
    res: express.Response,
    nextHandler: () => void,
    transactionId: number
) {
    const { id: userId } = req.user;
    try {
        const transaction = await Transaction.find(userId, transactionId);
        if (!transaction) {
            throw new KError('bank transaction not found', 404);
        }
        req.preloaded = req.preloaded || {};
        req.preloaded[varName] = transaction;
        nextHandler();
    } catch (err) {
        asyncErr(res, err, 'when preloading a transaction');
    }
}

export async function preloadTransaction(
    req: IdentifiedRequest<Transaction>,
    res: express.Response,
    nextHandler: () => void,
    transactionId: number
) {
    await preload('transaction', req, res, nextHandler, transactionId);
}

export async function preloadOtherTransaction(
    req: IdentifiedRequest<Transaction>,
    res: express.Response,
    nextHandler: () => void,
    othertransactionId: number
) {
    await preload('otherTransaction', req, res, nextHandler, othertransactionId);
}

export async function update(req: PreloadedRequest<Transaction>, res: express.Response) {
    try {
        const { id: userId } = req.user;

        const attr = req.body;

        // We can only update the category id, transaction type, custom label, budget date
        // or date (only if it was created by the user) of a transaction.
        if (
            typeof attr.categoryId === 'undefined' &&
            typeof attr.type === 'undefined' &&
            typeof attr.customLabel === 'undefined' &&
            typeof attr.budgetDate === 'undefined' &&
            (typeof attr.date === 'undefined' || !req.preloaded.transaction.createdByUser)
        ) {
            throw new KError('Missing parameter', 400);
        }

        const opUpdate: Partial<Transaction> = {};
        if (typeof attr.categoryId !== 'undefined') {
            if (attr.categoryId !== null) {
                const found = await Category.find(userId, attr.categoryId);
                if (!found) {
                    throw new KError('Category not found', 404);
                }
            }
            opUpdate.categoryId = attr.categoryId;
        }

        if (typeof attr.type !== 'undefined') {
            if (isKnownTransactionTypeName(attr.type)) {
                opUpdate.type = attr.type;
            } else {
                opUpdate.type = UNKNOWN_TRANSACTION_TYPE;
            }
        }

        if (typeof opUpdate.type !== 'undefined') {
            opUpdate.isUserDefinedType = true;
        }

        if (typeof attr.customLabel !== 'undefined') {
            if (attr.customLabel === '') {
                opUpdate.customLabel = null;
            } else {
                opUpdate.customLabel = attr.customLabel;
            }
        }

        if (typeof attr.budgetDate !== 'undefined') {
            if (attr.budgetDate === null) {
                opUpdate.budgetDate = null;
            } else {
                opUpdate.budgetDate = new Date(attr.budgetDate);
            }
        }

        if (typeof attr.date !== 'undefined') {
            opUpdate.date = new Date(attr.date);

            if (typeof attr.debitDate !== 'undefined') {
                opUpdate.debitDate = new Date(attr.debitDate);
            }
        }

        await Transaction.update(userId, req.preloaded.transaction.id, opUpdate);
        res.status(200).end();
    } catch (err) {
        asyncErr(res, err, 'when updating attributes of transaction');
    }
}

export async function merge(req: PreloadedRequest<Transaction>, res: express.Response) {
    try {
        const { id: userId } = req.user;

        // @transaction is the one to keep, @otherTransaction is the one to delete.
        const otherTr = req.preloaded.otherTransaction;
        let tr = req.preloaded.transaction;

        // Transfer various fields upon deletion
        const newFields = tr.mergeWith(otherTr);

        tr = await Transaction.update(userId, tr.id, newFields);

        await Transaction.destroy(userId, otherTr.id);

        const account = await Account.find(userId, otherTr.accountId);
        if (!account) {
            throw new KError('bank account not found', 404);
        }

        res.status(200).json({
            transaction: tr,
            accountBalance: account.balance,
            accountId: otherTr.accountId,
        });
    } catch (err) {
        asyncErr(res, err, 'when merging two transactions');
    }
}

// Create a new transaction.
export async function create(req: IdentifiedRequest<Transaction>, res: express.Response) {
    try {
        const { id: userId } = req.user;
        const transaction = req.body;
        if (!Transaction.isTransaction(transaction)) {
            throw new KError('Not a transaction', 400);
        }

        if (typeof transaction.categoryId !== 'undefined' && transaction.categoryId !== null) {
            const found = await Category.find(userId, transaction.categoryId);
            if (!found) {
                throw new KError('Category not found', 404);
            }
        }

        // We fill potentially missing fields.
        transaction.rawLabel = transaction.rawLabel || transaction.label;
        transaction.importDate = transaction.importDate || new Date();
        transaction.debitDate = transaction.debitDate || transaction.date;
        transaction.createdByUser = true;
        if (
            typeof transaction.type !== 'undefined' &&
            transaction.type !== UNKNOWN_TRANSACTION_TYPE
        ) {
            transaction.isUserDefinedType = true;
        }
        const newTransaction = await Transaction.create(userId, transaction);

        // Send back the transaction as well as the (possibly) updated account balance.
        const account = await Account.find(userId, newTransaction.accountId);
        if (!account) {
            throw new KError('bank account not found', 404);
        }

        res.status(201).json({
            transaction: newTransaction,
            accountBalance: account.balance,
            accountId: newTransaction.accountId,
        });
    } catch (err) {
        asyncErr(res, err, 'when creating transaction for a bank account');
    }
}

// Delete a transaction
export async function destroy(req: PreloadedRequest<Transaction>, res: express.Response) {
    try {
        const { id: userId } = req.user;
        const op = req.preloaded.transaction;

        await Transaction.destroy(userId, op.id);

        // Send back the transaction as well as the (possibly) updated account balance.
        const account = await Account.find(userId, op.accountId);
        if (!account) {
            throw new KError('bank account not found', 404);
        }

        res.status(200).json({
            accountBalance: account.balance,
            accountId: op.accountId,
        });
    } catch (err) {
        asyncErr(res, err, 'when deleting transaction');
    }
}
