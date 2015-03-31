# This module retrieves real values from the weboob backend, by using the given
# bankuuid / login / password (maybe website) combination. It is activated if
# NODE_ENV is set to something else than development. (see top of weboob-manager.coffee)
spawn = require('child_process').spawn

Config = require '../models/kresusconfig'

Fetch = (process, bankuuid, login, password, website, callback) ->
    console.warn "Fetch started: running process #{process}..."
    script = spawn process, []

    script.stdin.write bankuuid + '\n'
    script.stdin.write login + '\n'
    script.stdin.write password + '\n'
    if website?
        script.stdin.write website
    script.stdin.end()

    body = ''
    script.stdout.on 'data', (data) ->
        body += data.toString()

    err = undefined
    script.stderr.on 'data', (data) ->
        err ?= ''
        err += data.toString()

    script.on 'close', (code) =>
        console.warn "weboob exited with code #{code}"
        console.warn "weboob-stderr: #{err}"

        if not body.length
            callback "Weboob error: #{err}"
            return

        try
            body = JSON.parse body
        catch err
            callback "Error when parsing weboob json: #{body}"
            return

        console.warn "weboob exited normally with non-empty JSON content, continuing."
        callback null, body


exports.FetchAccounts = (bankuuid, login, password, website, callback) ->
    Fetch './weboob/scripts/accounts.sh', bankuuid, login, password, website, callback


exports.FetchOperations = (bankuuid, login, password, website, callback) ->
    Fetch './weboob/scripts/operations.sh', bankuuid, login, password, website, callback


TestInstall = (cb) ->
    script = spawn './weboob/scripts/test.sh'
    script.stdout.on 'data', (data) ->
        console.warn '[checking weboob install]' + data.toString()
    script.stderr.on 'data', (data) ->
        console.error '[checking weboob install]' + data.toString()
    script.on 'close', (code) ->
        works = code is 0
        cb works


exports.InstallOrUpdateWeboob = InstallOrUpdateWeboob = (forceUpdate, cb) ->
    Config.findOrCreateByName "weboob-installed", "false", (err, pair) ->

        if err?
            cb err
            return

        logCount = 0
        logContent = ''
        log = (wat) ->
            wat = wat.trim()
            logContent += wat + '\n'
            console.warn '[weboob] ' + wat
            logCount += 1
            if logCount == 5
                saveLog (err) ->
                    if err?
                        console.info "error when saving temporary log: #{err}"
                        return
                logCount = 0

        saveLog = (cb) ->
            Config.findOrCreateByName "weboob-log", "", (err, pair) ->
                if err?
                    cb err
                    return
                pair.value = logContent
                pair.save cb

        markAsNotInstalled = () ->
            log 'Ensuring weboob install status to false...'
            pair.value = 'false'
            pair.save (err) ->
                if err?
                    console.error "When updating weboob install status: #{err}"
                    return
                console.warn "weboob marked as non-installed"

        isInstalled = pair.value == 'true'
        log 'Is it installed?', isInstalled

        if isInstalled and not forceUpdate
            log '=> Yes it is. Testing...'
            TestInstall (works) ->
                if not works
                    log 'Testing failed, relaunching install process...'
                    cb 'already installed but testing failed'
                    return

                log 'Already installed and it works, carry on.'
                # Don't save log in this case.
                cb null
                return
            return

        if pair.value != 'false'
            markAsNotInstalled()

        log "=> No it isn't. Installing weboob..."
        script = spawn './weboob/scripts/install.sh', []
        script.stdout.on 'data', (data) ->
            log "[install.sh] -- #{data.toString()}"
        script.stderr.on 'data', (data) ->
            log "[install.sh] stderr -- #{data.toString()}"
        script.on 'close', (code) ->
            log "[install.sh] closed with code: #{code}"

            if code isnt 0
                cb "return code of install.sh is #{code}, not 0."
                return

            pair.value = 'true'
            pair.save (err) ->
                if err?
                    cb err
                    return
                saveLog cb


# Each installation of kresus should trigger an installation or update of
# weboob.
( ->
    attempts = 1

    tryInstall = (force) ->
        InstallOrUpdateWeboob force, (err) ->

            if err?
                console.error "[weboob] error when installing/updating, attempt ##{attempts}: #{err}"
                attempts += 1
                if attempts <= 3
                    console.error "[weboob] retrying..."
                    tryInstall true
                else
                    console.warn "[en] error when installing weboob: please contact a kresus maintainer on github or irc and keep the error message handy."
                    console.warn "[fr] erreur lors de l'installation de weboob: merci de contacter un mainteneur de kresus sur github ou irc en gardant le message à portée de main."
                return

            console.warn '[weboob] installation/update all fine. GO GO GO!'

    tryInstall false
)()
