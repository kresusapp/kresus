async = require 'async'

log = (require 'printit')(
    prefix: 'init'
    date: true
)

module.exports = (app, server, callback) ->

    # Imports are within this scope, to ensure that americano-cozy is loaded
    # before we load any model
    Bank = require './models/bank'
    CozyInstance = require './models/cozyinstance'
    OperationTypes = require './models/operationtype'

    AllBanksData = require "../../weboob/banks-all.json"
    AllOperationTypes = require "../../weboob/operation-types.json"

    # Bank Operation type initialisation
    log.info "Maybe Adding operation types"
    async.each AllOperationTypes, OperationTypes.checkAndCreate, (err) ->
        if err?
            log.error "Error when adding operation: #{err}"
            return
        log.info "Success: all operation types added."

    # Bank initialization
    log.info "Maybe Adding banks..."
    async.each AllBanksData, Bank.createOrUpdate, (err) ->
        if err?
            log.error "Error when adding / updating bank: #{err}"
            return
        log.info "Success: All banks added."
        callback app, server if callback?

    # Start bank polling
    log.info "Starting bank accounts polling..."
    require('./lib/accounts-poller').start()

    # Manage daily/weekly/monthly report
    log.info "Starting alert watcher..."
    require('./lib/report-manager').start()
