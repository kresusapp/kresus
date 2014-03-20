
fixtures = require 'cozy-fixtures'

helpers = {}

# server management
helpers.options = {}
helpers.app = null

helpers.startApp = (done) ->
    @timeout 15000
    americano = require 'americano'
    init = require '../server/init'

    host = helpers.options.serverHost || "127.0.0.1"
    port = helpers.options.serverPort || 9875

    americano.start name: 'pfm', host: host, port: port, (app, server) =>
        @app = app
        @app.server = server
        init done

helpers.stopApp = (done) ->
    @timeout 10000
    @app.server.close done

# database helper
helpers.cleanDB = (done) ->
    @timeout 10000
    fixtures.resetDatabase callback: done

helpers.cleanDBWithRequests = (done) ->
    @timeout 10000
    fixtures.resetDatabase removeAllRequests: true, callback: done

module.exports = helpers