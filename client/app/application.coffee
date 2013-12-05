AppView = require 'views/app'

BanksCollection = require 'collections/banks'
BankOperationsCollection = require 'collections/bank_operations'

module.exports =

    initialize: ->

        $.ajax('cozy-locale.json')
            .done( (data) => @locale = data.locale )
            .fail(     () => @locale = 'en'        )
            .always(   () => @step2()    )

    step2: ->

        # internationalisation
        @polyglot = new Polyglot()
        window.polyglot =  @polyglot
        try
            locales = require "locales/#{@locale}"
        catch e
            locales = require 'locales/en'

        @polyglot.extend locales
        window.t = @polyglot.t.bind @polyglot
        window.i18n = (key) -> window.polyglot.t key

        # collections, views
        window.collections = {}
        window.views = {}

        # banks, operations
        window.collections.allBanks = new BanksCollection()
        window.collections.banks = new BanksCollection()
        window.collections.operations = new BankOperationsCollection()

        ###
                views
        ###
        # this one is tricky - it lays down the structure, so it needs to be rendered
        # before any other view using that structure
        window.views.appView = new AppView()
        window.views.appView.render()

        window.activeObjects = {}
        _.extend(window.activeObjects, Backbone.Events);

        # Routing management
        Router = require 'router'
        @router = new Router()
        #Backbone.history.start()

        # Makes this object immuable.
        Object.freeze this if typeof Object.freeze is 'function'
