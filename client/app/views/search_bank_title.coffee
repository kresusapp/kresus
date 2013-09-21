BaseView = require '../lib/base_view'

module.exports = class SearchBankTitleView extends BaseView

    template: require('./templates/search_bank_title')

    constructor: (@model) ->
        super()

    initialize: ->
        @listenTo @model.accounts, "add", @update
        @listenTo @model.accounts, "destroy", @update
        @listenTo @model.accounts, "request", @displayLoading
        @listenTo @model.accounts, "change", @hideLoading

    displayLoading: ->
        @$(".bank-title-loading").show()

    hideLoading: ->
        @$(".bank-title-loading").hide()

    update: ->

        # display or hide the bank title
        if @model.accounts.length == 0
            @$(".bank-title").hide()
            @$(".bank-title-checkbox").hide()
        else
            @$(".bank-title").show()
            @$(".bank-title-checkbox").show()

        # hide loader
        @$(".bank-title-loading").hide()

    render: ->
        super()
        @update()
        @