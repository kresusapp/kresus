let errors = require('../shared/errors.json');

export default function(name) {
    if (typeof errors[name] !== 'undefined')
        return errors[name];
    throw 'Unknown error code!';
}
