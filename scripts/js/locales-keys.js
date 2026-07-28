// Flattens a nested locale object into an array of dot-separated keys.
//
// Note: the returned keys carry a leading dot (the recursion is seeded with an
// empty prefix), e.g. `.client.menu.reports`. Callers that compare against
// source keys should strip it with `.slice(1)`.
//
// Shared between `locales.js` (missing-key check) and `unused-locales.js`
// (unused-key check) so the two stay in sync.

let cache = new Map();

function buildKeys(localeObject) {
    function _(obj, prefix) {
        let keys = [];
        for (let k in obj) {
            if (!obj.hasOwnProperty(k)) continue;

            let val = obj[k];
            let newPrefix = `${prefix}.${k}`;
            if (typeof val === 'object') {
                keys = keys.concat(_(val, newPrefix));
            } else {
                keys.push(newPrefix);
            }
        }
        return keys;
    }
    if (!cache.has(localeObject)) cache.set(localeObject, _(localeObject, ''));
    return cache.get(localeObject);
}

module.exports = { buildKeys };
