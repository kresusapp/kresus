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

        setIntervalWithContext checkAllAccounts, 1000 * 60 * 60 * 24, @
        #setIntervalWithContext checkAllAccounts, 1000 * 60 * 60, @
        checkAllAccounts()
