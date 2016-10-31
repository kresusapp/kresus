'use strict';

var _cozydb = require('cozydb');

var americano = _interopRequireWildcard(_cozydb);

var _helpers = require('../helpers');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var Category = americano.getModel('bankcategory', {
    title: String,
    // Hexadecimal RGB format
    color: String,
    // Internal category id
    parentId: String,
    // Threshold used in the budget section, defined by the user
    threshold: { type: Number, default: 0 }
});

Category = (0, _helpers.promisifyModel)(Category);

module.exports = Category;