americano = require 'americano'
i18n = require 'cozy-i18n-helper'

process.kresus = process.kresus || {}
process.kresus.prod = process.env.NODE_ENV? and process.env.NODE_ENV in ["production", "prod"]
process.kresus.dev = not process.kresus.prod

dbPlugin = require('./db').name

config =
    common: [
        americano.bodyParser({limit: '10mb'})
        americano.methodOverride()
        americano.errorHandler
            dumpExceptions: true
            showStack: true
        americano.static __dirname + '/../client',
            maxAge: 86400000
        i18n.middleware
    ]

    development: [
        americano.logger 'dev'
    ]

    production: [
        americano.logger 'short'
    ]

    plugins: [
        dbPlugin
    ]

module.exports = config
