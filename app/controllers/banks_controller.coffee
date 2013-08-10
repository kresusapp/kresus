before ->
    Bank.find req.params.id, (err, bank) =>
        if err or not bank
            send error: true, msg: "Bank not found", 404
        else
            @bank = bank
            next()
, only: ['show', 'getAccesses', 'getAccounts']



action 'index', ->
    Bank.all (err, banks) ->
        if err
            send error: true, msg: 'Server error occurred while retrieving data', 500
        else
            send banks

action 'show', ->
    send @bank, 200

action 'getAccesses', ->
    BankAccess = compound.models.BankAccess
    BankAccess.allFromBank @bank, (err, bas) ->
        if err
            send error: true, msg: 'Server error occurred while retrieving data', 500
        else
            send bas, 200

action 'getAccounts', ->
    BankAccount = compound.models.BankAccount
    BankAccount.allFromBank @bank, (err, bas) ->
        if err
            send error: true, msg: 'Server error occurred while retrieving data', 500
        else
            send bas, 200