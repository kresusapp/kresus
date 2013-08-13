BaseView = require '../lib/base_view'
BankAccountsCollection = require '../collections/bank_accounts'
AccountsBankAccountView = require './accounts_bank_account'

module.exports = class AccountsBanksView extends BaseView

    template: require('./templates/accounts_bank')

    className: 'bank-group'

    inUse: false

    events:
        "click a.delete-bank" : "deleteBank" 

    constructor: (@model) ->
        super()

    initialize: ->
        @accounts = new BankAccountsCollection()
        @accounts.url = "banks/getAccounts/" + @model.get("id")

    deleteBank: (event) ->
        event.preventDefault()

        view = @

        button = $ event.target

        if not @inUse and confirm window.i18n("alert_sure_delete_bank")

            @inUse = true
            oldText = button.html()
            button.addClass "disabled"
            button.html window.i18n("removing") + " <img src='./loader_red.gif' />"

            $.ajax
                url: url = "banks/" + @model.get("id")
                type: "DELETE"
                success: (model) ->
                    console.log "destroyed"
                    view.destroy()
                error: (err) ->
                    console.log "there was an error"
                    console.log err
                    inUse = false

    render: ->

        view = @
        viewEl = @$el
        
        # get all accounts in this bank
        @accounts.fetch

            success: (accounts) ->
                
                # add the bank header
                view.$el.html view.template
                    model: view.model

                # add views for accounts, and store them in the table
                for account in accounts.models
                    accountView = new AccountsBankAccountView account
                    view.$("tbody#account-container").append accountView.render().el
                    console.log view.$("tbody#account-container")

                # hide the bank if there are no accounts
                if accounts.length == 0
                    view.$el.html ""

            error: () ->

                alert window.i18n("error_loading_accounts")
        @
