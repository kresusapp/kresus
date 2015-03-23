moment = require 'moment'
async = require 'async'

BankAccess  = require "../models/bankaccess"

weboob = require './weboob-manager'

class AccountsPoller

    start: ->
        @prepareNextCheck()

    prepareNextCheck: ->
        # day after between 00:00am and 02:00am
        delta = Math.random() * 120 | 0 # opa asm.js style
        now = moment()
        nextUpdate = now.clone().add(1, 'days')
                            .hours(0)
                            .minutes(delta)
                            .seconds(0)

        format = "DD/MM/YYYY [at] HH:mm:ss"
        msg = "> Next check of bank accounts on #{nextUpdate.format(format)}"
        console.log msg
        @timeout = setTimeout(
            () =>
                @checkAllAccesses()
            , nextUpdate.diff(now))


    checkAllAccesses: ->
        console.log "Checking new operations for all bank accesses..."
        BankAccess.all (err, accesses) =>
            if err?
                console.log "Error when retrieving all bank accesses: #{err}"
                return

            process = (access, callback) ->
                weboob.retrieveAccountsByBankAccess access, callback

            async.each accesses, process, (err) =>
                if err?
                    console.log "Error when fetching accounts: #{err}"
                    return

                process = (access, callback) ->
                    weboob.retrieveOperationsByBankAccess access, callback

                async.each accesses, process, (err) =>
                    if err?
                        console.log "Error when fetching operations: #{err}"
                        return
                    console.log "All accounts have been polled."
                    @prepareNextCheck()



module.exports = new AccountsPoller
