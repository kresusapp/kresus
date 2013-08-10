app = require 'application'
AppView = require 'views/app'
NavbarView = require 'views/navbar'
NewBankView = require 'views/new_bank'

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

    # other views
    window.views.navbarView = new NavbarView()
    window.views.newBankView = new NewBankView()
    window.views.navbarView.render()
    window.views.newBankView.render()


    # init
    app.initialize()
