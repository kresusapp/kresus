'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /* eslint no-console: 0 */

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var resetColor = '\x1B[39m';

var colors = {
    cyan: '\x1B[36m',
    green: '\x1B[32m',
    red: '\x1B[31m',
    yellow: '\x1B[33m'
};

var levelColors = {
    error: colors.red,
    debug: colors.cyan,
    warn: colors.yellow,
    info: colors.green
};

var Logger = function () {
    function Logger(prefix) {
        _classCallCheck(this, Logger);

        this.prefix = prefix;
    }

    _createClass(Logger, [{
        key: 'colorify',
        value: function colorify(text, color) {
            return '' + color + text + resetColor;
        }
    }, {
        key: 'stringify',
        value: function stringify(text) {
            if (text instanceof Error && text.stack) {
                return text.stack;
            }
            if (text instanceof Object) {
                return JSON.stringify(text);
            }
            return text;
        }
    }, {
        key: 'format',
        value: function format(level, texts) {
            var maybeLevel = (process.env.NODE_ENV !== 'production' ? this.colorify(level, levelColors[level]) : level) + ' - ';

            var maybePrefix = this.prefix ? this.prefix + ' | ' : '';

            var text = texts.map(this.stringify).join(' ');

            var date = (0, _moment2.default)().utc().toISOString();

            return '[' + date + '] ' + maybeLevel + maybePrefix + text;
        }
    }, {
        key: 'info',
        value: function info() {
            for (var _len = arguments.length, texts = Array(_len), _key = 0; _key < _len; _key++) {
                texts[_key] = arguments[_key];
            }

            return console.info(this.format('info', texts));
        }
    }, {
        key: 'warn',
        value: function warn() {
            for (var _len2 = arguments.length, texts = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                texts[_key2] = arguments[_key2];
            }

            return console.warn(this.format('warn', texts));
        }
    }, {
        key: 'error',
        value: function error() {
            for (var _len3 = arguments.length, texts = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
                texts[_key3] = arguments[_key3];
            }

            return console.error(this.format('error', texts));
        }
    }, {
        key: 'debug',
        value: function debug() {
            if (process.env.DEBUG) {
                for (var _len4 = arguments.length, texts = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
                    texts[_key4] = arguments[_key4];
                }

                return console.info(this.format('debug', texts));
            }
        }
    }, {
        key: 'raw',
        value: function raw() {
            for (var _len5 = arguments.length, texts = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
                texts[_key5] = arguments[_key5];
            }

            return console.log(console, texts);
        }
    }]);

    return Logger;
}();

exports.default = Logger;