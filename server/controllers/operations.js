import http from 'http';

import Operation from '../models/operation';

import {sendErr, asyncErr} from '../helpers';

async function preload(varName, req, res, next, operationID) {
    try {
        let operation = await Operation.find(operationID);
        if (!operation) {
            throw {status: 404, message: "bank operation not found"};
        }
        req.preloaded = req.preloaded || {};
        req.preloaded[varName] = operation;
        next();
    } catch(err) {
        return asyncErr(res, err, "when preloading an operation");
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

    // We can only update the category id, operation type or custom label of an operation.
    if (typeof attr.categoryId === 'undefined' && typeof attr.operationTypeID === 'undefined' && typeof attr.customLabel === 'undefined')
        return sendErr(res, 'missing parameter categoryId, operationTypeID or customLabel', 400, 'Missing parameter categoryId, operationTypeID or customLabel');

    try {
        await req.preloaded.operation.updateAttributes(attr);
        res.sendStatus(200);
    } catch(err) {
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
    } catch(err) {
        return asyncErr(res, err, "when merging two operations");
    }
}


export async function file(req, res, next) {
    let {operationId} = req.params;
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
    } catch(err) {
        return asyncErr(res, err, "when retrieving file attached to an operation");
    }
}

