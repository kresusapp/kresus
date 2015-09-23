import {module as americano} from '../db';

let CozyInstance = americano.getModel('CozyInstance', {
    domain: String,
    helpUrl: String,
    locale: String
});

CozyInstance.getInstance = function(callback) {
    CozyInstance.request('all', (err, instances) => {
        if (err)
            return callback(err, null);

        if (!instances || !instances.length)
            return callback('No instance parameters found');

        callback(null, instances[0]);
    });
}

export default CozyInstance;
