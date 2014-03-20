(() ->
    # IIFE to avoid collisions with other variables
    (->
        # Make it safe to do console.log() always.
        console = window.console = window.console or {}
        method = undefined
        dummy = ->
        methods = ('assert,count,debug,dir,dirxml,error,exception,
                   group,groupCollapsed,groupEnd,info,log,markTimeline,
                   profile,profileEnd,time,timeEnd,trace,warn').split ','

        console[method] = console[method] or dummy while method = methods.pop()
    )()
)()

Number::formatMoney = (decPlaces, thouSeparator, decSeparator) ->
    n = this
    decPlaces = (if isNaN(decPlaces = Math.abs(decPlaces)) then 2 else decPlaces)
    decSeparator = (if decSeparator is `undefined` then "." else decSeparator)
    thouSeparator = (if thouSeparator is `undefined` then "," else thouSeparator)
    sign = (if n < 0 then "-" else "")
    i = parseInt(n = Math.abs(+n or 0).toFixed(decPlaces)) + ""
    j = (if (j = i.length) > 3 then j % 3 else 0)
    sign + ((if j then i.substr(0, j) + thouSeparator else "")) + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thouSeparator) + ((if decPlaces then decSeparator + Math.abs(n - i).toFixed(decPlaces).slice(2) else ""))

Number::money = ->
    @formatMoney(2, " ", ",")

Date::dateString = ->
    addZeros = (num) ->
        if Number(num) < 10
            "0" + num
        else
            num
    myDate = @
    addZeros(myDate.getDate() + 1) + "/" + addZeros(myDate.getMonth() + 1) + "/" + myDate.getFullYear()

Date::timeString = ->
    addZeros = (num) ->
        if Number(num) < 10
            "0" + num
        else
            num
    myDate = @
    addZeros(myDate.getHours()) + ":" + addZeros(myDate.getMinutes())
 