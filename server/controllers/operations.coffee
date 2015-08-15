http = require 'http'

h = require './helpers'
BankOperation = require '../models/bankoperation'

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

    # For now, we can only update the category id of an operation.
    if not attr.categoryId?
        h.sendErr res, 'missing parameter categoryId', 400, 'Missing parameter categoryId'
        return

    @operation.updateAttributes attr, (err) ->
        if err?
            h.sendErr res, 'when upadting attributes of operation'
            return

        res.sendStatus(200)


module.exports.merge = (req, res) ->

    # @operation is the one to keep, @otherOperation is the one to delete.
    needsSave = false

    # Transfer category upon deletion
    if @otherOperation.categoryId? and not @operation.categoryId?
        @operation.categoryId = @otherOperation.categoryId
        needsSave = true

    # Transfer binary attachment upon deletion
    if @otherOperation.binary? and not @operation.binary?
        @operation.binary = @otherOperation.binary
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

