#!/usr/bin/env coffee

app = module.exports = (params) ->
    params = params || {}
    # specify current dir as default root of server
    params.root = params.root || __dirname
    return require('compound').createServer(params)

if not module.parent
    port = process.env.PORT || 9875
    host = process.env.HOST || "127.0.0.1"
    server = app()
    server.listen port, host, ->
        console.log(
            "Compound server listening on %s:%d within %s environment",
            host, port, server.set('env'))
