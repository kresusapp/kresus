import moment from 'moment';

import Categories from '../../models/categories';
import Transaction from '../../models/transactions';
import { isKnownTransactionTypeName } from '../../lib/transaction-types';

import { KError, asyncErr, UNKNOWN_OPERATION_TYPE } from '../../helpers';

async function preload(varName, req, res, next, operationID) {
    let { id: userId } = req.user;
    try {
        let operation = await Transaction.find(userId, operationID);
        if (!operation) {
            throw new KError('bank operation not found', 404);
        }
        req.preloaded = req.preloaded || {};
        req.preloaded[varName] = operation;
        return next();
    } catch (err) {
        return asyncErr(res, err, 'when preloading an operation');
    }
}

export function preloadOperation(req, res, next, operationID) {
    preload('operation', req, res, next, operationID);
}

export function preloadOtherOperation(req, res, next, otherOperationID) {
    preload('otherOperation', req, res, next, otherOperationID);
}

export async function update(req, res) {
    try {
        let { id: userId } = req.user;

        let attr = req.body;

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

        let opUpdate = {};
        if (typeof attr.categoryId !== 'undefined') {
            if (attr.categoryId !== null) {
                let found = await Categories.find(userId, attr.categoryId);
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
        return asyncErr(res, err, 'when updating attributes of operation');
    }
}

export async function merge(req, res) {
    try {
        let { id: userId } = req.user;
        // @operation is the one to keep, @otherOperation is the one to delete.
        let otherOp = req.preloaded.otherOperation;
        let op = req.preloaded.operation;

        // Transfer various fields upon deletion
        let newFields = op.mergeWith(otherOp);

        op = await Transaction.update(userId, op.id, newFields);

        await Transaction.destroy(userId, otherOp.id);
        res.status(200).json(op);
    } catch (err) {
        return asyncErr(res, err, 'when merging two operations');
    }
}

// Create a new operation
export async function create(req, res) {
    try {
        let { id: userId } = req.user;
        let operation = req.body;
        if (!Transaction.isOperation(operation)) {
            throw new KError('Not an operation', 400);
        }

        if (typeof operation.categoryId !== 'undefined' && operation.categoryId !== null) {
            let found = await Categories.find(userId, operation.categoryId);
            if (!found) {
                throw new KError('Category not found', 404);
            }
        }

        // We fill the missing fields
        operation.rawLabel = operation.label;
        operation.customLabel = operation.label;
        operation.importDate = moment().format('YYYY-MM-DDTHH:mm:ss.000Z');
        operation.createdByUser = true;

        let op = await Transaction.create(userId, operation);
        res.status(201).json(op);
    } catch (err) {
        return asyncErr(res, err, 'when creating operation for a bank account');
    }
}

// Delete an operation
export async function destroy(req, res) {
    try {
        let { id: userId } = req.user;
        let op = req.preloaded.operation;
        await Transaction.destroy(userId, op.id);
        res.status(204).end();
    } catch (err) {
        return asyncErr(res, err, 'when deleting operation');
    }
}
