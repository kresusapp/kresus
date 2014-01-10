moment = require 'moment'
Client = require('request-json').JsonClient
jade = require 'jade'

BankAlert = require '../models/bankalert'
BankOperation = require '../models/bankoperation'
BankAccount = require '../models/bankaccount'

class ReportManager

    constructor: ->
        @client = new Client "http://localhost:9101/"
        unless process.env.NODE_ENV not in ["production", "test"]
            @client.setBasicAuth process.env.NAME, process.env.TOKEN

    start: ->
        @prepareNextCheck()

    prepareNextCheck: ->
        # day after between 04:00am and 08:00am
        # this must be triggered AFTER accounts were polled
        delta =  Math.floor(Math.random() * 180 + 4 * 60)
        now = moment()
        nextUpdate = now.clone().add(1, 'days')
                            .hours(1)
                            .minutes(delta)
                            .seconds(0)

        format = "DD/MM/YYYY [at] HH:mm:ss"
        console.log "> Next check to send report #{nextUpdate.format(format)}"
        @timeout = setTimeout(
            () =>
                @manageReports()
            , nextUpdate.diff(now))

    manageReports: ->
        now = moment()
        @prepareReport 'daily'
        @prepareReport 'weekly' if now.day() is 1
        @prepareReport 'monthly' if now.date() is 1
        @prepareNextCheck()

    prepareReport: (frequency) ->
        console.log "Checking if user has enabled #{frequency} report..."
        BankAlert.allReportsByFrequency frequency, (err, alerts) =>
            if err?
                msg = "Couldn't retrieve alerts -- #{err}"
                console.log msg
                callback msg
            else
                # bank accounts for reports should be generated for
                includedBankAccounts = []
                includedBankAccounts.push alert.bankAccount for alert in alerts

                if alerts.length > 0
                    @_prepareOperationsData frequency, includedBankAccounts, \
                    (err, operationsByAccount) =>
                        @_prepareBalancesData frequency, includedBankAccounts, \
                        (err, accounts) =>
                            if accounts.length > 0
                                textContent = @_getTextContent operationsByAccount,\
                                                               accounts, frequency
                                htmlContent = @_getHtmlContent operationsByAccount,\
                                                               accounts, frequency
                                @_sendReport frequency, textContent, htmlContent
                else
                    console.log "User hasn't enabled #{frequency} report."

    _prepareBalancesData: (frequency, accounts, callback) ->
        BankAccount.findMany accounts, (err, accounts) ->
            if err?
                msg = "Couldn't retrieve accounts -- #{err}"
                console.log msg
                callback msg
            else
                callback null, accounts

    _prepareOperationsData: (frequency, accounts, callback) ->
        BankOperation.allFromBankAccount accounts, (err, operations) =>
            if err?
                msg = "Couldn't retrieve operations -- #{err}"
                console.log msg
                callback msg
            else
                # choose the ones which are in the right time frame
                operationsByAccount = {}
                timeFrame = @_getTimeFrame frequency
                for operation in operations
                    account =  operation.bankAccount
                    if moment(operation.date).isAfter(timeFrame)
                        unless operationsByAccount[account]?
                            operationsByAccount[account] = []
                        operationsByAccount[account].push operation
                callback null, operationsByAccount

    _sendReport: (frequency, textContent, htmlContent) ->
        data =
            from: "Cozy PFM <pfm-noreply@cozycloud.cc>"
            subject: "[Cozy-PFM] #{frequency} report"
            content: textContent
            html: htmlContent
        @client.post "mail/to-user/", data, (err, res, body) ->
            if err?
                msg = "An error occurred while sending an email"
                console.log "#{msg} -- #{err}"
                console.log res.statusCode if res?
            else
                console.log "Report sent."

    _getTextContent: (operationsByAccount, accounts, frequency) ->
        today = moment().format "DD/MM/YYYY"
        output = "Votre rapport bancaire du #{today}\n\n"
        output += "Solde de vos comptes :\n"
        for account in accounts
            lastCheck = moment(account.lastCheck).format "DD/MM/YYYY"
            output += "\t* #{account.accountNumber} (#{account.title}) " + \
                      "# #{account.getBalance()}€ " + \
                      "(Dernière vérification : #{lastCheck})\n"

        if Object.keys(operationsByAccount).length > 0
            output += "\nNouvelles opérations importées :\n"
            for account, operations of operationsByAccount
                output += "Compte n°#{account}\n"
                for operation in operations
                    output += "\t* #{operation.title} # #{operation.amount}€\n"
        else
            output = "Aucune nouvelle opération n'a été importé #{frequency}."
        return output


    _getHtmlContent: (operationsByAccount, accounts, frequency) ->
        today = moment().format "DD/MM/YYYY"
        options =
            today: today
            accounts: accounts
            operationsByAccount: operationsByAccount
        return jade.renderFile './server/views/mail-report.jade', options

    _getTimeFrame: (frequency) ->
        timeFrame = moment()
        switch frequency
            when "daily" then return timeFrame.subtract "days", 1
            when "weekly" then return timeFrame.subtract "days", 7
            when "monthly" then return timeFrame.subtract "months", 1

module.exports = new ReportManager()