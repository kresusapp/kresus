BaseView = require '../lib/base_view'
BankAlertsCollection = require '../collections/bank_alerts'
AccountsAlertsAlertView = require './accounts_alerts_alert'
BankAlert = require '../models/bank_alert'

module.exports = class AccountsAlertsView extends BaseView

    template: require "./templates/accounts_alerts"

    elPeriodic: "#reports-body-periodic"
    elAmount: "#reports-body-amount"
    elTransaction: "#reports-body-transaction"

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
        @data = 
            bankAccount: @account.get("id")


    addPeriodic: (event) ->
        @addSubView "report", @elPeriodic

    addAmount: (event) ->
        @addSubView "balance", @elAmount

    addTransaction: (event) ->
        @addSubView "transaction", @elTransaction



    addSubView: (type, el) ->
        # prepare the data
        @data.type = type
        model = new BankAlert @data

        # create the view
        view  = new AccountsAlertsAlertView model, @
        @subViews.push view

        # display
        @$(el).append view.render().el

    appendSubView: (viewAlert) =>

        # get the right place to add it
        if viewAlert?.alert?.get("type") == "report"
            element = @elPeriodic
        else if viewAlert?.alert?.get("type") == "balance"
            element = @elAmount
        else
            element = @elTransaction

        # add it
        @subViews.push viewAlert
        @$(element).append viewAlert.render().el

    render: ->

        view = @

        # lay down the template
        @$el.html @template
        @$("#reports-dialog").modal()
        @$("#reports-dialog").modal("show")

        # display loading state

        # fetch and render alerts for this account
        @alerts.fetch
            success: (alerts) ->
                for alert in alerts.models
                    viewAlert = new AccountsAlertsAlertView alert, view
                    view.appendSubView viewAlert
            error: (err) ->

        @

    destroy: ->
        for view in @subViews
            view.destroy()
        super()