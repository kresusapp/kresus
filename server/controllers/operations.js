let http = require('http');

let BankOperation = require('../models/operation');

let h = require('../helpers');

function preloadOperation(varName, req, res, next, bankOperationID) {
    BankOperation.find(bankOperationID, (err, operation) => {
        if (err)
            return h.sendErr(res, 'when preloading operation');

        if (!operation)
            return h.sendErr(res, 'preloaded operation not found', 404, 'not found');

        req.preloaded = req.preloaded || {};
        req.preloaded[varName] = operation;
        next();
    });
}

export function preloadBankOperation(req, res, next, bankOperationID) {
    preloadOperation('operation', req, res, next, bankOperationID);
}

export function preloadOtherBankOperation(req, res, next, otherOperationID) {
    preloadOperation('otherOperation', req, res, next, otherOperationID);
}


export function update(req, res) {
    let attr = req.body;

    // For now, we can only update the category id or operation type of an operation.
    if (typeof attr.categoryId === 'undefined' && typeof attr.operationTypeID === 'undefined')
        return h.sendErr(res, 'missing parameter categoryId or operationTypeID', 400, 'Missing parameter categoryId or operationTypeID');

    req.preloaded.operation.updateAttributes(attr, err => {
        if (err)
            return h.sendErr(res, 'when upadting attributes of operation');
        res.sendStatus(200);
    });
}


export function merge(req, res) {

    // @operation is the one to keep, @otherOperation is the one to delete.
    let needsSave = false;

    let otherOp = req.preloaded.otherOperation;
    let op = req.preloaded.operation;

    // Transfer various fields upon deletion
    for (let field of BankOperation.FieldsToTransferUponMerge) {
        if (typeof otherOp[field] !== 'undefined' && typeof op[field] === 'undefined') {
            op[field] = otherOp[field];
            needsSave = true;
        }
    }

    function thenProcess() {
        otherOp.destroy(err => {
            if (err)
                return h.sendErr(res, 'when deleting the operation to merge', 500, 'Internal error when deleting the operation to merge.');
            res.status(200).send(op);
        });
    }

    if (!needsSave)
        return thenProcess();

    op.save(err => {
        if (err)
            return h.sendErr(res, 'when updating the operation', 500, 'Internal error when updating the merged operation.');
        thenProcess();
    });
}


export function file(req, res, next) {
    let binaryPath = `/data/${req.params.bankOperationID}/binaries/file`;

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

    BankOperation.find(req.params.bankOperationID, (err, operation) => {
        if (err)
            return h.sendErr(res, 'when retrieving bank operation');

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
    });
}

