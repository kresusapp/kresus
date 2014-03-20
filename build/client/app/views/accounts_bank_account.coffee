BaseView = require '../lib/base_view'
AccountsAlertsView = require './accounts_alerts'

module.exports = class AccountsBankAccountView extends BaseView

    template: require('./templates/accounts_bank_account')
    templateModal: require('./templates/modal_confirm')

    tagName: "tr"

    events:
        "click a.delete-account" : "confirmDeleteAccount"
        "click a.alert-management" : "showAlertManagement"

    constructor: (@model, @parent) ->
        super()

    showAlertManagement: (event) ->
        console.log "showAlertManagement"

        # destroy the previous one, if any
        @alertsView?.destroy()

        # create a new one
        @alertsView = new AccountsAlertsView @model

        # attach to body
        $("body").prepend @alertsView.render().el


    confirmDeleteAccount: (event) ->
        event.preventDefault()

        view = @
        parent = @parent

        button = $ event.target

        data =
            title: window.i18n("accounts_delete_account_title")
            body: window.i18n("accounts_delete_account_prompt")
            confirm: window.i18n("accounts_delete_account_confirm")

        $("body").prepend @templateModal(data)
        $("#confirmation-dialog").modal()
        #$("#confirmation-dialog").modal("show")

        $("a#confirmation-dialog-confirm").bind "click", {button: button, model: @model, parent: @parent, view: @}, @deleteAccount

    deleteAccount: (event) ->
        event.preventDefault()

        $("#confirmation-dialog").modal("hide")
        #$("#confirmation-dialog").remove()

        # recover the context
        parent = event.data.parent
        view = event.data.view
        button = event.data.button
        model = event.data.model

        # handle user firendly displaying progress
        oldText = button.html()
        button.addClass "disabled"
        button.html window.i18n("removing") + " <img src='./loader_inverse.gif' />"

        model.url = "bankaccounts/" + model.get("id")
        model.destroy
            success: (model) ->
                console.log "destroyed"
                view.destroy()
                # it it was the only account in this bank, remove the bank from the list
                if parent?.bank.accounts.length == 0
                    parent.destroy()
            error: (err) ->
                console.log "there was an error"
                console.log err

    render: () ->
        @$el.html @template
            model: @model
        @


    destroy: ->
        @alertsView?.destroy()
        super()