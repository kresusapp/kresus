MockupView = require 'views/mockup'
AppView = require 'views/app'
BalanceView = require 'views/balance'

module.exports = class Router extends Backbone.Router

    empty: ->
        window.views.balanceView?.empty()
        window.views.accountsView?.empty()
        window.views.searchView?.empty()

    routes:
        '': 'balance'
        'accounts': 'accounts'
        'search' : 'search'

    balance: ->
        @empty()
        window.views.balanceView?.render()
        $(".menu-position").removeClass("active")
        $(".menu-1").addClass("active")

    search: ->
        @empty()
        window.views.searchView?.render()
        $(".menu-position").removeClass("active")
        $(".menu-2").addClass("active")

    accounts: ->
        @empty()
        window.views.accountsView?.render()
        $(".menu-position").removeClass("active")
        $(".menu-3").addClass("active")
