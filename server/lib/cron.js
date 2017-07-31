import moment from 'moment';

import {
    makeLogger,
    POLLER_START_LOW_HOUR,
    POLLER_START_HIGH_HOUR
} from '../helpers';

let log = makeLogger('cron');

// In ms.
const WAKEUP_INTERVAL = 10000 //20 * 60 * 1000;
const DAY = 1000 * 60 * 60 * 24;

class Cron {
    constructor(func, period) {
        // The function to run at the given date.
        this.func = () => {
            // Set next update before running `func`, in case of failure/error.
            this.setNextUpdate();
            func();
        };

        // The delay in ms between two runs of this.func.
        this.period = period;

        // A timeout identifier (created by setTimeout) used only to run the
        // passed function.
        this.runTimeout = null;

        // Time in ms to the next run.
        this.timeToNextRun = null;

        this.setNextUpdate();
        // An interval used to wake up at a lower granularity than the
        // runTimeout, to work around a bug of low-end devices like Raspberry
        // PI.
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

    setNextUpdate() {
        this.reset();
        if (this.period >= DAY) {
            // If the period is higher than a DAY, the next run is programmed to happen at a random
            // hour in [POLLER_START_LOW; POLLER_START_HOUR], in this.period/DAY day.
            let delta = Math.random() * (POLLER_START_HIGH_HOUR - POLLER_START_LOW_HOUR) * 60 | 0;
            let nextUpdate = moment().clone()
                                     .add((this.period / DAY) | 0, 'days')
                                     .hours(POLLER_START_LOW_HOUR)
                                     .minutes(delta)
                                     .seconds(0);
            this.timeToNextRun = nextUpdate.diff(moment());
        } else {
            this.timeToNextRun = this.period;
        }

        log.info(`Programming next run on ${moment().add(this.timeToNextRun).format('Do [of] MMMM YYYY [at] hh:mm:ss')}`);
    }

    reset() {
        if (this.runTimeout !== null) {
            clearTimeout(this.runTimeout);
            this.runTimeout = null;
        }
    }

    clear() {
        this.reset();
        if (this.wakeUpInterval !== null) {
            clearInterval(this.wakeUpInterval);
        }
    }
}

export default Cron;
