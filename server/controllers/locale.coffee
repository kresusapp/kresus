Cozy = require '../models/cozyinstance'

module.exports =
    get: (req, res) ->
        Cozy.getInstance (err, instance) ->
            if err?
                res.status(500).send(error: 'unable to retrieve cozy instance')
                return

            res.status(200).send(instance.locale)
