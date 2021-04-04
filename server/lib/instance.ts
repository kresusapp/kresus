import { getVersion as getWoobVersion } from '../providers/woob';

import {
    isEmailEnabled,
    isAppriseApiEnabled,
    checkMinimalWoobVersion,
    UNKNOWN_WOOB_VERSION,
} from '../helpers';

import {
    CAN_ENCRYPT,
    EMAILS_ENABLED,
    FORCE_DEMO_MODE,
    NOTIFICATIONS_ENABLED,
    URL_PREFIX,
    WOOB_INSTALLED,
    WOOB_VERSION,
} from '../shared/instance';

export type InstancePropertiesType = { [key: string]: string };

export async function getAll(): Promise<InstancePropertiesType> {
    const values: InstancePropertiesType = {};

    const version = await getWoobVersion();

    // Only transmit the version is it known.
    if (version !== UNKNOWN_WOOB_VERSION) {
        values[WOOB_VERSION] = `${version}`;
    }

    // Add a pair to indicate woob install status.
    const isWoobInstalled = checkMinimalWoobVersion(version);
    values[WOOB_INSTALLED] = isWoobInstalled.toString();

    // Indicates at which path Kresus is served.
    values[URL_PREFIX] = String(process.kresus.urlPrefix);

    // Have emails been enabled by the administrator?
    values[EMAILS_ENABLED] = String(isEmailEnabled());

    // Have notifications been enabled by the administrator?
    values[NOTIFICATIONS_ENABLED] = String(isAppriseApiEnabled());

    // Is encryption enabled on the server?
    values[CAN_ENCRYPT] = String(process.kresus.salt !== null);

    // Is the server set up for demo?
    values[FORCE_DEMO_MODE] = String(!!process.kresus.forceDemoMode);

    return values;
}

// A list of all the settings that are implied at runtime and should not be
// saved into the database.
// *Never* ever remove a name from this list, since these are used also to
// know which settings shouldn't be imported or exported.
export const ConfigGhostSettings = new Set([
    'weboob-version', // legit "weboob": this is a ghost setting
    'weboob-installed', // legit "weboob": this is a ghost setting
    'standalone-mode',
    'url-prefix',
    'emails-enabled',
    'notifications-enabled',
    'can-encrypt',
    'force-demo-mode',
]);
