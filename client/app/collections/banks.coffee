Bank = require '../models/bank'

module.exports = class Banks extends Backbone.Collection

    model: Bank
    url: "banks"

    getSum: ->
        sum = 0
        for bank in @models
            sum += Number(bank.get("amount"))
            #console.log Number(bank.get("amount"))
        sum
