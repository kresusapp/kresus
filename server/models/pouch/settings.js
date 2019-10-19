import * as cozydb from 'cozydb';

import {
    assert,
    makeLogger,
    promisify,
    promisifyModel,
    KError,
    isEmailEnabled,
    checkWeboobMinimalVersion
} from '../../helpers';

import DefaultSettings from '../../shared/default-settings';
import { getVersion as getWeboobVersion } from '../../lib/sources/weboob';
import { ConfigGhostSettings } from '../../lib/ghost-settings';

let log = makeLogger('models/settings');

// A simple key/value configuration pair.
let Setting = cozydb.getModel('kresusconfig', {
    key: String,
    value: String,
    // Deprecated (renamed to key).
    name: String
});

Setting = promisifyModel(Setting);

Setting.renamings = {
    name: 'key'
};

let request = promisify(Setting.request.bind(Setting));

let olderCreate = Setting.create;
Setting.create = async function(userId, pair) {
    assert(userId === 0, 'Setting.create first arg must be the userId.');
    return await olderCreate(pair);
};

let olderUpdateAttributes = Setting.updateAttributes;
Setting.update = async function(userId, configId, fields) {
    assert(userId === 0, 'Setting.update first arg must be the userId.');
    return await olderUpdateAttributes(configId, fields);
};

Setting.updateAttributes = async function() {
    assert(false, 'Setting.updateAttributes is deprecated. Please use Setting.update');
};

Setting.updateByKey = async function(userId, key, value) {
    assert(userId === 0, 'Setting.updateByKey first arg must be the userId.');
    let config = await Setting.findOrCreateByKey(userId, key, value);
    if (config.value === value) {
        return config;
    }
    return Setting.update(userId, config.id, { value });
};

// Returns a pair {key, value} or null if not found.
Setting.byKey = async function byKey(userId, key) {
    assert(userId === 0, 'Setting.byKey first arg must be the userId.');

    if (typeof key !== 'string') {
        log.warn('Setting.byKey misuse: key must be a string');
    }

    let founds = await request('byKey', { key });
    if (founds && founds.length) {
        return founds[0];
    }

    return null;
};

// Returns a pair {key, value} or the default value if not found.
async function findOrCreateByKey(userId, key, defaultValue) {
    assert(userId === 0, 'Setting.findOrCreateByKey first arg must be the userId.');

    let found = await Setting.byKey(userId, key);
    if (found === null) {
        let pair = {
            key,
            value: defaultValue
        };
        pair = await Setting.create(userId, pair);
        return pair;
    }
    return found;
}
Setting.findOrCreateByKey = findOrCreateByKey;

// Returns a pair {key, value} or the preset default value if not found.
async function findOrCreateDefault(userId, key) {
    assert(userId === 0, 'Setting.findOrCreateDefault first arg must be the userId.');

    if (!DefaultSettings.has(key)) {
        throw new KError(`Setting ${key} has no default value!`);
    }

    let defaultValue = DefaultSettings.get(key);
    return await findOrCreateByKey(userId, key, defaultValue);
}
Setting.findOrCreateDefault = findOrCreateDefault;

// Returns a boolean value for a given key, or the preset default.
async function findOrCreateDefaultBooleanValue(userId, key) {
    let pair = await findOrCreateDefault(userId, key);
    return pair.value === 'true';
}
Setting.findOrCreateDefaultBooleanValue = findOrCreateDefaultBooleanValue;

Setting.getLocale = async function(userId) {
    return (await Setting.findOrCreateDefault(userId, 'locale')).value;
};

let oldAll = Setting.all.bind(Setting);

// Returns all the config key/value pairs, except for the ghost ones that are
// implied at runtime.
Setting.allWithoutGhost = async function(userId) {
    const values = await oldAll();

    let keySet = new Set(values.map(v => v.key));
    for (let ghostKey of ConfigGhostSettings.keys()) {
        assert(!keySet.has(ghostKey), `${ghostKey} shouldn't be saved into the database.`);
    }

    // Add a pair for the locale.
    if (!keySet.has('locale')) {
        const localeSetting = await Setting.findOrCreateDefault(userId, 'locale');
        values.push(localeSetting);
    }

    return values;
};

// Returns all the config key/value pairs, including those which are generated
// at runtime.
Setting.all = async function(userId) {
    let values = await Setting.allWithoutGhost(userId);

    let version = await getWeboobVersion();
    values.push({
        key: 'weboob-version',
        value: version
    });

    // Add a pair to indicate weboob install status.
    let isWeboobInstalled = checkWeboobMinimalVersion(version);
    values.push({
        key: 'weboob-installed',
        value: isWeboobInstalled.toString()
    });

    // Indicates at which path Kresus is served.
    values.push({
        key: 'url-prefix',
        value: String(process.kresus.urlPrefix)
    });

    // Have emails been enabled by the administrator?
    values.push({
        key: 'emails-enabled',
        value: String(isEmailEnabled())
    });

    // Is encryption enabled on the server?
    values.push({
        key: 'can-encrypt',
        value: String(process.kresus.salt !== null)
    });

    // Is the server set up for demo?
    values.push({
        key: 'force-demo-mode',
        value: String(!!process.kresus.forceDemoMode)
    });

    return values;
};

let olderDestroy = Setting.destroy;
Setting.destroy = async function(userId, configId) {
    assert(userId === 0, 'Setting.destroy first arg must be the userId.');
    return await olderDestroy(configId);
};

Setting.testing = {
    oldAll
};

module.exports = Setting;
