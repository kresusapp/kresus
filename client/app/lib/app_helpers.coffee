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
