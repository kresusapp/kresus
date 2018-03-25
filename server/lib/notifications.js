import { makeLogger } from '../helpers';

let log = makeLogger('notifications');

class Notifier {
    constructor() {
        log.warn('Notification module is NYI.');
    }

    send(text) {
        log.warn('Sending a notification is NYI.');
        if (process.env.NODE_ENV !== 'production') {
            log.warn(`Text: ${text}`);
        }
    }
}

export default new Notifier();
