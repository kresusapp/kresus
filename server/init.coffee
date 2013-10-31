module.exports = (callback) ->

    Bank = require './models/bank'

    # Bank initialization

    # initialization banks
    Bank.all (err, banks) ->
        if err or banks?.length is 0 # if there aren't any banks

            async = require 'async'
            bankList = require '../tests/fixtures/banks.json'

            process = (bank, callback) ->
                Bank.create name: bank.name, uuid: bank.uuid, (err) ->
                    if err?
                        callback err
                    else
                        callback null

            async.each bankList, process, (err) ->
                if err?
                    msg = "Couldn't add the bank to the database -- #{err}"
                    console.log msg
                else
                    msg = "Banks added to the database."
                    console.log msg

    # Start bank polling
    console.log "Start bank accounts polling..."
    poller = require './lib/accounts-poller'
    poller.start()

    # manage daily/weekly/monthly report
    console.log "Start alert watcher..."
    reportManager = require './lib/report-manager'
    reportManager.start()

    callback()