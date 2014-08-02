americano = require 'americano'

module.exports = Category= americano.getModel 'bankcategory',
    title: String,
    parentId: String

Category.all = (cb) ->
    Category.request "all", cb

Category.byId = (params, cb) ->
    Category.request 'byId', keys: [cat.parentId], cb
