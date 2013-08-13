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
    async = require "async"

    console.log "Destroying all from bank #" + @bank.id

    # vars
    bank = @bank
    operations = []


    # delete BankAccesses
    operations.push (callback) ->

        # get all BankAccesses from this bank
        BankAccess.allFromBank bank, (err, baccesses) ->

            if err
                console.log "Could not get BankAccess from bank"
                callback err
            else
                treatment = (baccess, callback) ->
                    console.log "destroying access " + baccess.id
                    baccess.destroy callback

                async.each baccesses, treatment, callback

    # delete BankAccounts and their BankOperations
    operations.push (callback) ->

        # get BancAccounts
        BankAccount.allFromBank bank, (err, baccounts) ->

            if err
                console.log "Could not get BankAccounts from bank"
                callback err
            else
                treatment = (baccount, callback) ->

                    console.log "destroying BankOperations for " + baccount.title

                    # get all BankOperations
                    BankOperation.allFromBankAccount baccount, (err, boperations) ->

                        if err
                            callback err
                        else
                            treatment = (boperation, callback) ->
                                console.log "destroying operation " + boperation.id
                                boperation.destroy (err) ->
                                    if err
                                        console.log "could not destroy operation"
                                        callback err
                                    else
                                        callback()

                            # delete all BankOperations
                            async.each boperations, treatment, (err) ->

                                if err 
                                    console.log "Couldn't destroy one of operations"
                                    callback err
                                else
                                    console.log "destroying account " + baccount.title
                                    baccount.destroy (err) ->
                                        if err
                                            console.log "could not destroy bank account"
                                            callback err
                                        else
                                            callback()

                # delete all of BankAccounts
                async.each baccounts, treatment, callback

    # run the series
    async.series operations, (err) -> 
        if err
            send error: true, msg: "Server error while deleting: " + JSON.stringify(err), 500
        else
            send success: true, 200




