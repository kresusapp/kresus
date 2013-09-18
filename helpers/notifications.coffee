Client = require('request-json').JsonClient

module.exports = class NotificationsHelper

    constructor: (@app, port=9103) ->
        @client = new Client "http://localhost:#{port}/"

    createTemporary: (params, callback) ->
        callback ?= ->
        @client.post 'notifications', params, callback

    createOrUpdatePersistent: (ref, params, callback) ->
        callback ?= ->
        @client.put "notifications/#{@app}/#{ref}", params, callback

    destroy: (ref, callback) ->
        callback ?= ->
        @client.del "notifications/#{@app}/#{ref}", callback