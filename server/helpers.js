import printit from 'printit';

export function makeLogger(prefix) {
    return printit({
        prefix,
        date: true
    });
}

let log = makeLogger('helpers');

export function sendErr(res,
                        context,
                        statusCode = 500,
                        userMessage = 'Internal server error.',
                        code) {
    log.error(`Error: ${context} - ${userMessage}`);
    res.status(statusCode).send({
        code,
        message: userMessage
    });
    return false;
}

export function asyncErr(res, err, context) {
    let logMessage = `${context}: ${err.toString()}`;

    let statusCode = err.status;
    if (!statusCode) {
        log.warn('no status in asyncErr');
        statusCode = 500;
    }

    let errorMessage = err.message;
    if (!errorMessage) {
        log.warn('no error message in asyncErr');
        errorMessage = 'Internal server error';
    }

    let errorCode = err.code;

    let userMessage = (context ? `${context}: ` : '') + errorMessage;
    return sendErr(res, logMessage, statusCode, userMessage, errorCode);
}

// Transforms a function of the form (arg1, arg2, ..., argN, callback) into a
// Promise-based function (arg1, arg2, ..., argN) that will resolve with the
// results of the callback if there's no error, or reject if there's any error.
// XXX How to make sure the function hasn't been passed to promisify once
// already?
export function promisify(func) {
    return function(...args) {
        // Note: "this" is extracted from this scope.
        return new Promise((accept, reject) => {
            // Add the callback function to the list of args
            args.push((err, ...rest) => {
                if (typeof err !== 'undefined' && err !== null) {
                    reject(err);
                    return;
                }

                if (rest.length === 1)
                    accept(rest[0]);
                else
                    accept(...rest);
            });
            // Call the callback-based function
            func.apply(this, args);
        });
    };
}

// Promisifies a few cozy-db methods by default
export function promisifyModel(model) {

    const statics = ['exists', 'find', 'create', 'save', 'updateAttributes',
                     'destroy', 'all'];

    for (let name of statics) {
        let former = model[name];
        model[name] = promisify(model::former);
    }

    const methods = ['save', 'updateAttributes', 'destroy'];

    for (let name of methods) {
        let former = model.prototype[name];
        model.prototype[name] = promisify(former);
    }

    return model;
}
