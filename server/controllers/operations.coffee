http = require 'http'

h = require './helpers'
BankOperation = require '../models/operation'

preloadOperation = (varName, req, res, next, bankOperationID) ->
    BankOperation.find bankOperationID, (err, operation) =>
        if err?
            h.sendErr res, 'when preloading operation'
            return

        if not operation?
            h.sendErr res, 'preloaded operation not found', 404, 'not found'
            return

        @[varName] = operation
        next()

module.exports.loadBankOperation = (req, res, next, bankOperationID) ->
    preloadOperation 'operation', req, res, next, bankOperationID

module.exports.loadOtherBankOperation = (req, res, next, otherOperationID) ->
    preloadOperation 'otherOperation', req, res, next, otherOperationID

module.exports.index = (req, res) ->
    BankOperation.all (err, operations) ->
        if err?
            h.sendErr res, 'when retrieving bank operation'
            return

        res.status(200).send(operations)


module.exports.show = (req, res) ->
    res.status(200).send(@operation)


module.exports.update = (req, res) ->
    attr = req.body

    # For now, we can only update the category id or operation type of an operation.
    if not attr.categoryId? and not attr.operationTypeID?
        h.sendErr res, 'missing parameter categoryId or operationTypeID', 400, 'Missing parameter categoryId or operationTypeID'
        return

    @operation.updateAttributes attr, (err) ->
        if err?
            h.sendErr res, 'when upadting attributes of operation'
            return

        res.sendStatus(200)


module.exports.merge = (req, res) ->

    # @operation is the one to keep, @otherOperation is the one to delete.
    needsSave = false

    # Transfer various fields upon deletion
    for field in BankOperation.FieldsToTransferUponMerge
        if @otherOperation[field]? and not @operation[field]?
            @operation[field] = @otherOperation[field]
            needsSave = true

    thenProcess = () ->
        @otherOperation.destroy (err) ->
            if err
                h.sendErr res, 'when deleting the operation to merge', 500, 'Internal error when deleting the operation to merge.'
                return

            res.status(200).send @operation

    if needsSave
        @operation.save (err) ->
            if err
                h.sendErr res, 'when updating the operation', 500, 'Internal error when updating the merged operation.'
                return
            thenProcess()
    else
        thenProcess()


module.exports.file = (req, res, next) ->
    binaryPath = "/data/#{req.params.bankOperationID}/binaries/file"

    id = process.env.NAME
    pwd = process.env.TOKEN
    basic = "Basic #{new Buffer("#{id}:#{pwd}").toString('base64')}"
    options =
        host: 'localhost'
        port: 9101
        path: binaryPath
        headers:
            Authorization: basic
    BankOperation.find req.params.bankOperationID, (err, operation) =>
        if err?
            h.sendErr res, 'when retrieving bank operation'
            return
        request = http.get options, (stream) ->
            if stream.statusCode is 200
                fileMime = operation.binary.fileMime
                fileMime ?= 'application/pdf'
                res.set 'Content-Type', fileMime
                res.on 'close', -> request.abort()
                stream.pipe res
            else if stream.statusCode is 404
                res.status(404).send 'File not found'
            else
                res.sendStatus stream.statusCode

