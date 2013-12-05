app = require 'application'
# The function called from index.html
$ ->
    require 'lib/app_helpers'

    # init
    ###
        global variables
    ###
    # app, for nasty tricks
    window.app = app
    app.initialize()
