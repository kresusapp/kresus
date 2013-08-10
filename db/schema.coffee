Bank = define 'Bank', ->
    property 'name', String

BankAccess = define 'BankAccess', ->
    property '_bank', String
    property 'login', String
    property 'password', String

BankAccount = define 'BankAccount', ->
    property '_bankAccess', String
    property 'title', String
    property 'number', String
    property 'initialAmount', Number

BankOperation = define 'BankOperation', ->
    property '_bankAccount', String
    property 'title', String
    property 'date', Date
    property 'amount', Number
    property 'category', String
