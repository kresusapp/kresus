before ->
    BankAlert.find req.params.id, (err, ba) =>
        if err or not ba
            send error: true, msg: "BankAlert not found", 404
        else
            next()
, only: ['show', 'update', 'destroy']



action 'index', ->
    BankAlert.all (err, bas) ->
        if err
            send error: true, msg: 'Server error occurred while retrieving data'
        else
            send bas, 201

action 'create', ->

    # create the bank alert
    BankAlert.create body, (err, ba) ->
        if err
            send error: true, msg: "Server error while creating bank alert.", 500
        else
            send ba, 201

action 'destroy', ->
    @ba.destroy (err) ->
        if err?
            send error: true, msg: "Server error while deleting the bank alert", 500
        else
            send success: true, 200

action 'update', ->
    @ba.updateAttributes body, (err, ba) ->
        if err?
            send error: true, msg: "Server error while saving bank alert", 500
        else
            send ba, 200

action 'getForBankAccount', ->

    BankAlert.allFromBankAccount req.params.id, (err , bas) ->
        if err?
            send error: true, msg: "Server error while getting bank alerts", 500
        else
            send ba, 200

action 'show', ->
    send @ba, 200
