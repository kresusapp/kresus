before ->
    BankOperation.find req.params.id, (err, ba) =>
        if err or not ba
            send error: true, msg: "BankOperation not found", 404
        else
            @ba = ba
            next()
, only: ['show']



action 'index', ->
    BankOperation.all (err, bas) ->
        if err
            send error: true, msg: 'Server error occurred while retrieving data'
        else
            send bas, 201

action 'show', ->
    send @ba, 200

action 'query', ->
    BankOperation.all (err, bos) ->
        if err
            send error: true, msg: 'Server error occurred while retrieving data', 500
        else
            paramDateFrom =  new Date(req.body.dateFrom)
            paramDateTo = new Date(req.body.dateTo)
            paramAmountFrom =  Number(req.body.amountFrom)
            paramAmountTo = Number(req.body.amountTo)
            paramSearchText = req.body.searchText
            paramAccounts = req.body.accounts

            console.log "date from " + paramDateFrom
            console.log "date to " + paramDateTo
            console.log "amount from " + paramAmountFrom
            console.log "amount to " + paramAmountTo
            console.log "text " + paramSearchText
            console.log "accounts " + paramAccounts

            async = require "async"

            treatment = (boperation, callback) ->
                # apply filters to dermine if the operation should be returned

                # in the right account
                if not boperation.bankAccount in paramAccounts
                    callback null

                # dates
                else if boperation.date < paramDateFrom or boperation.date > paramDateTo
                    callback null

                # amounts
                else if boperation.amount < paramAmountFrom or boperation.amount > paramAmountTo
                    callback null

                # text search
                else if paramSearchText != "" and boperation.title.toLocaleUpperCase().search(paramSearchText.toLocaleUpperCase()) != 0

                # the right one
                else
                    callback null, boperation

            # check all bank operations
            async.concat bos, treatment, (err, results) ->
                if err
                    send error: true, msg: 'Server error occurred while retrieving data', 500
                else
                    send results, 200

###
    dev only
###
action 'create', ->
    console.log body
    BankOperation.create body, (err, ba) ->
        if err
            send error: true, msg: "Server error while creating bank operation", 500
        else
            send ba, 201