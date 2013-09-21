BaseView = require '../lib/base_view'
AccountsBankView = require './accounts_bank'

module.exports = class AccountsView extends BaseView

    template: require('./templates/accounts')

    el: 'div#content'
    elBanks: '.content-right-column'

    subViews: []

    render: ->

        # load the template
        super()

        # prepare the banks list
        for bank in window.collections.banks.models
            view = new AccountsBankView bank
            @subViews.push view
            @$(@elBanks).append view.render().el
        
        # TODO - fix the compability issue with niceScroll
        #@$('#layout-2col-column-right').niceScroll()
        @

    empty: ->
        for view in @subViews
            view.destroy()