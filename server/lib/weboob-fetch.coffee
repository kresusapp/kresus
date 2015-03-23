# This module retrieves real values from the weboob backend, by using the given
# bankuuid / login / password (maybe website) combination. It is activated if
# NODE_ENV is set to something else than development. (see top of weboob-manager.coffee)
spawn = require('child_process').spawn

Fetch = (process, bankuuid, login, password, website, callback) ->
    console.log "Fetch started: running process #{process}..."
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
        console.log "weboob exited with code #{code}"
        console.warn "weboob-stderr: #{err}"

        if not body.length
            callback "Weboob error: #{err}"
            return

        try
            body = JSON.parse body
        catch err
            callback "Error when parsing weboob json: #{body}"
            return

        console.log "weboob exited normally with non-empty JSON content, continuing."
        callback null, body

exports.FetchAccounts = (bankuuid, login, password, website, callback) ->
    Fetch './weboob/accounts.sh', bankuuid, login, password, website, callback

exports.FetchOperations = (bankuuid, login, password, website, callback) ->
    Fetch './weboob/operations.sh', bankuuid, login, password, website, callback

