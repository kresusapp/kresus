BaseView = require '../lib/base_view'
BankAccessModel = require '../models/bank_access'

module.exports = class NewBankView extends BaseView

    template: require('./templates/new_bank')

    el: 'div#add-bank-window'

    events:
        'click #btn-add-bank-save' : "saveBank"

    initialize: ->
        @$el.on 'hidden.bs.modal', =>
            @render()

    saveBank: (event) ->
        event.preventDefault()

        view = @

        button = $ event.target

        oldText = button.html()
        button.addClass "disabled"
        button.html window.i18n("verifying") + "<img src='./loader_green.gif' />"

        button.removeClass 'btn-warning'
        button.addClass 'btn-success'

        @$(".message-modal").html ""

        data =
            login: $("#inputLogin").val()
            password: $("#inputPass").val()
            bank: $("#inputBank").val()

        bankAccess = new BankAccessModel data

        bankAccess.save data,
            success: (model, response, options) ->
                button.html window.i18n("sent") + " <img src='./loader_green.gif' />"

                # fetch the new accounts:
                bank = window.collections.allBanks.get(data.bank)
                if bank?
                    console.log "Fetching for new accounts in bank" + bank.get("name")
                    bank.accounts.trigger "loading"
                    bank.accounts.fetch()

                # success message
                $("#add-bank-window").modal("hide")
                button.removeClass "disabled"
                button.html oldText

                window.activeObjects.trigger "new_access_added_successfully", model

                setTimeout () ->
                    $("#add-bank-window").modal("hide")
                    router = window.app.router
                    router.navigate '/', {trigger: true, replace: true}
                , 500

            error: (model, xhr, options) ->
                button.removeClass 'btn-success'
                button.removeClass 'disabled'
                button.addClass 'btn-warning'

                if xhr?.status? and xhr.status is 409
                    @$(".message-modal").html "<div class='alert alert-danger'>" + window.i18n("access already exists") + "</div>"
                    button.html window.i18n("access already exists button")
                else
                    @$(".message-modal").html "<div class='alert alert-danger'>" + window.i18n("error_check_credentials") + "</div>"
                    button.html window.i18n("error_check_credentials_btn")

    getRenderData: ->
        banks: window.collections.allBanks.models
