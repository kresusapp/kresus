Bank = define 'Bank', ->
    property 'name', String

BankAccess = define 'BankAccess', ->
    property 'bank', String
    property 'login', String
    property 'password', String

BankAccount = define 'BankAccount', ->
    property 'bankAccess', String
    property 'title', String
    property 'accountNumber', String
    property 'initialAmount', Number

BankOperation = define 'BankOperation', ->
    property 'bankAccount', String
    property 'title', String
    property 'date', Date
    property 'amount', Number
    property 'category', String
