BaseView = require '../lib/base_view'

module.exports = class AccountsBankAccountView extends BaseView

    template: require('./templates/accounts_bank_account')

    tagName: "tr"

    events:
        "click a.delete-account" : "deleteAccount" 

    constructor: (@model, @parent) ->
        super()

    deleteAccount: (event) ->
        event.preventDefault()

        view = @
        parent = @parent

        button = $ event.target

        if not @inUse and confirm window.i18n("alert_sure_delete_account")

            @inUse = true
            oldText = button.html()
            button.addClass "disabled"
            button.html window.i18n("removing") + " <img src='./loader_yellow.gif' />"

            @model.url = "bankaccounts/" + @model.get("id")
            @model.destroy
                success: (model) ->
                    console.log "destroyed"
                    view.destroy()
                    # it it was the only account in this bank, remove the bank from the list
                    if parent?.bank.accounts.length == 0
                        parent.destroy()
                error: (err) ->
                    console.log "there was an error"
                    console.log err
                    inUse = false

    render: () ->
        @$el.html @template
            model: @model
        @