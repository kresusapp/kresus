import { getVersion as getWeboobVersion } from '../providers/weboob';

import {
    isEmailEnabled,
    isAppriseApiEnabled,
    checkWeboobMinimalVersion,
    UNKNOWN_WEBOOB_VERSION,
} from '../helpers';

export async function getAll(): Promise<Array<object>> {
    const values = [];

    const version = await getWeboobVersion();

    // Only transmit the version is it known.
    if (version !== UNKNOWN_WEBOOB_VERSION) {
        values.push({ key: 'weboob-version', value: `${version}` });
    }

    // Add a pair to indicate weboob install status.
    const isWeboobInstalled = checkWeboobMinimalVersion(version);
    values.push({ key: 'weboob-installed', value: isWeboobInstalled.toString() });

    // Indicates at which path Kresus is served.
    values.push({ key: 'url-prefix', value: String(process.kresus.urlPrefix) });

    // Have emails been enabled by the administrator?
    values.push({ key: 'emails-enabled', value: String(isEmailEnabled()) });

    // Have notifications been enabled by the administrator?
    values.push({ key: 'notifications-enabled', value: String(isAppriseApiEnabled()) });

    // Is encryption enabled on the server?
    values.push({ key: 'can-encrypt', value: String(process.kresus.salt !== null) });

    // Is the server set up for demo?
    values.push({ key: 'force-demo-mode', value: String(!!process.kresus.forceDemoMode) });

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
