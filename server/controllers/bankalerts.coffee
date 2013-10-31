BankAlert = require '../models/bankalert'

module.exports.loadAlert = (req, res, next, alertID) ->
    BankAlert.find alertID, (err, alert) =>
        if err? or not alert?
            res.send 404, error: "Bank Alert not found"
        else
            @alert = alert
            next()

module.exports.index = (req, res) ->
    BankAlert.all (err, alerts) ->
        if err?
            res.send 500, error: 'Server error occurred while retrieving data'
        else
            res.send 200, alerts

module.exports.create = (req, res) ->
    BankAlert.create req.body, (err, alert) ->
        if err?
            res.send 500, error: "Server error while creating bank alert."
        else
            res.send 201, alert

module.exports.destroy = (req, res) ->
    @alert.destroy (err) ->
        if err?
            res.send 500, error: "Server error while deleting the bank alert"
        else
            res.send 204, success: true

module.exports.update = (req, res) ->
    @alert.updateAttributes req.body, (err, alert) ->
        if err?
            res.send 500, error: "Server error while saving bank alert"
        else
            res.send 200, alert

module.exports.getForBankAccount = (req, res) ->
    BankAlert.allFromBankAccount id: req.params.accountID, (err , alerts) ->
        if err?
            res.send 500, error: "Server error while getting bank alerts"
        else
            res.send 200, alerts

module.exports.show = (req, res) ->
    res.send 200, @alert
