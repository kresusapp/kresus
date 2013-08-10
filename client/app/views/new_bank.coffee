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

    	#bankAccess = new BankAccessModel data

    	bankAccessModel.save data,
    		success: (model, response, options) ->
    			console.log "Added a new thing, cool !"
    		error: (model, xhr, options) ->
    			console.log "Error :" + xhr