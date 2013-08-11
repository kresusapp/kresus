BaseView = require '../lib/base_view'

NavbarView = require 'views/navbar'
NewBankView = require 'views/new_bank'

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
                if not @balanceView
                    @balanceView = new BalanceView()

                @navbarView.render()
                @newbankView.render()
                @balanceView.render()
            error: ->
                console.log "Fatal error: could not get the banks list"
                alert "Something went wrong. Refresh."

