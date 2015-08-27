BankAlert = require '../models/alert'

module.exports.loadAlert = (req, res, next, alertID) ->
    BankAlert.find alertID, (err, alert) =>
        if err? or not alert?
            res.status(404).send(error: "Bank Alert not found")
        else
            @alert = alert
            next()

module.exports.index = (req, res) ->
    BankAlert.all (err, alerts) ->
        if err?
            res.status(500).send(error: 'Server error occurred while retrieving data')
        else
            res.status(200).send(alerts)

module.exports.create = (req, res) ->
    BankAlert.create req.body, (err, alert) ->
        if err?
            res.status(500).send(error: "Server error while creating bank alert.")
        else
            res.status(201).send(alert)

module.exports.destroy = (req, res) ->
    @alert.destroy (err) ->
        if err?
            res.status(500).send(error: "Server error while deleting the bank alert")
        else
            res.status(204).send(success: true)

module.exports.update = (req, res) ->
    @alert.updateAttributes req.body, (err, alert) ->
        if err?
            res.status(500).send(error: "Server error while saving bank alert")
        else
            res.status(200).send(alert)

module.exports.getForBankAccount = (req, res) ->
    BankAlert.allFromBankAccount id: req.params.accountID, (err , alerts) ->
        if err?
            res.status(500).send(error: "Server error while getting bank alerts")
        else
            res.status(200).send(alerts)

module.exports.show = (req, res) ->
    res.status(200).send(@alert)
