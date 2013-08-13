Bank = require '../models/bank'

module.exports = class Banks extends Backbone.Collection

    model: Bank
    url: "banks"

    getSum: ->
        sum = 0
        for bank in window.collections.banks.models
            sum += Number bank.get("amount")
        Number(sum)
