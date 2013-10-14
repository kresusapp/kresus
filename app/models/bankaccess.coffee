module.exports = (compound, BankAccess) ->
    
    BankAccess.all = (callback) ->
        BankAccess.request "all", callback

    BankAccess.allFromBank = (bank, callback) ->
        params =
            key: bank.id
        BankAccess.request "allByBank", params, callback

    BankAccess.destroyAll = (callback) ->
        BankAccess.requestDestroy "all", callback

    BankAccess.getAccounts = (ba, callback) ->

        #debug
        console.log "Getting accounts from Bank Access " + ba.id 

        # imports
        Bank            = compound.models.Bank
        BankAccount     = compound.models.BankAccount
        BankOperation   = compound.models.BankOperation

        async           = require "async"
        request         = require('request-json')
        client          = new request.JsonClient 'http://localhost:9101'

        
        # get the bank from it's ID, to build the query
        Bank.find ba.bank, (err, bank) ->

            # if sent a wrong bank ID, 404
            if err or not bank
                callback err
            else

                #debug
                console.log "This Bank Access is for bank " + bank.name

                # build & send the request to the cozy data-system connector
                data = 
                    login:      ba.login
                    password:   ba.password
                
                client.post '/connectors/bank/' + bank.uuid + "/", data, (err, res, body) ->

                    # if weboob not available, send error
                    if err
                        console.log err
                        callback err
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
                                callback err
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

                                                console.log "With operations:"
                                                console.log operations[account.title]

                                                saveOperation = (operation, callback) ->
                                                    operation.bankAccount = account.id
                                                    BankOperation.create operation, callback

                                                async.each operations[account.title], saveOperation, callback

                                async.each accounts, treatment, callback
