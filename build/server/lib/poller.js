"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fullPoll = fullPoll;
const moment_1 = __importDefault(require("moment"));
const models_1 = require("../models");
const providers_1 = require("../providers");
const accounts_manager_1 = __importDefault(require("./accounts-manager"));
const cron_1 = __importDefault(require("./cron"));
const report_manager_1 = __importDefault(require("./report-manager"));
const alert_manager_1 = __importDefault(require("./alert-manager"));
const helpers_1 = require("../helpers");
const settings_1 = require("../../shared/settings");
const translator_1 = require("./translator");
const log = (0, helpers_1.makeLogger)('poller');
async function managePollingErrors(userId, accessLabel, type, errorMessages, requiresUserAction = false) {
    const i18n = await (0, translator_1.getTranslator)(userId);
    const blockingStatusLocale = (0, helpers_1.translate)(i18n, `server.email.fetch_error.${type}`, {
        // eslint-disable-next-line camelcase
        smart_count: errorMessages.length,
    });
    const subject = (0, helpers_1.translate)(i18n, 'server.email.fetch_error.subject', {
        // eslint-disable-next-line camelcase
        smart_count: errorMessages.length,
        type: blockingStatusLocale,
    });
    let content = (0, helpers_1.translate)(i18n, 'server.email.fetch_error.text', {
        bank: accessLabel,
        error: errorMessages.length > 1
            ? errorMessages.map(e => `– ${e}`).join('\n')
            : errorMessages[0],
    });
    if (requiresUserAction) {
        content += '\n';
        content += (0, helpers_1.translate)(i18n, 'server.email.fetch_error.pause_poll');
    }
    log.info('Warning the user that errors were detected');
    await alert_manager_1.default.send(userId, i18n, {
        subject,
        text: content,
    });
}
async function manageBlockingPollingErrors(userId, access, err) {
    (0, helpers_1.assert)(!!err.errCode, 'should have an error code to call manageBlockingPollingErrors');
    const i18n = await (0, translator_1.getTranslator)(userId);
    await managePollingErrors(userId, access.getLabel(), 'blocking', [
        // Retrieve the human readable error code.
        (0, helpers_1.translate)(i18n, `server.email.fetch_error.${err.errCode}`),
    ], (0, helpers_1.errorRequiresUserAction)(err));
}
async function managePartialPollingErrors(userId, access, errors) {
    await managePollingErrors(userId, access.getLabel(), 'non_blocking', errors);
}
// Can throw.
async function fullPoll(userId) {
    log.info('Checking accounts and transactions for all accesses...');
    let needUpdate = await models_1.Setting.findOrCreateDefaultBooleanValue(userId, settings_1.WOOB_AUTO_UPDATE);
    const accesses = await models_1.Access.all(userId);
    for (const access of accesses) {
        try {
            const { vendorId } = access;
            // Don't try to fetch accesses for deprecated modules.
            const staticBank = (0, providers_1.bankVendorByUuid)(vendorId);
            if (!staticBank || staticBank.deprecated) {
                log.info(`Won't poll, module for bank ”${access.getLabel()}” with vendorId ${vendorId} is deprecated.`);
                continue;
            }
            // Only import if it's possible and desirable to do so.
            if (access.canBePolled()) {
                const accountResponse = await accounts_manager_1.default.syncAccounts(userId, access, {
                    addNewAccounts: false,
                    updateProvider: needUpdate,
                    isInteractive: false,
                    userActionFields: null,
                });
                if (accountResponse.kind === 'user_action') {
                    // Ask for presence of the user.
                    throw new helpers_1.KError('User must attend polling', 500, (0, helpers_1.getErrorCode)('REQUIRES_INTERACTIVE'));
                }
                const accountInfoMap = accountResponse.value;
                if (accountResponse.errors && accountResponse.errors.length) {
                    await managePartialPollingErrors(userId, access, accountResponse.errors);
                }
                // Update the repos only once.
                needUpdate = false;
                const transactionResponse = await accounts_manager_1.default.syncTransactions(userId, access, accountInfoMap, 
                /* isInteractive */ false);
                (0, helpers_1.assert)(transactionResponse.kind !== 'user_action', 'Unexpected action requirement after accounts have been successfully polled');
                if (transactionResponse.errors && transactionResponse.errors.length) {
                    await managePartialPollingErrors(userId, access, transactionResponse.errors);
                }
            }
            else if (!access.isEnabled() || access.excludeFromPoll) {
                log.info(`Won't poll, access from bank ”${access.getLabel()}” with vendorId ${vendorId} is disabled or shouldn't be polled.`);
            }
            else {
                const error = access.fetchStatus;
                log.info(`Won't poll, access from bank ”${access.getLabel()}” with vendorId ${vendorId} last fetch raised: ${error}.`);
            }
        }
        catch (err) {
            log.error(`Error when polling accounts: ${err.message}\n`, err);
            if (err.errCode) {
                await manageBlockingPollingErrors(userId, access, err);
            }
        }
    }
    log.info('All accounts have been polled.');
    log.info('Maybe sending reports...');
    await report_manager_1.default.manageReports(userId);
    log.info('Reports have been sent.');
}
class Poller {
    constructor() {
        this.run = this.run.bind(this);
        this.cron = new cron_1.default(this.run);
    }
    programNextRun() {
        // The next run is programmed to happen the next day, at a random hour
        // in [POLLER_START_LOW; POLLER_START_HOUR].
        const delta = (Math.random() * (helpers_1.POLLER_START_HIGH_HOUR - helpers_1.POLLER_START_LOW_HOUR) * 60) | 0;
        const nextUpdate = (0, moment_1.default)()
            .clone()
            .add(1, 'days')
            .hours(helpers_1.POLLER_START_LOW_HOUR)
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
        }
        catch (err) {
            log.error(`Error when preparing the next check: ${err.message}`);
        }
        // Polls accounts for every user.
        const users = await models_1.User.all();
        for (const user of users) {
            try {
                await fullPoll(user.id);
            }
            catch (err) {
                log.error(`Error when doing an automatic poll for user ${user.login}: ${err.message}`);
            }
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
