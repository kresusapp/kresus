americano = require('../db').module

module.exports = Config = americano.getModel 'kresusconfig',
    name: String
    value: String

Config.all = (cb) ->
    Config.request "all", cb

Config.byName = (name, cb) ->
    param =
        key: name
    Config.request 'byName', param, (err, founds) ->
        if err?
            cb err
            return
        if founds and founds.length
            cb null, founds[0]
            return
        cb null, null

Config.findOrCreateByName = (name, defaultValue, cb) ->
    Config.byName name, (err, found) ->

        if err?
            cb "Error when reading setting #{name}: #{err}"
            return

        if not found?
            pair =
                name: name
                value: defaultValue

            Config.create pair, (err, pair) ->
                if err?
                    cb "Error when creating setting #{name}: #{err}"
                    return
                cb null, pair
            return

        cb null, found
