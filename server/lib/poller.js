import moment from 'moment';

import Access from '../models/access';
import Config from '../models/config';
import Bank from '../models/bank';

import accountManager from './accounts-manager';
import Cron from './cron';
import ReportManager from './report-manager';
import Emailer from './emailer';

import * as weboob from './sources/weboob';

import {
    assert,
    makeLogger,
    translate as $t,
    isCredentialError,
    POLLER_START_LOW_HOUR,
    POLLER_START_HIGH_HOUR
} from '../helpers';

let log = makeLogger('poller');

class Poller {
    constructor() {
        this.run = this.run.bind(this);
        this.cron = new Cron(this.run);
    }

    programNextRun() {
        // The next run is programmed to happen the next day, at a random hour
        // in [POLLER_START_LOW; POLLER_START_HOUR].
        let delta = Math.random() * (POLLER_START_HIGH_HOUR - POLLER_START_LOW_HOUR) * 60 | 0;

        let nextUpdate = moment().clone()
                                 .add(1, 'days')
                                 .hours(POLLER_START_LOW_HOUR)
                                 .minutes(delta)
                                 .seconds(0);

        let format = 'DD/MM/YYYY [at] HH:mm:ss';
        log.info(`> Next check of accounts on ${nextUpdate.format(format)}`);

        this.cron.setNextUpdate(nextUpdate);
    }

    async updateWeboob() {
        try {
            if (await Config.findOrCreateDefaultBooleanValue('weboob-auto-update')) {
                await weboob.updateWeboobModules();
            }
        } catch (err) {
            log.error(`Error when updating Weboob in polling: ${err.message}`);
        }
    }

    async run(cb) {
        try {
            // Ensure checks will continue even if we hit some error during the process.
            this.programNextRun();
        } catch (err) {
            log.error(`Error when preparing the next check: ${err.message}`);
        }

        await this.updateWeboob();

        log.info('Checking accounts and operations for all accesses...');

        try {
            let accesses = await Access.all();

            for (let access of accesses) {
                try {
                    // Only import if last poll did not raise a login/parameter error.
                    if (access.canBePolled()) {
                        await accountManager.retrieveNewAccountsByAccess(access, false);
                        await accountManager.retrieveOperationsByAccess(access, cb);
                    } else {
                        let error = access.fetchStatus;
                        log.info(`Cannot poll, last fetch raised: ${error}`);
                    }
                } catch (err) {
                    log.error(`Error when polling accounts: ${err.message}`);
                    if (err.errCode && isCredentialError(err)) {
                        await this.manageCredentialErrors(access, err);
                    }
                }
            }

            // Reports
            log.info('Maybe sending reports...');
            await ReportManager.manageReports();

            // Done!
            log.info('All accounts have been polled.');
        } catch (err) {
            log.error(`Error when polling accounts: ${err.message}`);
        }
    }

    async runAtStartup(cb) {
        try {
            await this.run(cb);
        } catch (err) {
            log.error(`when polling accounts at startup: ${err.message}`);
        }
    }

    async manageCredentialErrors(access, err) {
        if (!err.errCode)
            return;

        // We save the error status, so that the operations
        // are not fetched on next poll instance.
        access.fetchStatus = err.errCode;
        await access.save();

        let bank = Bank.byUuid(access.bank);
        assert(bank, 'The bank must be known');
        bank = bank.name;

        // Retrieve the human readable error code.
        let error = $t(`server.email.fetch_error.${err.errCode}`);
        let subject = $t('server.email.fetch_error.subject');
        let content = $t('server.email.hello');
        content += '\n\n';
        content += $t('server.email.fetch_error.text', {
            bank,
            error,
            message: err.message
        });
        content += '\n';
        content += $t('server.email.fetch_error.pause_poll');
        content += '\n\n';
        content += $t('server.email.signature');

        log.info('Warning the user that an error was detected');
        try {
            await Emailer.sendToUser({
                subject,
                content
            });
        } catch (e) {
            log.error(`when sending an email to warn about credential errors: ${e.message}`);
        }
    }
}

const poller = new Poller;

export default poller;
