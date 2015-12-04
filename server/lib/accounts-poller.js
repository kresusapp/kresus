import moment from 'moment';

import Access from '../models/access';

import AccountManager from './accounts-manager';
import ReportManager  from './report-manager';

import Error from '../controllers/errors';
import { makeLogger } from '../helpers';

let log = makeLogger('accounts-poller');

class AccountsPoller
{
    start() {
        this.prepareNextCheck();
        this.timeout = null;
    }

    prepareNextCheck() {

        if (this.timeout !== null) {
            clearTimeout(this.timeout);
            this.timeout = null;
        }

        // day after between 02:00am and 04:00am UTC
        let delta = Math.random() * 120 | 0;
        let now = moment();
        let nextUpdate = now.clone().add(1, 'days')
                            .hours(2)
                            .minutes(delta)
                            .seconds(0);

        let format = 'DD/MM/YYYY [at] HH:mm:ss';
        log.info(`> Next check of accounts on ${nextUpdate.format(format)}`);

        this.timeout = setTimeout(this.checkAllAccesses.bind(this),
                                  nextUpdate.diff(now));

        this.sentNoPasswordNotification = false;
    }

    async checkAllAccesses(cb) {
        try {
            log.info('Checking new operations for all accesses...');
            let accesses = await Access.all();
            for (let access of accesses) {
                let accountManager = new AccountManager;
                await accountManager.retrieveOperationsByAccess(access, cb);
            }

            log.info('Maybe sending reports...');
            await ReportManager.manageReports();

            log.info('All accounts have been polled.');
            this.prepareNextCheck();
            this.sentNoPasswordNotification = false;
        } catch (err) {
            log.error(`Error when polling accounts: ${err.toString()}`);

            if (err.code &&
                err.code === Error('NO_PASSWORD') &&
                !this.sentNoPasswordNotification) {
                // TODO do something with this
                this.sentNoPasswordNotification = true;
            }
        }
    }

    async runAtStartup(callback) {
        try {
            await this.checkAllAccesses(callback);
        } catch (err) {
            log.error(`when polling accounts at startup: ${err.toString()}`);
        }
    }
}

let accountPoller = new AccountsPoller;

export default accountPoller;
