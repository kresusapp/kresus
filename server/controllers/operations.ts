import express from 'express';
import { IdentifiedRequest, PreloadedRequest } from './routes';

import { Category, Transaction } from '../models';
import { isKnownTransactionTypeName } from '../lib/transaction-types';
import { KError, asyncErr, UNKNOWN_OPERATION_TYPE } from '../helpers';

async function preload(
    varName: string,
    req: IdentifiedRequest<Transaction>,
    res: express.Response,
    nextHandler: Function,
    operationID: number
) {
    const { id: userId } = req.user;
    try {
        const operation = await Transaction.find(userId, operationID);
        if (!operation) {
            throw new KError('bank operation not found', 404);
        }
        req.preloaded = req.preloaded || {};
        req.preloaded[varName] = operation;
        nextHandler();
    } catch (err) {
        asyncErr(res, err, 'when preloading an operation');
    }
}

export async function preloadOperation(
    req: IdentifiedRequest<Transaction>,
    res: express.Response,
    nextHandler: Function,
    operationID: number
) {
    await preload('operation', req, res, nextHandler, operationID);
}

export async function preloadOtherOperation(
    req: IdentifiedRequest<Transaction>,
    res: express.Response,
    nextHandler: Function,
    otherOperationID: number
) {
    await preload('otherOperation', req, res, nextHandler, otherOperationID);
}

export async function update(req: PreloadedRequest<Transaction>, res: express.Response) {
    try {
        const { id: userId } = req.user;

        const attr = req.body;

        // We can only update the category id, operation type, custom label or budget date
        // of an operation.
        if (
            typeof attr.categoryId === 'undefined' &&
            typeof attr.type === 'undefined' &&
            typeof attr.customLabel === 'undefined' &&
            typeof attr.budgetDate === 'undefined'
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
                opUpdate.type = UNKNOWN_OPERATION_TYPE;
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

        await Transaction.update(userId, req.preloaded.operation.id, opUpdate);
        res.status(200).end();
    } catch (err) {
        asyncErr(res, err, 'when updating attributes of operation');
    }
}

export async function merge(req: PreloadedRequest<Transaction>, res: express.Response) {
    try {
        const { id: userId } = req.user;

        // @operation is the one to keep, @otherOperation is the one to delete.
        const otherOp = req.preloaded.otherOperation;
        let op = req.preloaded.operation;

        // Transfer various fields upon deletion
        const newFields = op.mergeWith(otherOp);

        op = await Transaction.update(userId, op.id, newFields);

        await Transaction.destroy(userId, otherOp.id);
        res.status(200).json(op);
    } catch (err) {
        asyncErr(res, err, 'when merging two operations');
    }
}

// Create a new operation.
export async function create(req: IdentifiedRequest<Transaction>, res: express.Response) {
    try {
        const { id: userId } = req.user;
        const operation = req.body;
        if (!Transaction.isOperation(operation)) {
            throw new KError('Not an operation', 400);
        }

        if (typeof operation.categoryId !== 'undefined' && operation.categoryId !== null) {
            const found = await Category.find(userId, operation.categoryId);
            if (!found) {
                throw new KError('Category not found', 404);
            }
        }

        // We fill the missing fields.
        operation.rawLabel = operation.label;
        operation.importDate = new Date();
        operation.debitDate = operation.date;
        operation.createdByUser = true;
        if (typeof operation.type !== 'undefined' && operation.type !== UNKNOWN_OPERATION_TYPE) {
            operation.isUserDefinedType = true;
        }
        const op = await Transaction.create(userId, operation);
        res.status(201).json(op);
    } catch (err) {
        asyncErr(res, err, 'when creating operation for a bank account');
    }
}

// Delete an operation
export async function destroy(req: PreloadedRequest<Transaction>, res: express.Response) {
    try {
        const { id: userId } = req.user;
        const op = req.preloaded.operation;
        await Transaction.destroy(userId, op.id);
        res.status(204).end();
    } catch (err) {
        asyncErr(res, err, 'when deleting operation');
    }
}
