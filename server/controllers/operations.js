import moment from 'moment';
import http from 'http';

import Category from '../models/category';
import Operation from '../models/operation';
import OperationType from '../models/operationtype';

import { KError, asyncErr, UNKNOWN_OPERATION_TYPE } from '../helpers';

async function preload(varName, req, res, next, operationID) {
    try {
        let operation = await Operation.find(operationID);
        if (!operation) {
            throw new KError('bank operation not found', 404);
        }
        req.preloaded = req.preloaded || {};
        req.preloaded[varName] = operation;
        next();
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
        let attr = req.body;
        // We can only update the category id, operation type or custom label
        // of an operation.
        if (typeof attr.categoryId === 'undefined' &&
            typeof attr.type === 'undefined' &&
            typeof attr.customLabel === 'undefined') {
            throw new KError('Missing parameter', 400);
        }

        if (typeof attr.categoryId !== 'undefined') {
            if (attr.categoryId === '') {
                delete req.preloaded.operation.categoryId;
            } else {
                let newCategory = await Category.find(attr.categoryId);
                if (!newCategory) {
                    throw new KError('Category not found', 404);
                } else {
                    req.preloaded.operation.categoryId = attr.categoryId;
                }
            }
        }

        if (typeof attr.type !== 'undefined') {
            if (OperationType.isKnown(attr.type)) {
                req.preloaded.operation.type = attr.type;
            } else {
                req.preloaded.operation.type = UNKNOWN_OPERATION_TYPE;
            }
        }

        if (typeof attr.customLabel !== 'undefined') {
            if (attr.customLabel === '') {
                delete req.preloaded.operation.customLabel;
            } else {
                req.preloaded.operation.customLabel = attr.customLabel;
            }
        }

        await req.preloaded.operation.save();
        res.sendStatus(200);
    } catch (err) {
        return asyncErr(res, err, 'when upadting attributes of operation');
    }
}

export async function merge(req, res) {
    try {
        // @operation is the one to keep, @otherOperation is the one to delete.
        let otherOp = req.preloaded.otherOperation;
        let op = req.preloaded.operation;

        // Transfer various fields upon deletion
        let needsSave = op.mergeWith(otherOp);

        if (needsSave) {
            op = await op.save();
        }
        await otherOp.destroy();
        res.status(200).send(op);
    } catch (err) {
        return asyncErr(res, err, 'when merging two operations');
    }
}


export async function file(req, res) {
    try {

        if (req.preloaded.operation.binary &&
            req.preloaded.operation.binary.fileName === '__dev_example_file') {
            res.set('Content-Type', 'text/plain');
            res.status(200).send('This is an example file for developer mode.');
            return true;
        }

        let operationId  = req.preloaded.operation.id;
        let binaryPath = `/data/${operationId}/binaries/file`;

        let id = process.env.NAME;
        let pwd = process.env.TOKEN;
        let basic = `${id}:${pwd}`;
        basic = `Basic ${new Buffer(basic).toString('base64')}`;

        let options = {
            host: 'localhost',
            port: 9101,
            path: binaryPath,
            headers: {
                Authorization: basic
            }
        };

        let operation = await Operation.find(operationId);
        let request = http.get(options, stream => {
            if (stream.statusCode === 200) {
                let fileMime = operation.binary.fileMime || 'application/pdf';
                res.set('Content-Type', fileMime);
                res.on('close', request.abort.bind(request));
                stream.pipe(res);
            } else if (stream.statusCode === 404) {
                throw new KError('File not found', 404);
            } else {
                throw new KError('Unknown error', stream.statusCode);
            }
        });
    } catch (err) {
        return asyncErr(res, err, "when getting an operation's attachment");
    }
}

// Create a new operation
export async function create(req, res) {
    try {
        let operation = req.body;
        let op = await createOne(operation);
        res.status(201).send(op);
    } catch (err) {
        return asyncErr(res, err, 'when creating operation for a bank account');
    }
}

async function createOne(operation) {
    if (!Operation.isOperation(operation)) {
        throw new KError('Not an operation', 400);
    }

    // We fill the missing fields
    operation.raw = operation.title;
    operation.dateImport = moment().format('YYYY-MM-DDTHH:mm:ss.000Z');
    operation.createdByUser = true;
    let op = await Operation.create(operation);
    return op;
}

// Delete an operation
export async function destroy(req, res) {
    try {
        let op = req.preloaded.operation;
        // destroy subops
        await destroySubOpsForOne(op.id);
        await op.destroy();
        res.sendStatus(204);
    } catch (err) {
        return asyncErr(res, err, 'when deleting operation');
    }
}

// Split operation
// The client is supposed to resend all the subops when updating subops of an operation.
export async function split(req, res) {
    try {
        let operation = req.preloaded.operation;
        let subOperations = req.body;
        let newSubOps = [];
        let existingSubOps = await Operation.byParentOperation(operation.id);
        for (let subOperation of subOperations) {

            if (typeof subOperation.id === 'string') {

                // The subo operation has an ID, update it
                let existingSubOp = existingSubOps.find(op => op.id === subOperation.id);
                let existingSubOpIdx = existingSubOps.indexOf(existingSubOp);
                if (typeof existingSubOp === 'undefined') {
                    throw new KError('Could not find suboOperation', 404);
                } else {
                    existingSubOp.amount = subOperation.amount;
                    existingSubOp.date = subOperation.date;
                    existingSubOp.categoryId = subOperation.categoryId;
                    existingSubOp.title = subOperation.title;
                    await existingSubOp.save();

                    // Delete this operation from the existingSubOps list
                    if (existingSubOpIdx > -1) {
                        existingSubOps.splice(existingSubOpIdx, 1);
                    }
                    newSubOps.push(existingSubOp);
                }
            } else {

                // Else create it
                subOperation.parentOperationId = operation.id;
                let subOp = await createOne(subOperation);
                newSubOps.push(subOp);
            }
        }

        // Destroy remaining suboperations and their suboperations.
        for (let remainingOp of existingSubOps) {
            await destroySubOpsForOne(remainingOp.id);
            await remainingOp.destroy();
        }

        // Only transmit the newSubOps
        res.status(200).send(newSubOps);
    } catch (err) {
        return asyncErr(res, err, 'when splitting an operation');

    }
}

// Delete all suboperations of a given operation, including sub-suboperations
async function destroySubOpsForOne(id) {

    // Retreive all suboperation of the operation, and delete them
    let subOperations = await Operation.byParentOperation(id);
    for (let subOperation of subOperations) {
        await destroySubOpsForOne(subOperation.id);
        await subOperation.destroy();
    }
}
