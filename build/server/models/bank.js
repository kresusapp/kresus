'use strict';

var _cozydb = require('cozydb');

var cozydb = _interopRequireWildcard(_cozydb);

var _helpers = require('../helpers');

var _banks = require('../shared/banks.json');

var _banks2 = _interopRequireDefault(_banks);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

let log = (0, _helpers.makeLogger)('models/bank');

let Bank = cozydb.getModel('bank', {
    // Display name
    name: String,
    // Weboob module id
    uuid: String,
    // TODO customFields shouldn't be saved in memory
    customFields: x => x
});

Bank = (0, _helpers.promisifyModel)(Bank);

Bank.byUuid = function byUuid(uuid) {
    if (typeof uuid !== 'string') {
        log.warn('Bank.byUuid misuse: uuid must be a String');
    }

    return _banks2.default.find(bank => bank.uuid === uuid);
};

module.exports = Bank;