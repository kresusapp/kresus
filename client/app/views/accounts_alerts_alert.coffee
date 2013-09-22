BaseView = require '../lib/base_view'
BankAlert = require '../models/bank_alert'

module.exports = class AccountsAlertsAlertView extends BaseView

    template: require "./templates/accounts_alerts_alert"

    events:
        "click .reports-save" : "save"
        "click .reports-cancel" : "destroy"
        "click .reports-delete" : "removeAlert"
        "click .reports-edit" : "edit"

    constructor: (@alert, @parent) ->
        super()

    initialize: ->

    save: ->

        view = @

        # get the data
        if @alert.get("type") == "report"
            @alert.set "frequency", @$(".reports-frequency").val()
        else if @alert.get("type") == "balance"
            @alert.set "order", @$(".reports-order").val()
            @alert.set "limit", @$(".reports-limit").val()
        else
            #

        # save the report to the server
        @alert.save {},
            success: ->
                console.log "Alert saved to server"
                view.render()
            error: ->
                console.log "error"

    removeAlert: ->

        view = @

        @alert.url = "bankalerts/" + @alert.get("id")
        @alert.destroy
            success: ->
                console.log "Alert deleted from server"
                view.destroy()
            error: ->
                console.log "error"
                    
    render: ->
        # lay down the template
        @$el.html @template
            model: @alert
        @
