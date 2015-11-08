import NotificationsHelper from 'cozy-notifications-helper';

import appData             from '../../package.json';

let log = require('printit')({
    prefix: 'notifications',
    date: true
});

class Notifier
{
    constructor() {
        this.helper = new NotificationsHelper(appData.name);
    }

    send(text) {

        if (process.kresus.standalone) {
            return log.warn("Trying to send a notification in standalone mode, which is NYI.");
        }

        let params = {
            text,
            resource: {
                app: 'kresus',
                url: '/'
            }
        }

        this.helper.createTemporary(params);
    }
};

export default new Notifier;
