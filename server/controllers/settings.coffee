Config = require '../models/kresusconfig'
Cozy = require '../models/cozyinstance'
h = require './helpers'


module.exports.all = (req, res) ->
    Config.all (err, pairs) ->
        if err?
            h.sendErr res, 'when retrieving all settings'
            return

        # In dev mode, force weboob to be correctly installed.
        if process.kresus.dev or true
            for p in pairs
                if p.name == 'weboob-installed'
                    p.value = 'true'
                else if p.name == 'weboob-log'
                    p.value = 'no log'

        if pairs.filter((pair) -> pair.name == 'locale').length is 0
            Cozy.getInstance (err, instance) ->

                if err? or not instance?
                    console.error "When retrieving cozy instance: #{err}"
                    # Create default locale
                    pair =
                        name: 'locale'
                        value: 'en'
                    Config.create pair, (err) ->
                        if err?
                            h.sendErr res, "when creating locale pair for the first time"
                            return
                        pairs.push pair
                        res.send pairs
                else
                    # Found cozy instance => add locale pair manually
                    pair =
                        name: 'locale'
                        value: instance.locale
                    pairs.push pair
                    res.send pairs
        else
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


module.exports.updateWeboob = (req, res) ->
    if process.kresus.dev || true
        res.status(200).send(
            isInstalled: true
            log: 'no log'
        )
        return

    weboob = require '../lib/weboob-fetch'
    # First parameter is 'forceUpdate'
    weboob.InstallOrUpdateWeboob true, (err) ->
        if err?
            h.sendErr res, err, 500, "Error when updating weboob: #{err}"
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

                log = if not pair? then 'no log' else pair.value

                ret =
                    isInstalled: isInstalled
                    log: log

                res.status(200).send ret
