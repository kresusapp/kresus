import { makeLogger } from '../helpers';

let log = makeLogger('notifications');

class Notifier {
    constructor() {
        log.warn('Notification module in standalone mode is NYI.');
    }

    send(text) {
        log.warn('Sending a notification in standalone mode, NYI.');
        log.warn(`Text: ${text}`);
    }
}

export default new Notifier();
