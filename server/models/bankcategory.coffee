americano = require 'americano'

module.exports = Category= americano.getModel 'bankcategory',
    title: String,
    parentId: String

Category.all = (cb) ->
    Category.request "all", cb

Category.byId = (id, cb) ->
    param =
        key: [id]
    Category.request 'byId', param, cb
