'use strict';

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _helpers = require('../helpers');

var _cozyNotificationsHelper = require('cozy-notifications-helper');

var _cozyNotificationsHelper2 = _interopRequireDefault(_cozyNotificationsHelper);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var log = (0, _helpers.makeLogger)('notifications');

var Notifier = function () {
    function Notifier() {
        (0, _classCallCheck3.default)(this, Notifier);

        if (process.kresus.standalone) {
            // TODO fix this
            log.warn('Notification module in standalone mode is NYI.');
            this.helper = {
                createTemporary: function createTemporary() {
                    log.warn('Trying to send a notification in standalone mode,\n                              NYI.');
                }
            };
        } else {
            // This helper only works within Cozy.
            this.helper = new _cozyNotificationsHelper2.default('Kresus');
        }
    }

    (0, _createClass3.default)(Notifier, [{
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