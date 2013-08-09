app = require 'application'

# The function called from index.html
$ ->
    require 'lib/app_helpers'

    #console.log require 'locale/en'

    # global variables
    window.app = app
    window.polyglot = new Polyglot 
    	"phrases": require 'locale/en'
    window.i18n = (key) ->
    	window.polyglot.t key

    # init
    app.initialize()
