'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (name) {
    if (typeof errors[name] !== 'undefined') return errors[name];
    throw 'Unknown error code!';
};

var errors = require('../shared/errors.json');