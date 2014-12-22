async = require 'async'

module.exports = (app, server, callback) ->

    # Imports are within this scope, to ensure that americano-cozy is loaded
    # before we load any model.
    Bank = require './models/bank'
    CozyInstance = require './models/cozyinstance'
    AllBanksData = require "../tests/fixtures/banks-all.json"

    # In debug env mode, intercept weboob requests
    require '../tests/mock-weboob'

    # Bank initialization
    console.log "Maybe Adding banks..."
    Bank.all (err, banks) ->
        if err
            console.error err
            return

        if banks?.length is 0 # if there aren't any banks
            process = (bank, pcb) ->
                Bank.create name: bank.name, uuid: bank.uuid, pcb

            async.each AllBanksData, process, (finalErr) ->
                # Final callback
                if finalErr?
                    console.error "Error when adding bank: #{finalErr}"
                else
                    console.log "Success: All banks added."
                callback app, server if callback?
        else
            console.log "Success: Banks were already present."
            callback app, server if callback?

    # Start bank polling
    console.log "Starting bank accounts polling..."
    require('./lib/accounts-poller').start()

    # manage daily/weekly/monthly report
    console.log "Starting alert watcher..."
    require('./lib/report-manager').start()
