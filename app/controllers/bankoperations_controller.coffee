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