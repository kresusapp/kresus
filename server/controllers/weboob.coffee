Config = require '../models/kresusconfig'
h = require './helpers'

module.exports.status = (req, res) ->
    Config.byName 'weboob-installed', (err, pair) ->
        if err?
            h.sendErr res
            return

        isInstalled = pair? and pair.value == 'true'

        Config.byName 'weboob-log', (err, pair) ->
            if err?
                h.sendErr res
                return

            log = if not pair then 'no log' else pair.value

            ret =
                isInstalled: isInstalled
                log: log

            res.send 200, ret
