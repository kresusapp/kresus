BaseView = require '../lib/base_view'

NavbarView = require 'views/navbar'
NewBankView = require 'views/new_bank'

AccountsView = require 'views/accounts'
BalanceView = require 'views/balance'
SearchView = require 'views/search'


module.exports = class AppView extends BaseView

    template: require('./templates/app')

    el: 'body.application'

    afterRender: ->

        # init - get the necessary data
        window.collections.banks.fetch
            data:
                withAccountOnly: true
            success: ->

                window.collections.allBanks.fetch
                    success: ->
                        if not @navbarView
                            @navbarView = new NavbarView()
                        if not @newbankView
                            @newbankView = new NewBankView()
                        if not window.views.balanceView
                            window.views.balanceView = new BalanceView()
                        if not window.views.accountsView
                            window.views.accountsView = new AccountsView()
                        if not window.views.searchView
                            window.views.searchView = new SearchView()

                        @navbarView.render()
                        @newbankView.render()

                        # start routing
                        Backbone.history.start()
                    error: ->

                        # could not get banks, or 0 banks available - fatal error
                        console.log "Fatal error: could not get the banks list"
                        alert window.i18n "fatal_error"

