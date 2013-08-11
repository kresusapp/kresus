BaseView = require '../lib/base_view'

BalanceBanksView = require './balance_banks'
BalanceOperationsView = require "./balance_operations"

module.exports = class BalanceView extends BaseView

    template: require('./templates/balance')

    el: 'div#content'

    elAccounts: '#balance-column-left'
    elOperations: '#balance-column-right'

    initialize: ->
        #@listenTo window.collections.banks, 'add', @renderBank
        @listenTo window.activeObjects, "new_access_added_successfully", @render

    renderBank: (bank) =>
        view = new BalanceBanksView bank
        $(@elAccounts).append view.render().el

    render: =>
        super()

        # prepare the operations list
        @operations = new BalanceOperationsView @$ @elOperations
        @operations.render()

        # prepare the banks list
        for bank in window.collections.banks.models
            @renderBank bank
        
        # TODO - fix the compability issue with niceScroll
        #@$('#balance-column-right').niceScroll()
        @
