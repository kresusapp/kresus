"use strict";

var _manifest = _interopRequireDefault(require("./manifest"));

var _routes = _interopRequireDefault(require("./v1/routes"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = Object.assign({}, _manifest.default, _routes.default);