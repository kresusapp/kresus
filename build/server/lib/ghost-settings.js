"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// A list of all the settings that are implied at runtime and should not be
// saved into the database.
// *Never* ever remove a name from this list, since these are used also to
// know which settings shouldn't be imported or exported.
exports.ConfigGhostSettings = new Set([
    'weboob-version',
    'weboob-installed',
    'standalone-mode',
    'url-prefix',
    'emails-enabled',
    'notifications-enabled',
    'can-encrypt',
    'force-demo-mode'
]);
