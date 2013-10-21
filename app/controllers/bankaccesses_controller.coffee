before ->
    BankAccess.find req.params.id, (err, ba) =>
        if err or not ba
            send error: true, msg: "BankAccess not found", 404
        else
            # we don't want to share password hashes 
            delete ba.password
            @ba = ba
            next()
, only: ['show', 'update', 'destroy', 'getAccounts']



action 'index', ->
    BankAccess.all (err, bas) ->
        if err
            send error: true, msg: 'Server error occurred while retrieving data'
        else
            send bas, 201

action 'create', ->

    # create the bank access
    BankAccess.create body, (err, ba) ->
        if err
            send error: true, msg: "Server error while creating bank access.", 500
        else
            BankAccess.getAccounts ba, (err) ->
                if err
                    send error: true, msg: "Could not save bank accounts to DB", 500
                else
                    console.log "Bank Accounts created successfully"
                    send ba, 201

action 'destroy', ->
    @ba.destroy (err) ->
        if err?
            send error: true, msg: "Server error while deleting the bank access", 500
        else
            send success: true, 200

action 'update', ->
    @ba.updateAttributes body, (err, ba) ->
        if err?
            send error: true, msg: "Server error while saving bank access", 500
        else
            send ba, 200

action 'show', ->
    send @ba, 200

action 'getAccounts', ->
    BankAccount = compound.models.BankAccount
    BankAccount.allFromBankAccess @ba, (err, bas) ->
        if err
            send error: true, msg: 'Server error occurred while retrieving data', 500
        else
            send bas, 200