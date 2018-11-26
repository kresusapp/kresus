import moment from 'moment';

import Accesses from '../models/accesses';
import Config from '../models/config';
import Bank from '../models/bank';
import User from '../models/users';

import accountManager from './accounts-manager';
import Cron from './cron';
import ReportManager from './report-manager';
import Emailer from './emailer';

import {
    assert,
    makeLogger,
    translate as $t,
    errorRequiresUserAction,
    POLLER_START_LOW_HOUR,
    POLLER_START_HIGH_HOUR
} from '../helpers';

let log = makeLogger('poller');

async function manageCredentialsErrors(userId, access, err) {
    if (!err.errCode) {
        return;
    }

    // We save the error status, so that the operations
    // are not fetched on next poll instance.
    await Accesses.update(userId, access.id, { fetchStatus: err.errCode });

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
        await Emailer.sendToUser(userId, {
            subject,
            content
        });
    } catch (e) {
        log.error(`when sending an email to warn about credential errors: ${e.message}`);
    }
}

// Can throw.
export async function fullPoll(userId) {
    log.info('Checking accounts and operations for all accesses...');

    let needUpdate = await Config.findOrCreateDefaultBooleanValue(userId, 'weboob-auto-update');

    let accesses = await Accesses.all(userId);
    for (let access of accesses) {
        try {
            // Only import if last poll did not raise a login/parameter error.
            if (access.canBePolled()) {
                await accountManager.retrieveNewAccountsByAccess(userId, access, false, needUpdate);
                // Update the repos only once.
                needUpdate = false;
                await accountManager.retrieveOperationsByAccess(userId, access);
            } else {
                let { bank, enabled, login } = access;
                if (!enabled) {
                    log.info(
                        `Won't poll, access from bank ${bank} with login ${login} is disabled.`
                    );
                } else {
                    let error = access.fetchStatus;
                    log.info(
                        `Won't poll, access from bank ${bank} with login ${login} last fetch raised: ${error}.`
                    );
                }
            }
        } catch (err) {
            log.error(`Error when polling accounts: ${err.message}\n`, err);
            if (err.errCode && errorRequiresUserAction(err)) {
                await manageCredentialsErrors(userId, access, err);
            }
        }
    }

    log.info('All accounts have been polled.');
    log.info('Maybe sending reports...');
    await ReportManager.manageReports(userId);
    log.info('Reports have been sent.');
}

class Poller {
    constructor() {
        this.run = this.run.bind(this);
        this.cron = new Cron(this.run);
    }

    programNextRun() {
        // The next run is programmed to happen the next day, at a random hour
        // in [POLLER_START_LOW; POLLER_START_HOUR].
        let delta = (Math.random() * (POLLER_START_HIGH_HOUR - POLLER_START_LOW_HOUR) * 60) | 0;

        let nextUpdate = moment()
            .clone()
            .add(1, 'days')
            .hours(POLLER_START_LOW_HOUR)
            .minutes(delta)
            .seconds(0);

        let format = 'DD/MM/YYYY [at] HH:mm:ss';
        log.info(`> Next check of accounts on ${nextUpdate.format(format)}`);

        this.cron.setNextUpdate(nextUpdate);
    }

    async run() {
        try {
            // Ensure checks will continue even if we hit some error during the process.
            this.programNextRun();
        } catch (err) {
            log.error(`Error when preparing the next check: ${err.message}`);
        }

        try {
            let users = await User.all();
            for (let user of users) {
                // If polling fails for a user, log the error and continue.
                try {
                    await fullPoll(user.id);
                } catch (err) {
                    log.error(`Error when doing poll for user with id=${user.id}: ${err.message}`);
                }
            }
        } catch (err) {
            log.error(`Error when doing an automatic poll: ${err.message}`);
        }
    }

    async runAtStartup() {
        try {
            await this.run();
        } catch (err) {
            log.error(`when polling accounts at startup: ${err.message}`);
        }
    }
}

const poller = new Poller();

export default poller;
