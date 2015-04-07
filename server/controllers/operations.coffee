BankOperation = require '../models/bankoperation'

module.exports.loadBankOperation = (req, res, next, bankOperationID) ->
    BankOperation.find bankOperationID, (err, operation) =>
        if err? or not operation?
            res.status(404).send(error: "BankOperation not found")
        else
            @operation = operation
            next()

module.exports.index = (req, res) ->
    BankOperation.all (err, operations) ->
        if err
            res.status(500).send(error: 'Server error occurred while retrieving data')
        else
            res.status(200).send(operations)

module.exports.show = (req, res) ->
    res.status(200).send(@operation)

module.exports.update = (req, res) ->
    attr = req.body

    # For now, we can only update the category id of an operation.
    if not attr.categoryId?
        res.status(400).send(error: 'Missing parameter categoryId')
        return

    @operation.updateAttributes attr, (err) ->
        if err?
            console.error 'when updating an operation: ' + err.toString()
            res.status(500).send(error: 'Server error when updating operation')
            return
        res.sendStatus(200)

module.exports.delete = (req, res) ->
    @operation.destroy (err) ->
        if err?
            res.status(500).send(error: 'Server error when deleting operation')
            return
        res.sendStatus(200)

module.exports.query = (req, res) ->

    paramAccounts = req.body.accounts or [-1]

    BankOperation.allFromBankAccounts paramAccounts, (err, operations) ->
        if err?
            res.status(500).send(error: 'Server error occurred while retrieving data')
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
                    res.status(500).send(error: errorMsg)
                else
                    res.status(200).send(results)


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
            res.status(500).send(error: "Server error while creating bank operation")
        else
            res.status(201).send(operation)
