import { makeLogger } from '../helpers';

let log = makeLogger('notifications');

class Notifier
{
    constructor() {
        if (process.kresus.standalone) {
            // TODO fix this
            log.warn('Notification module in standalone mode is NYI.');
            this.helper = {
                createTemporary() {
                    log.warn(`Trying to send a notification in standalone mode,
                              NYI.`);
                }
            };
        } else {
            // This helper only works within Cozy.
            let NotificationsHelper = require('cozy-notifications-helper');
            let appData = require('../../package.json');
            this.helper = new NotificationsHelper(appData.name);
        }
    }

    send(text) {

        let params = {
            text,
            resource: {
                app: 'kresus',
                url: '/'
            }
        };

        this.helper.createTemporary(params);
    }
}

export default new Notifier;
