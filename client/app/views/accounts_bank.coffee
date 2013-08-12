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
        @accounts.url = "/banks/getAccounts/" + @model.get("id")

    deleteBank: (event) ->
        event.preventDefault()

        view = @

        button = $ event.target

        if not @inUse and confirm "Are you sure ? This will remove all of your data from this bank, and can't be undone."

            @inUse = true
            oldText = button.html()
            button.addClass "disabled"
            button.html "removing... <img src='/loader.gif' />"

            @model.url = "/banks/" + @model.get("id")
            @model.destroy
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

                alert "There was an error loading bank accounts. Please refresh and try again later."
        @
