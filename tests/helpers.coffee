fixtures = require 'cozy-fixtures'
Client = require('request-json').JsonClient

module.exports = helpers = {}

# server management
helpers.options = {}
helpers.app = null

if process.env.COVERAGE
    helpers.prefix = '../instrumented/'
else if process.env.USE_JS
    helpers.prefix = '../build/'
else
    helpers.prefix = '../'

# server management
helpers.options =
    serverHost: process.env.HOST or 'localhost'
    serverPort: process.env.PORT or 9875

# set the configuration for the server
process.env.HOST = helpers.options.serverHost
process.env.PORT = helpers.options.serverPort

# default client
client = new Client "http://#{helpers.options.serverHost}:#{helpers.options.serverPort}/", jar: true
helpers.getClient = -> return client

initializeApplication = require "#{helpers.prefix}server"
helpers.startApp = (done) ->
    @timeout 15000
    initializeApplication (app, server) =>
        @app = app
        @app.server = server
        done()

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
