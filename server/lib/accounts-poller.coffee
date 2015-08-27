moment = require 'moment'
async = require 'async'

log = (require 'printit')(
    prefix: 'accounts-poller'
    date: true
)

BankAccess  = require "../models/access"
Config      = require "../models/kresusconfig"

AccountManager = require './accounts-manager'

class AccountsPoller

    start: ->
        @prepareNextCheck()

    prepareNextCheck: ->

        if @timeout?
            clearTimeout @timeout
            @timeout = null

        # day after between 02:00am and 04:00am UTC
        delta = Math.random() * 120 | 0 # opa asm.js style
        now = moment()
        nextUpdate = now.clone().add(1, 'days')
                            .hours(2)
                            .minutes(delta)
                            .seconds(0)

        format = "DD/MM/YYYY [at] HH:mm:ss"
        log.info "> Next check of bank accounts on #{nextUpdate.format(format)}"

        @timeout = setTimeout (@checkAllAccesses.bind @), nextUpdate.diff(now)


    checkAllAccesses: ->
        log.info "Checking new operations for all bank accesses..."
        BankAccess.all (err, accesses) =>
            if err?
                log.info "Error when retrieving all bank accesses: #{err}"
                return

            process = (access, callback) ->
                accountManager = new AccountManager
                accountManager.retrieveOperationsByBankAccess access, callback

            async.each accesses, process, (err) =>
                if err?
                    log.info "Error when polling accounts: #{JSON.stringify err}"
                    return
                log.info "All accounts have been polled."
                @prepareNextCheck()

module.exports = accountPoller = new AccountsPoller

Config.byName 'weboob-installed', (err, found) ->
    if err? or not found? or found.value isnt 'true'
        return
    accountPoller.checkAllAccesses()

