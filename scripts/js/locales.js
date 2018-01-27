/* eslint no-process-exit: 0 */
let path = require('path');
let fs = require('fs');

import { makeLogger } from '../../server/helpers';

const ROOT = path.join(path.dirname(fs.realpathSync(__filename)), '..', '..');

let log = makeLogger('compare-locales');

const localesDir = path.join(ROOT, 'shared', 'locales');

let localesMap = new Map;

fs.readdirSync(localesDir).forEach(child => {
    let file = path.join(localesDir, child);
    if (fs.statSync(file).isDirectory())
        return;
    if (file.indexOf('.json') === -1)
        return;
    let format = child.replace('.json', '');
    localesMap.set(format, require(file));
    log.info(`Found ${format} locale...`);
});

let cache = new Map;
function buildKeys(localeObject) {
    function _(obj, prefix) {
        let keys = [];
        for (let k in obj) {
            if (!obj.hasOwnProperty(k))
                continue;

            let val = obj[k];
            let newPrefix = `${prefix}.${k}`;
            if (typeof val === 'object') {
                let subkeys = _(val, newPrefix);
                keys = keys.concat(subkeys);
            } else {
                keys.push(newPrefix);
            }
        }
        return keys;
    }
    if (!cache.has(localeObject))
        cache.set(localeObject, _(localeObject, ''));
    return cache.get(localeObject);
}

let allKeys = new Set;
for (let locale of localesMap.values()) {
    let keys = buildKeys(locale);
    for (let k of keys) {
        allKeys.add(k);
    }
}

for (let [format, locale] of localesMap) {
    if (format === 'en')
        continue;

    let keys = new Set(buildKeys(locale));
    for (let k of allKeys) {
        if (!keys.has(k)) {
            log.warn(`Missing key in the ${format} locale: ${k}`);
        }
    }
}

let englishLocale = localesMap.get('en');
if (!englishLocale) {
    log.error('No english locale!?');
    process.exit(1);
}

let englishKeys = new Set(buildKeys(englishLocale));

let hasError = false;
for (let k of allKeys) {
    if (!englishKeys.has(k)) {
        log.error(`Missing key in the english locale: ${k}`);
        hasError = true;
    }
}

if (hasError)
    process.exit(1);

log.info('CompareLocale: OK.');
process.exit(0);
