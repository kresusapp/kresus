import moment from 'moment';
import http from 'http';

import Category from '../models/category';
import Operation from '../models/operation';
import OperationType from '../models/operationtype';

import { sendErr, asyncErr } from '../helpers';

async function preload(varName, req, res, next, operationID) {
    try {
        let operation = await Operation.find(operationID);
        if (!operation) {
            throw { status: 404, message: 'bank operation not found' };
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
    let attr = req.body;

    // We can only update the category id, operation type or custom label of an
    // operation.
    if (typeof attr.categoryId === 'undefined' &&
        typeof attr.operationTypeID === 'undefined' &&
        typeof attr.customLabel === 'undefined') {
        return sendErr(res, 'missing parameter', 400, 'Missing parameter');
    }

    try {
        if (typeof attr.categoryId !== 'undefined') {
            if (attr.categoryId === '') {
                delete req.preloaded.operation.categoryId;
            } else {
                let newCategory = await Category.find(attr.categoryId);
                if (!newCategory) {
                    throw {
                        status: 404,
                        message: 'Category not found when updating an operation'
                    };
                } else {
                    req.preloaded.operation.categoryId = attr.categoryId;
                }
            }
        }

        if (typeof attr.operationTypeID !== 'undefined') {
            let newType = await OperationType.find(attr.operationTypeID);
            if (!newType) {
                throw {
                    status: 404,
                    message: 'Type not found when updating an operation'
                };
            } else {
                req.preloaded.operation.operationTypeID = attr.operationTypeID;
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

    // @operation is the one to keep, @otherOperation is the one to delete.
    let otherOp = req.preloaded.otherOperation;
    let op = req.preloaded.operation;

    // Transfer various fields upon deletion
    let needsSave = op.mergeWith(otherOp);

    try {
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
    let { operationId } = req.params;
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

    try {
        let operation = await Operation.find(operationId);
        let request = http.get(options, stream => {
            if (stream.statusCode === 200) {
                let fileMime = operation.binary.fileMime || 'application/pdf';
                res.set('Content-Type', fileMime);
                res.on('close', request.abort.bind(request));
                stream.pipe(res);
            } else if (stream.statusCode === 404) {
                res.status(404).send('File not found');
            } else {
                res.sendStatus(stream.statusCode);
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
        if (!Operation.isOperation(operation)) {
            return res.status(400).send({ message: 'Not an operation' });
        }
        // We fill the missing fields
        operation.raw = operation.title;
        operation.dateImport = moment().format('YYYY-MM-DDTHH:mm:ss.000Z');
        operation.createdByUser = true;
        let op = await Operation.create(operation);
        res.status(201).send(op);
    } catch (err) {
        return asyncErr(res, err, 'when creating operation for a bank account');
    }
}
