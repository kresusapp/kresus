MockupView = require 'views/mockup'
AppView = require 'views/app'
BalanceView = require 'views/balance'

module.exports = class Router extends Backbone.Router

    routes:
        '': 'balance'
        'accounts': 'accounts'
        'mockup' : 'mockup'
        'mockup2' : 'mockup2'

    balance: ->

    accounts: ->
        

    mockup: ->
        mainView = new MockupView()
        mainView.render()

    mockup2: ->
        accountsView = new MockupView()
        accountsView.template = require('./views/templates/mockup_accounts')
        accountsView.render()
