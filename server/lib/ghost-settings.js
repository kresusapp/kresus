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
    'can-encrypt',
    'force-demo-mode'
    // 'theme' // It should be a ghost setting! But our migration order doesn't
    // allow for this.
]);
