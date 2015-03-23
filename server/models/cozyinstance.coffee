americano = require 'americano'

module.exports = CozyInstance = americano.getModel 'CozyInstance',
    domain: String
    helpUrl: String
    locale: String

CozyInstance.getInstance = (callback) ->
    CozyInstance.request 'all', (err, instances) ->
        if err
            callback err, null
            return

        if not instances? or instances.length is 0
            callback new Error 'No instance parameters found', null
            return

        callback null, instances[0]
