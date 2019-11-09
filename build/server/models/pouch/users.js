"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _helpers = require("../../helpers");

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

const Users = {
  exists() {
    return _asyncToGenerator(function* () {
      // Hardcoded until we have SQL.
      return {
        id: 0
      };
    })();
  },

  create() {
    return _asyncToGenerator(function* () {
      (0, _helpers.assert)(false, "don't create User until we implement SQL");
    })();
  },

  all() {
    return _asyncToGenerator(function* () {
      return [{
        id: 0
      }];
    })();
  }

};
var _default = Users;
exports.default = _default;