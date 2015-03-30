Config = require '../models/kresusconfig'
h = require './helpers'

module.exports.status = (req, res) ->
    # Short-circuit, in dev mode:
    if not process.env.NODE_ENV? or process.env.NODE_ENV is 'development'
        res.send 200,
            isInstalled: true
            log: 'no log'
        return

    Config.byName 'weboob-installed', (err, pair) ->
        if err?
            h.sendErr err
            return

        isInstalled = pair? and pair.value == 'true'

        Config.byName 'weboob-log', (err, pair) ->
            if err?
                h.sendErr err
                return

            log = if not pair then 'no log' else pair.value

            ret =
                isInstalled: isInstalled
                log: log

            res.send 200, ret
