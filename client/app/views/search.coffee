BaseView = require '../lib/base_view'

SearchBankView = require './search_bank'
SearchOperationsView = require "./search_operations"

module.exports = class SearchView extends BaseView

    template: require('./templates/balance')

    el: 'div#content'

    elAccounts: '#balance-column-left'
    elOperations: '#balance-column-right'

    accounts: 0

    initialize: ->
        @listenTo window.activeObjects, "new_access_added_successfully", @noMoreEmpty

    noMoreEmpty: ->
        console.log "no more empty"
        @$(".arrow")?.hide()
        @$(".loading")?.hide()

    render: ->
        # lay down the template
        super()

        # prepare the operations list
        @operations = new SearchOperationsView @$(@elOperations)
        @operations.render()

        # prepare the banks list
        view = @
        
        treatment = (bank, callback) ->
            viewBank = new SearchBankView bank
            # load loading placeholder
            $(view.elAccounts).append viewBank.el
            # get bank accounts
            bank.accounts.fetch
                success: (col) ->
                    # return the number of accounts
                    callback null, col.length
                    viewBank.render()
                error: (col, err, opts) ->
                    callback null, col.length
                    viewBank.$el.html ""

        # render all banks
        async.concat window.collections.banks.models, treatment, (err, results) ->
            
            if err
                console.log err
                alert window.i18n "error_loading_accounts"

            @accounts = results.length

            $("#balance-column-left").niceScroll()
            $("#balance-column-left").getNiceScroll().onResize()
            
            # no accounts
            if @accounts == 0
                $(view.elAccounts).prepend require "./templates/balance_banks_empty"
            
        @
