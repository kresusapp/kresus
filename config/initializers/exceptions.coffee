module.exports = (compound) ->
    process.on 'uncaughtException', (err) ->
        console.error err
        console.error err.stack