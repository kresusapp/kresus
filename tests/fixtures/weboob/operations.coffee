banks = require '../banks-all.json'

output = {}
for bank in banks
    output[bank.uuid] = [
        {
            "label": "SNCF",
            "raw": "SNCF Carte X1234",
            "amount": "-15.00",
            "rdate": "2013-11-15T00:00:00.000Z",
            "account": "1234567890"
        },
        {
            "label": "LIDL",
            "raw": "LIDL Carte X1234",
            "amount": "-5.00",
            "rdate": "2013-11-20T00:00:00.000Z",
            "account": "1234567890"
        },
        {
            "label": "Salaire",
            "raw": "Virement Cozycloud",
            "amount": "700.00",
            "rdate": "2013-11-10T00:00:00.000Z",
            "account": "1234567890"
        },
        {
            "label": "Salaire",
            "raw": "Virement Cozycloud",
            "amount": "700.00",
            "rdate": "2013-10-10T00:00:00.000Z",
            "account": "1234567890"
        },
        {
            "label": "Loyer",
            "raw": "Virement agence Paris Champs Elysées",
            "amount": "-300.00",
            "rdate": "2013-11-04T00:00:00.000Z",
            "account": "1234567890"
        },
        {
            "label": "Loyer",
            "raw": "Virement agence Paris Champs Elysées",
            "amount": "-300.00",
            "rdate": "2013-10-04T00:00:00.000Z",
            "account": "1234567890"
        },
        {
            "account": "1234567890",
            "label": "ARMAND THIERY",
            "rdate": "2013-11-09T00:00:00.000Z",
            "amount": "-179",
            "raw": "CARTE X1234 09/11 ARMAND THIERY"
        },
        {
            "label": "Intermarché courses",
            "raw": "Intermarché CARTE X1234",
            "amount": "-100.00",
            "rdate": "2013-11-19T00:00:00.000Z",
            "account": "1234567890"
        },
        {
            "account": "1234567890",
            "label": "LIDL 0304",
            "rdate": "2013-11-19T00:00:00.000Z",
            "amount": "-11.35",
            "raw": "CARTE X1234 19/11 LIDL 0304"
        },
        {
            "label": "Pot de vin",
            "raw": "Pot de vin CARTE LES3Suisses",
            "amount": "100.00",
            "rdate": "2013-11-15T00:00:00.000Z",
            "account": "0987654321"
        },
        {
            "label": "Virement interne",
            "raw": "Virement interne pour le compte 1234567890",
            "amount": "-200.00",
            "rdate": "2013-11-20T00:00:00.000Z",
            "account": "0987654321"
        }
    ]

module.exports = output