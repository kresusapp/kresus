'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _helpers = require('../helpers');

var _cozyNotificationsHelper = require('cozy-notifications-helper');

var _cozyNotificationsHelper2 = _interopRequireDefault(_cozyNotificationsHelper);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var log = (0, _helpers.makeLogger)('notifications');

var Notifier = function () {
    function Notifier() {
        (0, _classCallCheck3.default)(this, Notifier);

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