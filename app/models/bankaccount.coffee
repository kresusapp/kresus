module.exports = (compound, BankAccount) ->
    
    BankAccount.all = (callback) ->
        BankAccount.request "all", callback

    BankAccount.allFromBank = (bank, callback) ->
        params =
            key: bank.id
        BankAccount.request "allByBank", params, callback

    BankAccount.allFromBankAccess = (bankAccess, callback) ->
        params =
            key: bankAccess.id
        BankAccount.request "allByBankAccess", params, callback

    BankAccount.destroyAll = (callback) ->
        BankAccount.requestDestroy "all", callback

    BankAccount.getOperations = (baccount, callback) ->

        #debug
        console.log "Getting operations from Bank Account " + baccount.title 

        # imports
        Bank            = compound.models.Bank
        BankAccess      = compound.models.BankAccess
        BankOperation   = compound.models.BankOperation
        BankAlert       = compound.models.BankAlert

        async                   = require "async"
        NotificationHelper      = require 'cozy-notifications-helper'
        Notifications           = new NotificationHelper 'cozy-pfm', 9104
        request                 = require 'request-json' 
        client                  = new request.JsonClient 'http://localhost:9101'
        som                     = 0.0

        # get the bank Access
        BankAccess.find baccount.bankAccess, (err, baccess) ->

            # if sent a wrong bank access ID, 404
            if err or not baccess
                callback err
            else
        
                # get the bank from its ID to build the query
                Bank.find baccess.bank, (err, bank) ->

                    # if sent a wrong bank ID, 404
                    if err or not bank
                        callback err
                    else

                        # bank found, we cool
                        console.log "This Bank Account is for bank " + bank.name
                        
                        # get the list of notifications to make
                        BankAlert.allFromBankAccount baccount, (err, bankalerts) ->

                            if err
                                callback err
                            else

                                # build & send the request to the cozy data-system connector
                                data = 
                                    login:      baccess.login
                                    password:   baccess.password

                                # get operations and sort them by account
                                client.post '/connectors/bank/' + bank.uuid + "/history", data, (err, res, body) ->

                                    # if weboob not available, send error
                                    if err
                                        console.log "Weboob returns error:"
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

                                        # if any, get operations from this account & store them
                                        if operations[baccount.title]?

                                            saveOperation = (operation, callback) ->
                                                operation.bankAccount = baccount.id

                                                # if it's not yet in the database
                                                BankOperation.allLike operation, (err, operations) ->
                                                    if not operations or operations?.length == 0

                                                        console.log "New operation found:"
                                                        console.log operation

                                                        BankOperation.create operation, (err) ->
                                                            if not err

                                                                # update the sum
                                                                som = som + Number(operation.amount)

                                                                # send a notification, if applied
                                                                verifyAndApplyNotification = (bankalert, callback) ->

                                                                    if BankAlert.testTransaction operation, bankalert
                                                                        # prepare and save a notification
                                                                        params = 
                                                                            parent: null
                                                                            text: operation.title + ", " + operation.amount + " (" + operation.date + ")" 
                                                                            resource:
                                                                                app: "cozy-pfm"

                                                                        Notifications.createTemporary params, (err) ->
                                                                            if err
                                                                                console.log "Error creating a notification"
                                                                                console.log err
                                                                                callback err
                                                                            else
                                                                                callback()
                                                                
                                                                # test all alerts against this operation
                                                                async.each bankalerts, verifyAndApplyNotification, callback
                                                            else
                                                                callback err
                                                    else
                                                        callback()

                                            # save all operation
                                            async.each operations[baccount.title], saveOperation, (err) ->

                                                if err
                                                    callback err
                                                else
                                                    # update the account
                                                    BankAccount.find baccount.id, (err, baccount) ->
                                                        baccount.lastChecked = new Date()
                                                        baccount.amount = Number(baccount.amount) + Number(som)
                                                        baccount.save callback

