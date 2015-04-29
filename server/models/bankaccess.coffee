americano = require('../db').module

BankAccount = require './bankaccount'

module.exports = BankAccess = americano.getModel 'bankaccess',
    bank: String
    login: String
    password: String
    website: String

BankAccess.all = (callback) ->
    BankAccess.request "all", callback

BankAccess.allFromBank = (bank, callback) ->
    params =
        key: bank.uuid
    BankAccess.request "allByBank", params, callback

BankAccess.allLike = (access, callback) ->
    params =
        key: [access.bank, access.login, access.password]
    BankAccess.request "allLike", params, callback

BankAccess::getAuth = ->
    return login: @login, password: @password, website: @website
