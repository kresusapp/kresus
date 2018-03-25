'use strict';

var _cozydb = require('cozydb');

var cozydb = _interopRequireWildcard(_cozydb);

var _helpers = require('../helpers');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

let Category = cozydb.getModel('bankcategory', {
    // Internal category id.
    parentId: String,

    // Label of the category.
    title: String,

    // Hexadecimal RGB format.
    color: String,

    // Threshold used in the budget section, defined by the user.
    threshold: {
        type: Number,
        default: 0
    }
});

Category = (0, _helpers.promisifyModel)(Category);

module.exports = Category;