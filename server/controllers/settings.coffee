Config = require '../models/kresusconfig'
h = require './helpers'


module.exports.all = (req, res) ->
    Config.all (err, pairs) ->
        if err?
            h.sendErr res, 'when retrieving all settings'
            return
        res.send pairs


module.exports.save = (req, res) ->
    pair = req.body

    if not pair.key?
        h.sendErr res, 'missing key in settings', 400, 'Missing key when saving a setting'
        return

    if not pair.value?
        h.sendErr res, 'missing value in settings', 400, 'Missing value when saving a setting'
        return

    Config.findOrCreateByName pair.key, pair, (err, found) ->
        if err?
            h.sendErr err
            return

        if found.value != pair.value
            found.value = pair.value
            found.save (err) ->
                if err?
                    h.sendErr err
                    return
                res.sendStatus(200);
            return

        res.sendStatus(200);
