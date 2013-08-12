app = require 'application'
AppView = require 'views/app'

BanksCollection = require 'collections/banks'
BankOperationsCollection = require 'collections/bank_operations'

# The function called from index.html
$ ->
    require 'lib/app_helpers'

    ###
            global variables
    ###

    # app, for nasty tricks
    window.app = app

    # internationalisation
    window.polyglot = new Polyglot 
        "phrases": require 'locale/en'
    window.i18n = (key) -> window.polyglot.t key

    # collections, views
    window.collections = {}
    window.views = {}

    # banks, operations
    window.collections.banks = new BanksCollection()
    window.collections.operations = new BankOperationsCollection()


    ###
            views
    ###

    # this one is tricky - it lays down the structure, so it needs to be rendered
    # before any other view using that structure
    window.views.appView = new AppView()
    window.views.appView.render()

    $('.nice-scroll').niceScroll()


    window.activeObjects = {}
    _.extend(window.activeObjects, Backbone.Events);

    # init
    app.initialize()
