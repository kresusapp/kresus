#!/usr/bin/env coffee

americano = require 'americano'
init = require './server/init'

port = process.env.PORT || 9875

americano.start name: 'pfm', port: port, ->
    init ->
        console.log "=> Server intialized!"
