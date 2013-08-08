AppView = require 'views/app_view'

module.exports = class Router extends Backbone.Router

    routes:
        '': 'main'
        'accounts': 'accounts'

    main: ->
        mainView = new AppView()
        mainView.render()

    accounts: ->
        accountsView = new AppView()
        accountsView.template = require('./views/templates/mockup_accounts')
        accountsView.render()