app = require 'application'
BanksCollection = require 'collections/banks'

# The function called from index.html
$ ->
    require 'lib/app_helpers'

    #console.log require 'locale/en'

    #
    # global variables
    #

    # app, for nasty tricks
    window.app = app

    # internationalisation
    window.polyglot = new Polyglot 
    	"phrases": require 'locale/en'
    window.i18n = (key) ->
    	window.polyglot.t key

    # collections
    window.collections = {}

    # banks
    window.collections.banks = new BanksCollection()
    window.collections.banks.fetch()

    # init
    app.initialize()
