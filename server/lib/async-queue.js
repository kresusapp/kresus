import { makeLogger } from '../helpers';

let log = makeLogger('async-queue');

// An async queue that executes requests in a sequential fashion, waiting for
// the previous ones to finish first. It allows classes that have state
// and async methods to be re-entrant.
export default class AsyncQueue {
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
            let [id, accept, reject, promiseFactory] = this.requests.shift();
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
        return function(...args) {
            return new Promise((accept, reject) => {
                log.debug(`enqueuing request #${self.id}`);
                self.requests.push([self.id, accept, reject, () => func(...args)]);
                self.id++;
                return self._emptyRequests();
            });
        };
    }
}
