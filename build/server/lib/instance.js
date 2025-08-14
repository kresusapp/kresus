"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigGhostSettings = void 0;
exports.getAll = getAll;
const woob_1 = require("../providers/woob");
const helpers_1 = require("../helpers");
const instance_1 = require("../shared/instance");
async function getAll() {
    const values = {};
    const version = await (0, woob_1.getVersion)();
    // Only transmit the version is it known.
    if (version !== helpers_1.UNKNOWN_WOOB_VERSION) {
        values[instance_1.WOOB_VERSION] = `${version}`;
    }
    // Add a pair to indicate woob install status.
    const isWoobInstalled = (0, helpers_1.checkMinimalWoobVersion)(version);
    values[instance_1.WOOB_INSTALLED] = isWoobInstalled.toString();
    // Indicates at which path Kresus is served.
    values[instance_1.URL_PREFIX] = String(process.kresus.urlPrefix);
    // Have emails been enabled by the administrator?
    values[instance_1.EMAILS_ENABLED] = String((0, helpers_1.isEmailEnabled)());
    // Have notifications been enabled by the administrator?
    values[instance_1.NOTIFICATIONS_ENABLED] = String((0, helpers_1.isAppriseApiEnabled)());
    // Is encryption enabled on the server?
    values[instance_1.CAN_ENCRYPT] = String(process.kresus.salt !== null);
    // Is the server set up for demo?
    values[instance_1.FORCE_DEMO_MODE] = String(!!process.kresus.forceDemoMode);
    // Is the server running in dev environment?
    values[instance_1.DEV_ENV] = String((process.env.NODE_ENV || 'development') !== 'production');
    return values;
}
// A list of all the settings that are implied at runtime and should not be
// saved into the database.
// *Never* ever remove a name from this list, since these are used also to
// know which settings shouldn't be imported or exported.
exports.ConfigGhostSettings = new Set([
    'weboob-version', // legit "weboob": this is a ghost setting
    'weboob-installed', // legit "weboob": this is a ghost setting
    'standalone-mode',
    'url-prefix',
    'emails-enabled',
    'notifications-enabled',
    'can-encrypt',
    'force-demo-mode',
    'migration-version',
    'woob-use-nss',
]);
