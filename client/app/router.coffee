MockupView = require 'views/mockup'
AppView = require 'views/app'
BalanceView = require 'views/balance'

module.exports = class Router extends Backbone.Router

    routes:
        '': 'balance'
        'accounts': 'accounts'
        'mockup' : 'mockup'

    balance: ->
        window.views.balanceView?.render()
        $(".menu-position").removeClass("active")
        $(".menu-1").addClass("active")

    accounts: ->
        window.views.accountsView?.render()
        $(".menu-position").removeClass("active")
        $(".menu-2").addClass("active")

    mockup: ->
        mainView = new MockupView()
        mainView.render()
