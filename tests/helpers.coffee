
fixtures = require 'cozy-fixtures'

helpers = {}

# server management
helpers.options = {}
helpers.app = null

helpers.startApp = (done) ->
    americano = require 'americano'
    init = require '../server/init'

    host = helpers.options.serverHost || "127.0.0.1"
    port = helpers.options.serverPort || 9875

    americano.start name: 'pfm', host: host, port: port, (app, server) =>
        @app = app
        @app.server = server
        init done

helpers.stopApp = (done) ->
    @app.server.close done

# database helper
helpers.cleanDB = (done) -> fixtures.resetDatabase callback: done
helpers.cleanDBWithRequests = (done) ->
    fixtures.resetDatabase removeAllRequests: true, callback: done

module.exports = helpers