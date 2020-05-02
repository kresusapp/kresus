import * as moment from 'moment';

// In ms.
const WAKEUP_INTERVAL = 20 * 60 * 1000;

class Cron {
    // The function to run at the given date.
    func: (...args: any[]) => void;

    // A timeout identifier (created by setTimeout) used only to run the passed
    // function.
    runTimeout: NodeJS.Timer | null;

    // Time in ms to the next run.
    timeToNextRun: number | null;

    // An interval used to wake up at a lower granularity than the runTimeout,
    // to work around a bug of low-end devices like Raspberry PI.
    wakeUpInterval: NodeJS.Timer;

    constructor(func: (...args: any[]) => void) {
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
            } else {
                this.timeToNextRun = this.timeToNextRun - WAKEUP_INTERVAL;
            }
        }, WAKEUP_INTERVAL);
    }

    setNextUpdate(nextUpdate: moment.Moment) {
        if (this.runTimeout !== null) {
            clearTimeout(this.runTimeout);
            this.runTimeout = null;
        }
        this.timeToNextRun = nextUpdate.diff(new Date());
    }
}

export default Cron;
