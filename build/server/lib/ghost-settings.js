"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ConfigGhostSettings = void 0;
// A list of all the settings that are implied at runtime and should not be
// saved into the database.
// *Never* ever remove a name from this list, since these are used also to
// know which settings shouldn't be imported or exported.
const ConfigGhostSettings = new Set(['weboob-version', 'weboob-installed', 'standalone-mode', 'url-prefix', 'emails-enabled', 'can-encrypt', 'force-demo-mode', 'theme']);
exports.ConfigGhostSettings = ConfigGhostSettings;