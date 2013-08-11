BaseView = require '../lib/base_view'

NavbarView = require 'views/navbar'
NewBankView = require 'views/new_bank'


AccountsView = require 'views/accounts'
BalanceView = require 'views/balance'


module.exports = class AppView extends BaseView

    template: require('./templates/app')

    el: 'body.application'

    afterRender: ->
        
        # init - get the necessary data
        window.collections.banks.fetch
        
            success: ->
                if not @navbarView
                    @navbarView = new NavbarView()
                if not @newbankView
                    @newbankView = new NewBankView()
                if not window.views.balanceView
                    window.views.balanceView = new BalanceView()
                if not window.views.accountsView
                    window.views.accountsView = new AccountsView()

                @navbarView.render()
                @newbankView.render()

                window.views.balanceView.render()
            error: ->
                console.log "Fatal error: could not get the banks list"
                alert "Something went wrong. Refresh."

