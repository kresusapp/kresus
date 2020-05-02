import moment from 'moment';

import { Access, Setting } from '../models';

import accountManager from './accounts-manager';
import Cron from './cron';
import ReportManager from './report-manager';
import AlertManager from './alert-manager';
import { bankVendorByUuid } from './bank-vendors';

import {
    assert,
    makeLogger,
    translate as $t,
    errorRequiresUserAction,
    POLLER_START_LOW_HOUR,
    POLLER_START_HIGH_HOUR,
    KError,
} from '../helpers';

const log = makeLogger('poller');

async function manageCredentialsErrors(userId: number, access: Access, err: KError) {
    if (!err.errCode) {
        return;
    }

    const bank = bankVendorByUuid(access.vendorId);
    assert(typeof bank !== 'undefined', 'The bank must be known');

    const bankLabel = access.customLabel || bank.name;

    // Retrieve the human readable error code.
    const error = $t(`server.email.fetch_error.${err.errCode}`);
    const subject = $t('server.email.fetch_error.subject');
    let content = $t('server.email.hello');
    content += '\n\n';
    content += $t('server.email.fetch_error.text', {
        bank: bankLabel,
        error,
        message: err.message,
    });
    content += '\n';
    content += $t('server.email.fetch_error.pause_poll');
    content += '\n\n';
    content += $t('server.email.signature');

    log.info('Warning the user that an error was detected');
    try {
        await AlertManager.send(userId, {
            subject,
            text: content,
        });
    } catch (e) {
        log.error(`when sending an email to warn about credential errors: ${e.message}`);
    }
}

// Can throw.
export async function fullPoll(userId: number) {
    log.info('Checking accounts and operations for all accesses...');

    let needUpdate = await Setting.findOrCreateDefaultBooleanValue(userId, 'weboob-auto-update');

    const accesses = await Access.all(userId);
    for (const access of accesses) {
        try {
            const { vendorId, login } = access;

            // Don't try to fetch accesses for deprecated modules.
            const staticBank = bankVendorByUuid(vendorId);
            if (!staticBank || staticBank.deprecated) {
                log.info(
                    `Won't poll, module for bank ${vendorId} with login ${login} is deprecated.`
                );
                continue;
            }

            // Only import if last poll did not raise a login/parameter error.
            if (access.canBePolled()) {
                await accountManager.retrieveNewAccountsByAccess(
                    userId,
                    access,
                    /* add new accounts */ false,
                    needUpdate
                );
                // Update the repos only once.
                needUpdate = false;
                await accountManager.retrieveOperationsByAccess(userId, access);
            } else if (!access.isEnabled()) {
                log.info(
                    `Won't poll, access from bank ${vendorId} with login ${login} is disabled.`
                );
            } else {
                const error = access.fetchStatus;
                log.info(
                    `Won't poll, access from bank ${vendorId} with login ${login} last fetch raised: ${error}.`
                );
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
    cron: Cron;

    constructor() {
        this.run = this.run.bind(this);
        this.cron = new Cron(this.run);
    }

    programNextRun() {
        // The next run is programmed to happen the next day, at a random hour
        // in [POLLER_START_LOW; POLLER_START_HOUR].
        const delta = (Math.random() * (POLLER_START_HIGH_HOUR - POLLER_START_LOW_HOUR) * 60) | 0;

        const nextUpdate = moment()
            .clone()
            .add(1, 'days')
            .hours(POLLER_START_LOW_HOUR)
            .minutes(delta)
            .seconds(0);

        const format = 'DD/MM/YYYY [at] HH:mm:ss';
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

        // Only polls accounts for the current user, not for all users, until
        // proper support for multiple users has been implemented.
        try {
            await fullPoll(process.kresus.user.id);
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
