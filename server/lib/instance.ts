import { getVersion as getWeboobVersion } from '../providers/weboob';

import {
    isEmailEnabled,
    isAppriseApiEnabled,
    checkWeboobMinimalVersion,
    UNKNOWN_WEBOOB_VERSION,
} from '../helpers';

import {
    CAN_ENCRYPT,
    EMAILS_ENABLED,
    FORCE_DEMO_MODE,
    NOTIFICATIONS_ENABLED,
    URL_PREFIX,
    WEBOOB_INSTALLED,
    WEBOOB_VERSION,
} from '../shared/instance';

export type InstancePropertiesType = { [key: string]: string };

export async function getAll(): Promise<InstancePropertiesType> {
    const values: InstancePropertiesType = {};

    const version = await getWeboobVersion();

    // Only transmit the version is it known.
    if (version !== UNKNOWN_WEBOOB_VERSION) {
        values[WEBOOB_VERSION] = `${version}`;
    }

    // Add a pair to indicate weboob install status.
    const isWeboobInstalled = checkWeboobMinimalVersion(version);
    values[WEBOOB_INSTALLED] = isWeboobInstalled.toString();

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
    'weboob-version',
    'weboob-installed',
    'standalone-mode',
    'url-prefix',
    'emails-enabled',
    'notifications-enabled',
    'can-encrypt',
    'force-demo-mode',
]);
