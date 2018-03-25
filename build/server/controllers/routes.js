'use strict';

var _manifest = require('./manifest');

var _manifest2 = _interopRequireDefault(_manifest);

var _routes = require('./v1/routes');

var _routes2 = _interopRequireDefault(_routes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = Object.assign({}, _manifest2.default, _routes2.default);