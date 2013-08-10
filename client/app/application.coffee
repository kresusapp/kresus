module.exports =

    initialize: ->

        # Routing management
        Router = require 'router'
        @router = new Router()
        Backbone.history.start()

        # Makes this object immuable.
        Object.freeze this if typeof Object.freeze is 'function'

        # init
        window.collections.banks.fetch
            success: ->
                window.views.newBankView.render()