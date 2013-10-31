async       = require "async"
moment      = require "moment"
BankAccess  = require "../models/bankaccess"

class AccountsPoller

    start: ->
        @prepareNextCheck()

    prepareNextCheck: ->
        # day after between 00:00am and 04:00am
        delta =  Math.floor(Math.random() * 180)
        now = moment()
        nextUpdate = now.clone().add(1, 'days')
                            .hours(1)
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
        BankAccess.retrieveOperationsForAllAccesses (err) =>
            if err?
                console.log "An error occurred during access check -- #{err}"

            console.log "Bank accesses checked."
            @prepareNextCheck()

module.exports = new AccountsPoller