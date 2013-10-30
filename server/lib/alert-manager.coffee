async = require 'async'
moment = require 'moment'

BankAccount = require '../models/bankaccount'
BankAlert = require '../models/bankalert'
BankOperation = require '../models/bankoperation'

NotificationsHelper = require 'cozy-notifications-helper'
appData = require '../../package.json'

class AlertManager

    @FORMATTER = "DD/MM/YYYY"

    constructor: ->
        @notificator = new NotificationsHelper appData.name

    checkAlertsForOperations: (operations, callback) ->

        process = (operation, callback) =>
            BankAlert.allByAccountAndType operation.bankAccount, "transaction",\
            (err, alerts) =>
                for alert in alerts

                    if alert.testTransaction operation
                        if alert.order is "lt"
                            treshold = "inférieur"
                        else
                            treshold = "supérieur"
                        text = "Alerte : transaction d'un montant " + \
                               "#{treshold} à #{alert.limit}€"

                        params = text: "#{text} (#{operation.amount}€)"
                        @notificator.createTemporary params

                callback()

        async.each operations, process, callback

    checkAlertsForAccounts: (callback) ->
        BankAccount.all (err, accounts) =>

            process = (account, callback) =>
                BankAlert.allByAccountAndType account.id, "balance", \
                (err, alerts) =>
                    for alert in alerts

                        if alert.testBalance account
                            date = moment account.lastChecked
                            date = date.format AlertManager.FORMATTER
                            if alert.order is "lt"
                                treshold = "sous le seuil de"
                            else
                                treshold = "au dessus du seuil de"
                            text = "Alerte : #{account.title} #{treshold} " + \
                                   "#{alert.limit}€ (#{account.getBalance()}€)"
                            params = text: "#{text}"
                            @notificator.createTemporary params

                    callback()

            async.each accounts, process, (err) ->
                callback err

module.exports = new AlertManager()