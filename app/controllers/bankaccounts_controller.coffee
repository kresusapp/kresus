before ->
    BankAccount.find req.params.id, (err, ba) =>
        if err or not ba
            send error: true, msg: "BankAccount not found", 404
        else
            @ba = ba
            next()
, only: ['show', 'delete', 'getOperations']



action 'index', ->
    BankAccount.all (err, bas) ->
        if err
            send error: true, msg: 'Server error occurred while retrieving data'
        else
            send bas, 201

action 'delete', ->
    @ba.destroy (err) ->
        if err?
            send error: true, msg: "Server error while deleting the bank account", 500
        else
            send success: true, 200

action 'show', ->
    send @ba, 200

ction 'getOperations', ->
    BankOperation = compound.models.BankOperation
    BankOperation.allFromBankAccount @ba, (err, bo) ->
        if err
            send error: true, msg: 'Server error occurred while retrieving data', 500
        else
            send bo, 200


###
    dev only
###
action 'create', ->
    console.log body
    BankAccount.create body, (err, ba) ->
        if err
            send error: true, msg: "Server error while creating bank account", 500
        else
            send ba, 201