BaseView = require '../lib/base_view'
BankAccessModel = require '../models/bank_access'

module.exports = class NewBankView extends BaseView

    template: require('./templates/new_bank')

    el: 'div#add-bank-window'

    events:
        'click #btn-add-bank-save' : "saveBank"

    saveBank: (event) ->
        event.preventDefault()

        data =
            login: $("#inputLogin").val()
            pass: $("#inputPass").val()
            bank: $("#inputBank").val()

        console.log "save bank access: "
        console.log data

        bankAccess = new BankAccessModel data

        bankAccess.save data,
            success: (model, response, options) ->

                console.log "Added a new bank access: "
                
                alert "Success !"

                # TODO treatement - process etc
                
            error: (model, xhr, options) ->
                console.log "Error :" + xhr

    getRenderData: ->
        banks: window.collections.banks.models
