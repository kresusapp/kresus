"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const moment_1 = __importDefault(require("moment"));
const models_1 = require("../models");
const accounts_manager_1 = __importDefault(require("./accounts-manager"));
const cron_1 = __importDefault(require("./cron"));
const report_manager_1 = __importDefault(require("./report-manager"));
const alert_manager_1 = __importDefault(require("./alert-manager"));
const bank_vendors_1 = require("./bank-vendors");
const helpers_1 = require("../helpers");
let log = helpers_1.makeLogger('poller');
async function manageCredentialsErrors(userId, access, err) {
    if (!err.errCode) {
        return;
    }
    let bank = bank_vendors_1.bankVendorByUuid(access.vendorId);
    helpers_1.assert(typeof bank !== 'undefined', 'The bank must be known');
    bank = access.customLabel || bank.name;
    // Retrieve the human readable error code.
    let error = helpers_1.translate(`server.email.fetch_error.${err.errCode}`);
    let subject = helpers_1.translate('server.email.fetch_error.subject');
    let content = helpers_1.translate('server.email.hello');
    content += '\n\n';
    content += helpers_1.translate('server.email.fetch_error.text', {
        bank,
        error,
        message: err.message
    });
    content += '\n';
    content += helpers_1.translate('server.email.fetch_error.pause_poll');
    content += '\n\n';
    content += helpers_1.translate('server.email.signature');
    log.info('Warning the user that an error was detected');
    try {
        await alert_manager_1.default.send(userId, {
            subject,
            text: content
        });
    }
    catch (e) {
        log.error(`when sending an email to warn about credential errors: ${e.message}`);
    }
}
// Can throw.
async function fullPoll(userId) {
    log.info('Checking accounts and operations for all accesses...');
    let needUpdate = await models_1.Setting.findOrCreateDefaultBooleanValue(userId, 'weboob-auto-update');
    let accesses = await models_1.Access.all(userId);
    for (let access of accesses) {
        try {
            let { vendorId, login } = access;
            // Don't try to fetch accesses for deprecated modules.
            let staticBank = bank_vendors_1.bankVendorByUuid(vendorId);
            if (!staticBank || staticBank.deprecated) {
                log.info(`Won't poll, module for bank ${vendorId} with login ${login} is deprecated.`);
                continue;
            }
            // Only import if last poll did not raise a login/parameter error.
            if (access.canBePolled()) {
                await accounts_manager_1.default.retrieveNewAccountsByAccess(userId, access, 
                /* add new accounts */ false, needUpdate);
                // Update the repos only once.
                needUpdate = false;
                await accounts_manager_1.default.retrieveOperationsByAccess(userId, access);
            }
            else if (!access.isEnabled()) {
                log.info(`Won't poll, access from bank ${vendorId} with login ${login} is disabled.`);
            }
            else {
                let error = access.fetchStatus;
                log.info(`Won't poll, access from bank ${vendorId} with login ${login} last fetch raised: ${error}.`);
            }
        }
        catch (err) {
            log.error(`Error when polling accounts: ${err.message}\n`, err);
            if (err.errCode && helpers_1.errorRequiresUserAction(err)) {
                await manageCredentialsErrors(userId, access, err);
            }
        }
    }
    log.info('All accounts have been polled.');
    log.info('Maybe sending reports...');
    await report_manager_1.default.manageReports(userId);
    log.info('Reports have been sent.');
}
exports.fullPoll = fullPoll;
class Poller {
    constructor() {
        this.run = this.run.bind(this);
        this.cron = new cron_1.default(this.run);
    }
    programNextRun() {
        // The next run is programmed to happen the next day, at a random hour
        // in [POLLER_START_LOW; POLLER_START_HOUR].
        let delta = (Math.random() * (helpers_1.POLLER_START_HIGH_HOUR - helpers_1.POLLER_START_LOW_HOUR) * 60) | 0;
        let nextUpdate = moment_1.default()
            .clone()
            .add(1, 'days')
            .hours(helpers_1.POLLER_START_LOW_HOUR)
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
        }
        catch (err) {
            log.error(`Error when preparing the next check: ${err.message}`);
        }
        // Only polls accounts for the current user, not for all users, until
        // proper support for multiple users has been implemented.
        try {
            await fullPoll(process.kresus.user.id);
        }
        catch (err) {
            log.error(`Error when doing an automatic poll: ${err.message}`);
        }
    }
    async runAtStartup() {
        try {
            await this.run();
        }
        catch (err) {
            log.error(`when polling accounts at startup: ${err.message}`);
        }
    }
}
const poller = new Poller();
exports.default = poller;
