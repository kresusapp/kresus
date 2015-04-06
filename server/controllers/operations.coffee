BankOperation = require '../models/bankoperation'

module.exports.loadBankOperation = (req, res, next, bankOperationID) ->
    BankOperation.find bankOperationID, (err, operation) =>
        if err? or not operation?
            res.send 404, error: "BankOperation not found"
        else
            @operation = operation
            next()

module.exports.index = (req, res) ->
    BankOperation.all (err, operations) ->
        if err
            res.send 500, error: 'Server error occurred while retrieving data'
        else
            res.send 200, operations

module.exports.show = (req, res) ->
    res.send 200, @operation

module.exports.update = (req, res) ->
    attr = req.body

    # For now, we can only update the category id of an operation.
    if not attr.categoryId?
        res.send 400, error: 'Missing parameter'
        return

    @operation.updateAttributes attr, (err) ->
        if err?
            console.error 'when updating an operation: ' + err.toString()
            res.send 500, error: 'Server error when updating operation'
            return
        res.send 200

module.exports.delete = (req, res) ->
    @operation.destroy (err) ->
        if err?
            res.send 500, error: 'Server error when deleting operation'
            return
        res.send 200

module.exports.query = (req, res) ->

    paramAccounts = req.body.accounts or [-1]

    BankOperation.allFromBankAccounts paramAccounts, (err, operations) ->
        if err?
            res.send 500, error: 'Server error occurred while retrieving data'
        else
            paramDateFrom =  new Date req.body.dateFrom
            paramDateTo = new Date req.body.dateTo
            paramAmountFrom =  Number req.body.amountFrom
            paramAmountTo = Number req.body.amountTo
            paramSearchText = req.body.searchText
            async = require "async"

            treatment = (operation, callback) ->
                # apply filters to dermine if the operation should be returned
                amount = Number operation.amount
                date = new Date operation.date
                title = operation.title.toLocaleUpperCase()
                paramQueryText = paramSearchText.toLocaleUpperCase()

                # dates
                if date < paramDateFrom or date > paramDateTo
                    callback null

                # amounts
                else if amount < paramAmountFrom or amount > paramAmountTo
                    callback null

                # text search
                else if paramSearchText? and paramSearchText isnt "" and \
                        title.search(paramQueryText) < 0
                    callback null

                # the right one
                else
                    callback null, operation

            # check all bank operations
            async.concat operations, treatment, (err, results) ->
                if err?
                    errorMsg = 'Server error occurred while retrieving data'
                    res.send 500, error: errorMsg
                else
                    res.send 200, results


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

    request = require('http').get options, (stream) ->

        if stream.statusCode is 200
            res.on 'close', -> request.abort()
            stream.pipe res
        else if stream.statusCode is 404
            res.status(404).send 'File not found'
        else
            res.sendStatus stream.statusCode


###
    dev only
###
module.exports.create = (req, res) ->
    console.log body
    BankOperation.create body, (err, operation) ->
        if err?
            res.send 500, error: "Server error while creating bank operation"
        else
            res.send 201, operation
