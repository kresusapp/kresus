BankAccess = require '../models/bank_access'

module.exports = class BankAccesses extends Backbone.Collection

    model: BankAccess
    url: "bankaccesses"
