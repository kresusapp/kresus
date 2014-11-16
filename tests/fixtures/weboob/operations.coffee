banks = require '../banks-all.json'
output = {}
operations = require '../operations.json'
for bank in banks
    output[bank.uuid] = operations
module.exports = output
