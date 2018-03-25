'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _helpers = require('../helpers');

let log = (0, _helpers.makeLogger)('async-queue');

// An async queue that executes requests in a sequential fashion, waiting for
// the previous ones to finish first. It allows classes that have state
// and async methods to be re-entrant.
class AsyncQueue {
    constructor() {
        this.requests = [];
        this.busy = false;
        this.id = 0;
        this.lastPromise = Promise.resolve();
    }

    // Private method to just empty the requests list, until there's not
    // a single one remaining.
    _emptyRequests() {
        if (this.busy) {
            log.debug('busy, aborting');
            return;
        }

        if (!this.requests.length) {
            log.debug('no more requests!');
            return;
        }

        this.busy = true;
        log.debug(`emptying ${this.requests.length} requests`);
        while (this.requests.length) {
            var _requests$shift = this.requests.shift(),
                _requests$shift2 = _slicedToArray(_requests$shift, 4);

            let id = _requests$shift2[0],
                accept = _requests$shift2[1],
                reject = _requests$shift2[2],
                promiseFactory = _requests$shift2[3];

            this.lastPromise = this.lastPromise.then(() => {
                log.debug(`evaluating request #${id}`);
                return promiseFactory().then(accept, reject);
            });
        }
        this.lastPromise.then(() => {
            this.busy = false;
            this._emptyRequests();
        });
    }

    // This is the wrapper, to be used as is in ctors:
    //
    //      this.funcName = this.queue.wrap(this.funcName.bind(this));
    //
    // Note the position of the bind() call.
    wrap(func) {
        let self = this;
        return function (...args) {
            return new Promise((accept, reject) => {
                log.debug(`enqueuing request #${self.id}`);
                self.requests.push([self.id, accept, reject, () => func(...args)]);
                self.id++;
                return self._emptyRequests();
            });
        };
    }
}
exports.default = AsyncQueue;