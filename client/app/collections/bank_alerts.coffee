BankAlert = require '../models/bank_operation'

module.exports = class BankAlerts extends Backbone.Collection

    model: BankAlert
    url: "bankalerts"
