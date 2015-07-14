module.exports =
    sendErr: (res, msg, errorCode = 500, userMessage = "Internal server error.") ->
        console.error 'Error - ', msg
        res.status(errorCode).send(error: userMessage)
        false
