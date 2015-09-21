let log = require('printit')({
    prefix: 'http-error',
    date: true
});

export function sendErr(res, msg, errorCode = 500, userMessage = "Internal server error.") {
        log.error('Error - ', msg);
        res.status(errorCode)
           .send({error: userMessage});
        return false;
}

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
