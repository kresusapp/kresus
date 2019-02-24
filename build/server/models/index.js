"use strict";

var _users = _interopRequireDefault(require("./users"));

var _helpers = require("../helpers");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

const log = (0, _helpers.makeLogger)('models');

function createDefaultUser() {
  return _createDefaultUser.apply(this, arguments);
}

function _createDefaultUser() {
  _createDefaultUser = _asyncToGenerator(function* () {
    let login = process.kresus.user.login;
    (0, _helpers.assert)(login, 'There should be a default login set!'); // Leave other fields empty for now.

    let email = '';
    let password = '';
    let user = yield _users.default.exists({
      login,
      email
    });

    if (!user) {
      user = yield _users.default.create({
        login,
        email,
        password
      });
    }

    process.kresus.user.id = user.id;
  });
  return _createDefaultUser.apply(this, arguments);
}

module.exports =
/*#__PURE__*/
function () {
  var _init = _asyncToGenerator(function* () {
    try {
      log.info('initializing models...');
      yield createDefaultUser();
      log.info('done initializing models!');
    } catch (e) {
      log.error('during models initialization:', e);
    }
  });

  function init() {
    return _init.apply(this, arguments);
  }

  return init;
}();