banks = require '../banks-all.json'
helpers = require './helpers'

output = {}
for bank in banks

    obj = helpers bank.uuid
    {main, second, third} = obj

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
        },
        {
            "accountNumber": third,
            "label": "Plan Epargne Logement",
            "balance": "0"
        }
    ]

    if Math.random > .8
        output[bank.uuid].append(
            "accountNumber": "0147200001",
            "label": "Assurance vie",
            "balance": "1000"
        )

module.exports = output
