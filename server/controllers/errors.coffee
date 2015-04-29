path = require 'path-extra'
fs = require 'fs'

# build/server/controllers/../../../weboob/errors/
filePath = path.join(path.dirname(fs.realpathSync(__filename)), '..', '..', '..', 'weboob', 'errors.json');

errors = JSON.parse fs.readFileSync filePath
module.exports = (name) ->
    if typeof errors[name] isnt 'undefined'
        return errors[name]
    throw 'Unknown error code!'
