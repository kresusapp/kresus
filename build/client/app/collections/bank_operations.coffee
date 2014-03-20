BankOperation = require '../models/bank_operation'

module.exports = class BankOperations extends Backbone.Collection

    model: BankOperation
    url: "bankoperations"

    order: "asc"
    orderBy: "date"

    setAccount: (@account) ->
        @url = "bankaccounts/getOperations/" + @account.get("id")
        #console.log @url

    setComparator: (type) ->
        if type == "date"
            # sorting by date and then title
            @comparator = (o1, o2) =>
                d1 = new Date(o1.get("date")).getTime()
                d2 = new Date(o2.get("date")).getTime()

                t1 = o1.get("title")
                t2 = o2.get("title")

                sort = if @order == "asc" then -1 else 1

                if d1 == d2
                    if t1 > t2 then return sort
                    if t1 < t2 then return -sort
                    return 0
                else if d1 > d2
                    return sort
                else
                    return -sort

        else
            @orderBy = type
            @comparator = (o1, o2) ->

                t1 = o1.get @orderBy
                t2 = o2.get @orderBy

                sort = if @order == "asc" then -1 else 1

                if t1 == t2
                    return 0
                else if t1 > t2
                    return sort
                else
                    return -sort

    toggleSort: (order) ->
        if @orderBy == order
            @order = if @order == "asc" then "desc" else "asc"
        else
            @orderBy = order
            
