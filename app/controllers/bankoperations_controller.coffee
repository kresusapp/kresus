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
            console.log "date from " + new Date(req.body.dateFrom)
            console.log "date to " + new Date(req.body.dateTo)
            console.log "amount from " + Number(req.body.amountFrom)
            console.log "amount to " + Number(req.body.amountTo)
            console.log "text " + req.body.searchText
            console.log "accounts " + req.body.accounts
            send 200

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