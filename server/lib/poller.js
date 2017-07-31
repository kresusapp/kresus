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
    isCredentialError
} from '../helpers';

let log = makeLogger('poller');

// Can throw.
async function updateWeboob() {
    if (await Config.findOrCreateDefaultBooleanValue('weboob-auto-update')) {
        await weboob.updateWeboobModules();
    }
}

async function manageCredentialsErrors(access, err) {
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

// Can throw.
async function sendReports() {
    log.info('Maybe sending reports...');
    await ReportManager.manageReports();
    log.info('Reports have been sent.');
}

// Can throw.
async function pollAccess(access) {
    try {
        // Only import if access is active and last poll did not raise
        // a login/parameter error.
        if (access.canBePolled()) {
            await accountManager.retrieveNewAccountsByAccess(access, false);
            await accountManager.retrieveOperationsByAccess(access);
        } else {
            let { isActive, fetchStatus } = access;
            // TODO Clean.
            if (isActive) {
                log.info(`Cannot poll, last fetch raised: ${fetchStatus}`);
            } else {
                log.info('Cannot poll, access is disabled');
            }
        }
    } catch (err) {
        log.error(`Error when polling accounts: ${err.message}`);
        if (err.errCode && isCredentialError(err)) {
            await manageCredentialsErrors(access, err);
        }
    }
}

// Can throw
export async function fullPoll(addToMap) {
    log.info('Checking accounts and operations for all accesses...');
    await updateWeboob();
    let accesses = await Access.all();
    for (let access of accesses) {
        if (access.isActive) {
            if (addToMap)
                this.add(access);
            pollAccess(access);
        }
    }
    await sendReports();
}

class Poller {
    constructor() {
        this.cronMap = new Map();
    }

    async runAtStartup() {
        let poll = fullPoll.bind(this, true);
        try {
            await poll();
        } catch (err) {
            log.error(`when polling accounts at startup: ${err.message}`);
        }
    }

    add(access) {
        if (!this.cronMap.has(access.id) && access.isActive) {
            log.info(`Adding the cron for access ${access.id}. Fetch will occur every ${access.pollPeriod} s.`);
            const run = async () => {
                try {
                    let acc = await Access.find(access.id);
                    await updateWeboob();
                    await pollAccess(acc);
                    await sendReports();
                } catch (err) {
                    log.error(`Error when polling accounts: ${err.message}`);
                }
            };

            this.cronMap.set(access.id, new Cron(run, /*access.pollPeriod **/ 15000));
        }
    }

    clear(access) {
        log.info(`Clearing the cron for access ${access.id}`);
        let cron = this.cronMap.get(access.id);
        cron.clear();

        this.cronMap.delete(access.id);
    }

    update(access) {
        this.clear(access);
        this.add(access);
    }
}

const poller = new Poller;

export default poller;
