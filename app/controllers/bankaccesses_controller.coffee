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

    # imports
    Bank = compound.models.Bank
    BankAccount = compound.models.BankAccount
    BankOperation = compound.models.BankOperation

    async = require "async"
    request = require('request-json')
    client = new request.JsonClient 'http://localhost:9101'

    # create the bank access
    BankAccess.create body, (err, ba) ->
        if err
            send error: true, msg: "Server error while creating bank access.", 500
        else

            # let's get the bank from it's ID
            Bank.find ba.bank, (err, bank) ->

                # if sent a wrong bank ID, 404
                if err or not bank
                    send error: true, msg: "Bank not found", 404
                else

                    # send the request to the cozy data-system connector
                    data = 
                        login:      ba.login
                        password:   ba.password
                    
                    client.post '/connectors/bank/' + bank.uuid + "/", data, (err, res, body) ->

                        # if weboob not available, send error
                        if err
                            console.log err
                            send error: true, msg: "Could not get the accounts weboob", 501
                        else

                            # get bank accounts from weboob
                            accountsWeboob = body["#{bank.uuid}"]
                            accounts = []

                            for accountWeboob in accountsWeboob
                                account = 
                                        bank: bank.id
                                        bankAccess: ba.id
                                        title: accountWeboob.label
                                        accountNumber: "0"
                                        amount: accountWeboob.balance
                                        initialAmount: accountWeboob.balance
                                        lastChecked: new Date()
                                accounts.push account

                            console.log "Bank Accounts found:"
                            console.log accounts


                            # get operations and sort them by account
                            client.post '/connectors/bank/' + bank.uuid + "/history", data, (err, res, body) ->

                                # if weboob not available, send error
                                if err
                                    console.log err
                                    send error: true, msg: "Could not get the operations weboob", 501
                                else

                                    # get bank accounts from weboob
                                    operationsWeboob = body["#{bank.uuid}"]
                                    operations = []

                                    for operationWeboob in operationsWeboob
                                        operation = 
                                            title: operationWeboob.label
                                            amount: operationWeboob.amount
                                            date: operationWeboob.date

                                        # sort them by account
                                        if not operations[operationWeboob.account]
                                            operations[operationWeboob.account] = []

                                        operations[operationWeboob.account].push operation

                                    console.log "Bank Operations found:"
                                    console.log operations

                                    treatment = (account, callback) ->
                                        # save bank accounts to the database
                                        BankAccount.create account, (err, account) ->

                                            if err
                                                console.log err
                                                callback err
                                            else
                                                console.log "Successfully created a bank account:"
                                                console.log account

                                                # if any, get operations from this account & store them
                                                if operations[account.title]?

                                                    saveOperation = (operation, callback) ->
                                                        operation.bankAccount = account.id
                                                        BankOperation.create operation, callback

                                                    async.each operations[account.title], saveOperation, callback

                                    async.each accounts, treatment, (err) ->
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