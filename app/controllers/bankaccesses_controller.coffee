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
    console.log body
    BankAccess.create body, (err, ba) ->
        if err
            send error: true, msg: "Server error while creating bank access.", 500
        else
            # we don't want to share password hashes 
            delete ba.password

            # scaffolding:
            BankAccount = compound.models.BankAccount
            BankOperation = compound.models.BankOperation

            for num in [1..3]
                body =
                    title: "Compte bancaire "+ num
                    bankAccess: ba.id
                    bank: ba.bank
                    amount: Math.floor(Math.random() * 10000)
                    initialAmount: 0
                    accountNumber: "FR 123 31321 41421 23"

                BankAccount.create body, (err, baccount) ->
                    if not err
                        for i in [1..Math.floor(Math.random() * 100)]
                            d = new Date()
                            d.setFullYear(1990 + Math.floor(Math.random() * 23))
                            d.setMonth(Math.floor(Math.random() * 12))
                            d.setDate(Math.floor(Math.random() * 28))
                            body =
                                bankAccount: baccount.id
                                title: Math.random().toString(36).slice(5) + " " + Math.random().toString(36).slice(10)
                                date: d
                                amount: (Math.floor(Math.random() * 10000) - Math.floor(Math.random() * 20000))
                                category: "whatever"
                            BankOperation.create body, () ->

            # scaffolding end
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