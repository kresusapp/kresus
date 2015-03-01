module.exports = (uuid) ->
    hash = uuid.charCodeAt(0) + uuid.charCodeAt(3) + uuid.charCodeAt(1)
    return {
        main: hash + '1'
        second: hash + '2'
    }
