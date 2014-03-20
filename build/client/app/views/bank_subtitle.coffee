BaseView = require '../lib/base_view'

module.exports = class BankSubTitleView extends BaseView

    template: require('./templates/balance_bank_subtitle')

    constructor: (@model) ->
        super()

    events:
        "click .row" : "chooseAccount"

    initialize: ->
        @listenTo @model, 'change', @render
        @listenTo window.activeObjects, 'changeActiveAccount', @checkActive

    chooseAccount: (event) ->
        console.log "Account chosen: " + @model.get("title")
        window.activeObjects.trigger "changeActiveAccount", @model

    checkActive: (account) ->
        @$(".row").removeClass("active")
        if account == @model
            @$(".row").addClass("active")
