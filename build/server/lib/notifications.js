"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _helpers = require("../helpers");

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

var _default = new Notifier();

exports.default = _default;