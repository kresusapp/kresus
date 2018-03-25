'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _helpers = require('../helpers');

let log = (0, _helpers.makeLogger)('notifications');

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

exports.default = new Notifier();