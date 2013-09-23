#!/usr/bin/env coffee

app = module.exports = (params) ->
    params = params || {}
    # specify current dir as default root of server
    params.root = params.root || __dirname
    return require('compound').createServer(params)

if not module.parent
    port = process.env.PORT || 9875
    host = process.env.HOST || "127.0.0.1"
    server = app()
    server.listen port, host, ->
        console.log(
            "Compound server listening on %s:%d within %s environment",
            host, port, server.set('env'))

        setIntervalWithContext = (code,delay,context) ->
            setInterval(() ->
                code.call(context)
            ,delay)


        # checking bank accounts job
        checkAllAccounts = () ->

            # check all accounts
            BankAccount   = server.models.BankAccount
            async         = require "async"

            console.log "Checking bank accounts"

            BankAccount.all (err, bankaccounts) ->
                if err
                    console.log "Error, could not get accounts to check"
                else
                    treatment = (ba, callback) ->
                        #console.log "Periodically checking " + ba.title + " for new operations"
                        BankAccount.getOperations ba, callback

                    async.eachSeries bankaccounts, treatment, (err) ->
                        if not err
                            console.log "Successfully checked all accounts"
                        else
                            console.log "ERROR could not check accounts"

        # set interval
        setIntervalWithContext checkAllAccounts, 1000 * 60 * 60 * 24, @
        checkAllAccounts()


        # sending reports
        sendReport = (type) ->
            # type values accepted are: daily, weekly, monthly

            #imports
            BankAlert       = server.models.BankAlert
            BankOperation   = server.models.BankOperation

            CozyAdapter     = require 'jugglingdb-cozy-adapter'

            async           = require "async"
            moment          = require "moment"
            request         = require 'request-json' 


            # calculate the time frame
            if type == "daily"
                days = -1
            else if type == "weekly"
                days = -7
            else
                days = -31

            lookback = moment().add("days", days)


            BankAlert.all (err, bankalerts) ->

                # there are alerts to check
                if not err

                    # choose the bank accounts for which we should generate the report
                    includedBankAccounts = []

                    for alert in bankalerts
                        if alert.type == "report" and alert.frequency == type
                            includedBankAccounts.push 
                                id: alert.bankAccount

                    console.log "Accounts gathered for a " + type + " report:"
                    console.log includedBankAccounts


                    addAllOperations = (baccount, cb) ->
                        BankOperation.allFromBankAccount baccount, cb

                    async.concat includedBankAccounts, addAllOperations, (err, results) ->

                        if not err

                            # choose the ones which are in the right time frame
                            operations = []
                            for operation in results
                                if moment(operation.date).isAfter(lookback)
                                    operations.push operation


                            console.log "Operations gathered for a " + type + " report:"
                            console.log operations

                            data =
                                from: "Cozy PFM <no-reply@cozycloud.cc>"
                                subject: "[Cozy-PFM] " + type + " report"
                                content: operations

                            # for some reason this helper doesn't work..
                            #CozyAdapter.sendMailToUser data, (err, response) ->

                            client = new request.JsonClient "http://localhost:9101/"
                            client.post "mail/to-user/", data, (error, response, body) ->
                                if not error
                                    console.log type + " report sent !"
                                    #console.log response
                                    #console.log body
                                else
                                    console.log error

                            console.log "Done"
                        else
                            console.log "Error getting operations"
                else
                    console.log "Fatal error: could not get BankAlerts"


        sendReportDaily = -> 
            sendReport "daily"
        sendReportWeekly = -> 
            sendReport "weekly"
        sendReportMonthly = -> 
            sendReport "monthly"

        dispatchJobs = ->
            d = new Date

            # daily
            sendReportDaily()

            # weekly
            if d.getDay() == 1
                sendReportWeekly()

            # monthly
            if d.getDate() == 1
                sendReportMonthly()

        setIntervalWithContext dispatchJobs, 1000 * 60 * 60 * 24, @
        dispatchJobs()












