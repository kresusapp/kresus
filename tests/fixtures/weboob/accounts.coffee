banks = require '../banks-all.json'
helpers = require './helpers'

output = {}
for bank in banks

    obj = helpers bank.uuid
    [main, second] = [obj.main, obj.second]

    output[bank.uuid] = [
        {
            "accountNumber": main,
            "label": "Compte bancaire",
            "balance": "150"
        },
        {
            "accountNumber": second,
            "label": "Livret A",
            "balance": "500"
        }
    ]

    if Math.random > .8
        output[bank.uuid].append(
            "accountNumber": "0147200001",
            "label": "Assurance vie",
            "balance": "1000"
        )

module.exports = output
