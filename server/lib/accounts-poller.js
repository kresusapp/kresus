import moment from 'moment';
import async  from 'async';

import BankAccess    from "../models/access";
import Config        from "../models/kresusconfig";

import AccountManager from './accounts-manager';

let log = require('printit')({
    prefix: 'accounts-poller',
    date: true
});

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
        let delta = Math.random() * 120 | 0; // opa asm.js style
        let now = moment();
        let nextUpdate = now.clone().add(1, 'days')
                            .hours(2)
                            .minutes(delta)
                            .seconds(0);

        let format = "DD/MM/YYYY [at] HH:mm:ss";
        log.info(`> Next check of bank accounts on ${nextUpdate.format(format)}`);

        this.timeout = setTimeout(this.checkAllAccesses.bind(this), nextUpdate.diff(now));

    }

    checkAllAccesses() {
        log.info("Checking new operations for all bank accesses...");
        BankAccess.all((err, accesses) => {
            if (err) {
                log.info(`Error when retrieving all bank accesses: ${err}`);
                return;
            }

            function process(access, callback) {
                let accountManager = new AccountManager;
                accountManager.retrieveOperationsByBankAccess(access, callback);
            }

            async.each(accesses, process, (err) => {
                if (err) {
                    log.info(`Error when polling accounts: ${JSON.stringify(err)}`);
                    return;
                }
                log.info("All accounts have been polled.");
                this.prepareNextCheck();
            });
        });
    }
};

let accountPoller = new AccountsPoller;

export default accountPoller;

Config.byName('weboob-installed', (err, found) => {
    if (err || !found || !found.value || found.value !== 'true')
        return;
    accountPoller.checkAllAccesses();
});

