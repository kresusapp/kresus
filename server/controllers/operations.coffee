http = require 'http'

h = require './helpers'
BankOperation = require '../models/bankoperation'

module.exports.loadBankOperation = (req, res, next, bankOperationID) ->
    BankOperation.find bankOperationID, (err, operation) =>
        if err?
            h.sendErr res, 'when preloading operation'
            return

        if not operation?
            h.sendErr res, 'preloaded operation not found', 404, 'not found'
            return

        @operation = operation
        next()


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


module.exports.delete = (req, res) ->
    @operation.destroy (err) ->
        if err?
            h.sendErr res, 'when deleting operation'
            return

        res.sendStatus(200)


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

    request = http.get options, (stream) ->

        if stream.statusCode is 200
            # XXX note that this is dependent upon the real type, which could
            # be different from pdf...
            res.set 'Content-Type', 'application/pdf'
            res.on 'close', -> request.abort()
            stream.pipe res
        else if stream.statusCode is 404
            res.status(404).send 'File not found'
        else
            res.sendStatus stream.statusCode

