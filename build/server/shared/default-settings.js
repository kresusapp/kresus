'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _map = require('babel-runtime/core-js/map');

var _map2 = _interopRequireDefault(_map);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DefaultSettings = new _map2.default();

DefaultSettings.set('weboob-installed', 'false');
DefaultSettings.set('weboob-version', '?');
DefaultSettings.set('standalone-mode', 'false');

DefaultSettings.set('locale', 'en');
DefaultSettings.set('weboob-auto-update', 'true');
DefaultSettings.set('weboob-auto-merge-accounts', 'true');
DefaultSettings.set('weboob-enable-debug', 'false');
DefaultSettings.set('duplicateThreshold', '24');
DefaultSettings.set('defaultChartDisplayType', 'all');
DefaultSettings.set('defaultChartType', 'all');
DefaultSettings.set('defaultChartPeriod', 'current-month');
DefaultSettings.set('defaultAccountId', '');
DefaultSettings.set('defaultCurrency', 'EUR');

DefaultSettings.set('mail-config', (0, _stringify2.default)({
    fromEmail: 'kresus@example.tld',
    toEmail: '',
    host: 'localhost',
    port: 25,
    secure: false,
    auth: {
        // user
        // pass
    },
    tls: {
        rejectUnauthorized: true
    }
}));

exports.default = DefaultSettings;