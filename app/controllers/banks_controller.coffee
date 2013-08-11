before ->
    Bank.find req.params.id, (err, bank) =>
        if err or not bank
            send error: true, msg: "Bank not found", 404
        else
            @bank = bank
            next()
, only: ['show', 'getAccesses', 'getAccounts', 'destroy']



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

action 'destroy', ->
    BankAccess = compound.models.BankAccess
    BankAccount = compound.models.BankAccount
    BankOperation = compound.models.BankOperation

    console.log "Destroying all from bank #" + @bank.id

    bank = @bank

    async = require "async"

    # delete BankAccesses
    console.log "destroying BankAccesses"
    BankAccess.allFromBank bank, (err, baccesses) ->

        if err 
            send error: true, msg: "Server error while deleting", 500

        for baccess in baccesses
            console.log "destroying access " + baccess.id
            baccess.destroy () ->

    # delete BankAccounts & their operations
    BankAccount.allFromBank @bank, (err, baccounts) ->

        if err then send error: true, msg: "Server error while deleting", 500

        for baccount in baccounts

            # flush operations
            BankOperation.allFromBankAccount baccount, (err, boperations) ->

                if err
                    send error: true, msg: "Server error while deleting", 500

                for boperation in boperations
                    console.log "destroying operation " + boperation.id
                    boperation.destroy () ->

            console.log "destroying account" + baccount.id
            baccount.destroy () ->

    send success: true, 200
