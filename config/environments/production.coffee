module.exports = (compound) ->
    app = compound.app
    app.configure 'production', ->
        app.use require('express').errorHandler()
        app.enable 'quiet'