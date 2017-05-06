'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _helpers = require('../helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var log = (0, _helpers.makeLogger)('async-queue');

// An async queue that executes requests in a sequential fashion, waiting for
// the previous ones to finish first. It allows classes that have state
// and async methods to be re-entrant.

var AsyncQueue = function () {
    function AsyncQueue() {
        (0, _classCallCheck3.default)(this, AsyncQueue);

        this.requests = [];
        this.busy = false;
        this.id = 0;
        this.lastPromise = _promise2.default.resolve();
    }

    // Private method to just empty the requests list, until there's not
    // a single one remaining.


    (0, _createClass3.default)(AsyncQueue, [{
        key: '_emptyRequests',
        value: function _emptyRequests() {
            var _this = this;

            if (this.busy) {
                log.debug('busy, aborting');
                return;
            }

            if (!this.requests.length) {
                log.debug('no more requests!');
                return;
            }

            this.busy = true;
            log.debug('emptying ' + this.requests.length + ' requests');

            var _loop = function _loop() {
                var _requests$shift = _this.requests.shift(),
                    _requests$shift2 = (0, _slicedToArray3.default)(_requests$shift, 4),
                    id = _requests$shift2[0],
                    accept = _requests$shift2[1],
                    reject = _requests$shift2[2],
                    promiseFactory = _requests$shift2[3];

                _this.lastPromise = _this.lastPromise.then(function () {
                    log.debug('evaluating request #' + id);
                    return promiseFactory().then(accept, reject);
                });
            };

            while (this.requests.length) {
                _loop();
            }
            this.lastPromise.then(function () {
                _this.busy = false;
                _this._emptyRequests();
            });
        }

        // This is the wrapper, to be used as is in ctors:
        //
        //      this.funcName = this.queue.wrap(this.funcName.bind(this));
        //
        // Note the position of the bind() call.

    }, {
        key: 'wrap',
        value: function wrap(func) {
            var self = this;
            return function () {
                for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                    args[_key] = arguments[_key];
                }

                return new _promise2.default(function (accept, reject) {
                    log.debug('enqueuing request #' + self.id);
                    self.requests.push([self.id, accept, reject, function () {
                        return func.apply(undefined, args);
                    }]);
                    self.id++;
                    return self._emptyRequests();
                });
            };
        }
    }]);
    return AsyncQueue;
}();

exports.default = AsyncQueue;