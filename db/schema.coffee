Bank = define 'Bank', ->
    property 'name', String
    property 'uuid', String

BankAccess = define 'BankAccess', ->
    property 'bank', String
    property 'login', String
    property 'password', String

BankAccount = define 'BankAccount', ->
    property 'bank', String
    property 'bankAccess', String
    property 'title', String
    property 'accountNumber', String
    property 'amount', Number
    property 'initialAmount', Number
    property 'lastChecked', Date

BankOperation = define 'BankOperation', ->
    property 'bankAccount', String
    property 'title', String
    property 'date', Date
    property 'amount', Number
    property 'category', String

BankAlert = define 'BankAlert', ->
    property 'bankAccount', String 
    property 'type', String         # possible options are: report, balance, transaction
    property 'frequency', String    # only for reports : daily, weekly, monthly
    property 'limit', Number        # only for amount/transaction
    property 'order', Number        # only for amount/transaction: gt, lt