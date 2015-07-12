async = require 'async'

module.exports = (app, server, callback) ->

    # Imports are within this scope, to ensure that americano-cozy is loaded
    # before we load any model
    Bank = require './models/bank'
    CozyInstance = require './models/cozyinstance'
    AllBanksData = require "../../weboob/banks-all.json"

    # Bank initialization
    console.log "Maybe Adding banks..."
    async.each AllBanksData, Bank.createOrUpdate, (err) ->
        if err?
            console.error "Error when adding / updating bank: #{err}"
            return
        console.log "Success: All banks added."
        callback app, server if callback?

    # Start bank polling
    console.log "Starting bank accounts polling..."
    require('./lib/accounts-poller').start()

    # Manage daily/weekly/monthly report
    console.log "Starting alert watcher..."
    require('./lib/report-manager').start()
