BaseView = require '../lib/base_view'
BankAlertsCollection = require '../collections/bank_alerts'

module.exports = class AccountsAlertsView extends BaseView

    template: require "./templates/accounts_alerts"

    alerts: new BankAlertsCollection()

    events:
        "click .reports-add-periodic" : "addPeriodic"
        "click .reports-add-amount" : "addAmount"
        "click .reports-add-transaction" : "addTransaction"

    subViews: []

    constructor: (@account) ->
        @alerts.url = "bankalerts/getForBankAccount/" + @account.get("id")
        super()

    initialize: ->
                    
    render: ->

        # lay down the template
        @$el.html require "./templates/accounts_alerts"
        @$("#reports-dialog").modal()
        @$("#reports-dialog").modal("show")

        # display loading state

        # fetch and render alerts for this account
        @alerts.fetch
            success: (alerts) ->

            error: (err) ->


        @
