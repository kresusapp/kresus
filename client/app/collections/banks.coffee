Bank = require '../models/bank'

module.exports = class Banks extends Backbone.Collection

    model: Bank
    url: "banks"

    getSum: ->
        sum = 0
        for account in @models
            sum += Number(account.get("amount"))
        sum
