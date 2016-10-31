'use strict';

var _cozydb = require('cozydb');

var americano = _interopRequireWildcard(_cozydb);

var _helpers = require('../helpers');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var Cozy = americano.getModel('CozyInstance', {
    domain: String,
    helpUrl: String,
    locale: String
});

Cozy = (0, _helpers.promisifyModel)(Cozy);

module.exports = Cozy;