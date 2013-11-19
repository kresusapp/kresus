BaseView = require '../lib/base_view'
BankAccountsCollection = require '../collections/bank_accounts'
AccountsBankAccountView = require './accounts_bank_account'

module.exports = class AccountsBankView extends BaseView

    template: require('./templates/accounts_bank')
    templateModal: require('./templates/modal_confirm')

    className: 'bank-group'

    inUse: false

    events:
        "click a.delete-bank" : "confirmDeleteBank"

    subViews: []

    constructor: (@bank) ->
        super()

    initialize: ->
        @listenTo @bank.accounts, "add", @render

    confirmDeleteBank: (event) ->
        event.preventDefault()

        button = $ event.target

        data =
            title: window.i18n("accounts_delete_bank_title")
            body: window.i18n("accounts_delete_bank_prompt")
            confirm: window.i18n("accounts_delete_bank_confirm")

        $("body").prepend @templateModal(data)
        $("#confirmation-dialog").modal()
        $("#confirmation-dialog").modal("show")

        $("a#confirmation-dialog-confirm").bind "click", {button: button, bank: @bank, view: @}, @deleteBank

    deleteBank: (event) ->
        event.preventDefault()

        $("#confirmation-dialog").modal("hide")
        #$("#confirmation-dialog").remove()

        # recover the context
        view = event.data.view
        button = event.data.button
        bank = event.data.bank

        # user friendly buttons
        oldText = button.html()
        button.addClass "disabled"
        button.html window.i18n("removing") + " <img src='./loader_inverse.gif' />"

        $.ajax
            url: url = "banks/" + bank.get("id")
            type: "DELETE"
            success: ->
                # remove the accounts form inside
                bank.accounts.remove(bank.accounts.models)
                # empty the view
                view.$el.html ""
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
                        accountView = new AccountsBankAccountView account, view
                        view.subViews.push accountView
                        view.$("tbody#account-container").append accountView.render().el

                    # nicescroll
                    $(".content-right-column").niceScroll()
                    $(".content-right-column").getNiceScroll().onResize()

            error: () ->

                alert window.i18n("error_loading_accounts")
        @

    destroy: ->
        for view in @subViews
            view.destroy()
        super()
