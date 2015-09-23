let log = require('printit')({
    prefix: 'http-error',
    date: true
});

export function sendErr(res, context, statusCode = 500, userMessage = "Internal server error.") {
    log.error(`Error: ${context} - ${userMessage}`);
    res.status(statusCode).send({ error: userMessage });
    return false;
}

export function asyncErr(res, err, context) {
    let logMessage = `${context}: ${err.toString()}`;

    let statusCode = err.status || err.code;
    if (!statusCode) {
        log.warn("no status/code in asyncErr\n" + (new Error).stack);
        statusCode = 500;
    }

    let errorMessage = err.message;
    if (!errorMessage) {
        log.warn("no error message in asyncErr\n" + (new Error).stack);
        errorMessage = "Internal server error";
    }

    let userMessage = (context ? context + ': ' : '') + errorMessage;
    return sendErr(res, logMessage, statusCode, userMessage);
}

// Transforms a function of the form (arg1, arg2, ..., argN, callback) into a
// Promise-based function (arg1, arg2, ..., argN) that will resolve with the
// results of the callback if there's no error, or reject if there's any error.
// XXX How to make sure the function hasn't been passed to promisify once
// already?
export function promisify(func) {
    return function(...args) {
        return new Promise((accept, reject) => {
            func(...args, (err, ...rest) => {
                if (typeof err !== 'undefined' && err !== null) {
                    reject(err);
                    return;
                }

                if (rest.length === 1)
                    accept(rest[0]);
                else
                    accept(...rest);
            });
        });
    }
}

