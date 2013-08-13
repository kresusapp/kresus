before ->
    BankAccount.find req.params.id, (err, ba) =>
        if err or not ba
            send error: true, msg: "BankAccount not found", 404
        else
            @ba = ba
            next()
, only: ['show', 'destroy', 'getOperations']



action 'index', ->
    BankAccount.all (err, bas) ->
        if err
            send error: true, msg: 'Server error occurred while retrieving data'
        else
            send bas, 201

action 'destroy', ->
    
    BankOperation = compound.models.BankOperation
    async = require "async"
    baccount = @ba

    console.log "destroying BankOperations for " + baccount.title

    # get all BankOperations
    BankOperation.allFromBankAccount baccount, (err, boperations) ->

        if err
            send error: true, msg: 'Could not find operations: ' + err, 500
        else
            treatment = (boperation, callback) ->
                console.log "destroying operation " + boperation.id
                boperation.destroy callback

            # delete all BankOperations
            async.eachSeries boperations, treatment, (err) ->

                if err then callback err
                
                console.log "destroying account " + baccount.title
                baccount.destroy (err) ->
                    if err
                        send error: true, msg: 'Server error occurred while retrieving data', 500
                    else
                        send success: true, 200

action 'show', ->
    send @ba, 200

action 'getOperations', ->
    BankOperation = compound.models.BankOperation
    BankOperation.allFromBankAccountDate @ba, (err, bo) ->
        if err
            send error: true, msg: 'Server error occurred while retrieving data', 500
        else
            send bo, 200
