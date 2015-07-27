fs = require 'fs'

errors = JSON.parse fs.readFileSync './iso/errors.json'
module.exports = (name) ->
    if typeof errors[name] isnt 'undefined'
        return errors[name]
    throw 'Unknown error code!'
