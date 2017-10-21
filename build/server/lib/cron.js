'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// In ms.
var WAKEUP_INTERVAL = 20 * 60 * 1000;

var Cron = function () {
    function Cron(func) {
        var _this = this;

        _classCallCheck(this, Cron);

        // The function to run at the given date.
        this.func = func;

        // A timeout identifier (created by setTimeout) used only to run the
        // passed function.
        this.runTimeout = null;

        // Time in ms to the next run.
        this.timeToNextRun = null;

        // An interval used to wake up at a lower granularity than the
        // runTimeout, to work around a bug of low-end devices like Raspberry
        // PI.
        this.wakeUpInterval = setInterval(function () {
            if (_this.timeToNextRun === null) {
                return;
            }

            if (_this.timeToNextRun < WAKEUP_INTERVAL) {
                _this.runTimeout = setTimeout(_this.func, Math.max(0, _this.timeToNextRun));
                _this.timeToNextRun = null;
            } else {
                _this.timeToNextRun = _this.timeToNextRun - WAKEUP_INTERVAL;
            }
        }, WAKEUP_INTERVAL);
    }

    _createClass(Cron, [{
        key: 'setNextUpdate',
        value: function setNextUpdate(nextUpdate) {
            if (this.runTimeout !== null) {
                clearTimeout(this.runTimeout);
                this.runTimeout = null;
            }
            this.timeToNextRun = nextUpdate.diff((0, _moment2.default)());
        }
    }]);

    return Cron;
}();

exports.default = Cron;