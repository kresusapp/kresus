Cozy = require '../models/cozyinstance'

module.exports =
    get: (req, res) ->
        Cozy.getInstance (err, instance) ->
            if err?
                res.send 500, error: 'unable to retrieve cozy instance'
                return

            res.send 200, instance.locale
