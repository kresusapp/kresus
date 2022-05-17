"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const helpers_1 = require("../helpers");
const log = (0, helpers_1.makeLogger)('async-queue');
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
            const shifted = this.requests.shift();
            (0, helpers_1.assert)(typeof shifted !== 'undefined', 'by check on this.requests.length');
            const { id, accept, reject, makePromise } = shifted;
            this.lastPromise = this.lastPromise.then(() => {
                log.debug(`evaluating request #${id}`);
                return makePromise().then(accept, reject);
            });
        }
        return this.lastPromise.then(() => {
            this.busy = false;
            return this._emptyRequests();
        });
    }
    // This is the wrapper, to be used as is in ctors:
    //
    //      this.funcName = this.queue.wrap(this.funcName.bind(this));
    //
    // Note the position of the bind() call.
    wrap(func) {
        return (...args) => {
            return new Promise((accept, reject) => {
                log.debug(`enqueuing request #${this.id}`);
                this.requests.push({
                    id: this.id,
                    accept,
                    reject,
                    makePromise: () => func(...args),
                });
                this.id++;
                return this._emptyRequests();
            });
        };
    }
}
exports.default = AsyncQueue;
