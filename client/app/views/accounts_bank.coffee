BaseView = require '../lib/base_view'
BankAccountsCollection = require '../collections/bank_accounts'
AccountsBankAccountView = require './accounts_bank_account'

module.exports = class AccountsBankView extends BaseView

    template: require('./templates/accounts_bank')

    className: 'bank-group'

    inUse: false

    events:
        "click a.delete-bank" : "deleteBank" 

    constructor: (@bank) ->
        super()

    initialize: ->
        @listenTo @bank.accounts, "add", @render

    deleteBank: (event) ->
        event.preventDefault()

        view = @

        button = $ event.target

        if not @inUse and confirm window.i18n("alert_sure_delete_bank")

            @inUse = true
            oldText = button.html()
            button.addClass "disabled"
            button.html window.i18n("removing") + " <img src='./loader_red.gif' />"

            # notify the navbar
            window.collections.banks.trigger "update"

            bank = @bank

            $.ajax
                url: url = "banks/" + bank.get("id")
                type: "DELETE"
                success: (model) ->
                    console.log "destroyed"
                    bank.set("amount", 0)
                    view.destroy()
                error: (err) ->
                    console.log "there was an error"
                    console.log err
                    inUse = false
                    
    render: ->

        view = @
        viewEl = @$el
        bank = @bank
        
        # get all accounts in this bank
        @bank.accounts.fetch

            success: (accounts) ->

                # calculate the balance
                bank.set("amount", bank.accounts.getSum())
                
                # add the bank header
                if accounts.length > 0
                    view.$el.html view.template
                        model: view.bank

                    # add views for accounts, and store them in the table
                    for account in accounts.models
                        accountView = new AccountsBankAccountView account
                        view.$("tbody#account-container").append accountView.render().el

            error: () ->

                alert window.i18n("error_loading_accounts")
        @
