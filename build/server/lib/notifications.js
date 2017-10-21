'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _helpers = require('../helpers');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var log = (0, _helpers.makeLogger)('notifications');

var Notifier = function () {
    function Notifier() {
        _classCallCheck(this, Notifier);

        if (process.kresus.standalone) {
            log.warn('Notification module in standalone mode is NYI.');
            this.helper = {
                // TODO implement notifications in standalone mode
                createTemporary: function createTemporary(_ref) {
                    var text = _ref.text;

                    log.warn('Sending a notification in standalone mode, NYI.');
                    log.warn('Text: ' + text);
                }
            };
        } else {
            // This helper only works within Cozy.
            var NotificationsHelper = require('cozy-notifications-helper');
            this.helper = new NotificationsHelper('Kresus');
        }
    }

    _createClass(Notifier, [{
        key: 'send',
        value: function send(text) {
            var params = {
                text: text,
                resource: {
                    app: 'kresus',
                    url: '/'
                }
            };

            this.helper.createTemporary(params);
        }
    }]);

    return Notifier;
}();

exports.default = new Notifier();