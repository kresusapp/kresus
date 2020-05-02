import { assert, makeLogger } from '../helpers';

const log = makeLogger('async-queue');

interface Request<T> {
    id: number;
    accept: (result: any) => void;
    reject: (error: any) => void;
    makePromise: () => Promise<T>;
}

// An async queue that executes requests in a sequential fashion, waiting for
// the previous ones to finish first. It allows classes that have state
// and async methods to be re-entrant.
export default class AsyncQueue {
    id: number;
    busy: boolean;
    requests: Request<any>[];
    lastPromise: Promise<any>;

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
            assert(typeof shifted !== 'undefined', 'by check on this.requests.length');

            const { id, accept, reject, makePromise } = shifted;

            this.lastPromise = this.lastPromise.then(() => {
                log.debug(`evaluating request #${id}`);
                return makePromise().then(accept, reject);
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
    wrap<T>(func: (...funcArgs: any[]) => Promise<T>): () => Promise<T> {
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
