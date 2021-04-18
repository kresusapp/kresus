"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// In ms.
const WAKEUP_INTERVAL = 20 * 60 * 1000;
class Cron {
    constructor(func) {
        this.func = func;
        this.runTimeout = null;
        this.timeToNextRun = null;
        this.wakeUpInterval = setInterval(() => {
            if (this.timeToNextRun === null) {
                return;
            }
            if (this.timeToNextRun < WAKEUP_INTERVAL) {
                this.runTimeout = setTimeout(this.func, Math.max(0, this.timeToNextRun));
                this.timeToNextRun = null;
            }
            else {
                this.timeToNextRun -= WAKEUP_INTERVAL;
            }
        }, WAKEUP_INTERVAL);
    }
    setNextUpdate(nextUpdate) {
        if (this.runTimeout !== null) {
            clearTimeout(this.runTimeout);
            this.runTimeout = null;
        }
        this.timeToNextRun = nextUpdate.diff(new Date());
    }
}
exports.default = Cron;
