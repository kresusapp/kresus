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
