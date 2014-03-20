BankAlert = require '../models/bank_alert'

module.exports = class BankAlerts extends Backbone.Collection

    model: BankAlert
    url: "bankalerts"
