BaseView = require '../lib/base_view'

module.exports = class BankTitleView extends BaseView

    template: require('./templates/balance_bank_title')

    constructor: (@model) ->
        super()

    initialize: ->
        @listenTo @model, 'change', @render
