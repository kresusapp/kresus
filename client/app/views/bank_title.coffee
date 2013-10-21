BaseView = require '../lib/base_view'

module.exports = class BankTitleView extends BaseView

    template: require('./templates/balance_bank_title')

    constructor: (@model) ->
        super()

    initialize: ->
        @listenTo @model, 'change', @update
        @listenTo @model.accounts, "add", @update
        @listenTo @model.accounts, "destroy", @update
        @listenTo @model.accounts, "request", @displayLoading
        @listenTo @model.accounts, "change", @hideLoading

    displayLoading: ->
        @$(".bank-title-loading").show()

    hideLoading: ->
        @$(".bank-title-loading").hide()

    update: ->
        # update the sum
        @model.set("amount", @model.accounts.getSum())
        @$(".bank-amount").html Number(@model.get('amount')).money()

        # display or hide the bank title
        if @model.accounts.length == 0
            @$(".bank-title").hide()
            @$(".bank-balance").hide()
        else
            @$(".bank-title").show()
            @$(".bank-balance").show()

        # hide loader
        @$(".bank-title-loading").hide()

    render: ->
        super()
        @update()
        @