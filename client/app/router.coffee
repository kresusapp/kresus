MockupView = require 'views/mockup'
AppView = require 'views/app'

module.exports = class Router extends Backbone.Router

    routes:
        '': 'balances'
        'accounts': 'accounts'
        'mockup' : 'mockup'
        'mockup2' : 'mockup2'

    balances: ->
        window.views.navbarView.render()
        window.views.newBankView.render()

    accounts: ->
        accountsView = new AppView()
        accountsView.template = require('./views/templates/mockup_accounts')
        accountsView.render()

    mockup: ->
        mainView = new MockupView()
        mainView.render()

    mockup2: ->
        accountsView = new MockupView()
        accountsView.template = require('./views/templates/mockup_accounts')
        accountsView.render()