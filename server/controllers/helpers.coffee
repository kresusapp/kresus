log = (require 'printit')(
    prefix: 'http-error'
    date: true
)

module.exports =
    sendErr: (res, msg, errorCode = 500, userMessage = "Internal server error.") ->
        log.error 'Error - ', msg
        res.status(errorCode).send(error: userMessage)
        false
