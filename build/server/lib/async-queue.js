'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _helpers = require('../helpers');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var log = (0, _helpers.makeLogger)('async-queue');

// An async queue that executes requests in a sequential fashion, waiting for
// the previous ones to finish first. It allows classes that have state
// and async methods to be re-entrant.

var AsyncQueue = function () {
    function AsyncQueue() {
        _classCallCheck(this, AsyncQueue);

        this.requests = [];
        this.busy = false;
        this.id = 0;
        this.lastPromise = Promise.resolve();
    }

    // Private method to just empty the requests list, until there's not
    // a single one remaining.


    _createClass(AsyncQueue, [{
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
                    _requests$shift2 = _slicedToArray(_requests$shift, 4),
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

                return new Promise(function (accept, reject) {
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