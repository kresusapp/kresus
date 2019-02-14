import * as cozydb from 'cozydb';

import {
    assert,
    makeLogger,
    promisify,
    promisifyModel,
    KError,
    isEmailEnabled,
    checkWeboobMinimalVersion
} from '../helpers';

import DefaultSettings from '../shared/default-settings';
import { getVersion as getWeboobVersion } from '../lib/sources/weboob';
import { ConfigGhostSettings } from './static-data';

let log = makeLogger('models/settings');

// A simple key/value configuration pair.
let Setting = cozydb.getModel('kresusconfig', {
    name: String,
    value: String
});

Setting = promisifyModel(Setting);

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
    let config = await Setting.findOrCreateByName(userId, key, value);
    if (config.value === value) {
        return config;
    }
    return Setting.update(userId, config.id, { value });
};

// Returns a pair {name, value} or null if not found.
Setting.byName = async function byName(userId, name) {
    assert(userId === 0, 'Setting.byName first arg must be the userId.');

    if (typeof name !== 'string') {
        log.warn('Setting.byName misuse: name must be a string');
    }

    let founds = await request('byName', { key: name });
    if (founds && founds.length) {
        return founds[0];
    }

    return null;
};

// Returns a pair {name, value} or the default value if not found.
async function findOrCreateByName(userId, name, defaultValue) {
    assert(userId === 0, 'Setting.findOrCreateByName first arg must be the userId.');

    let found = await Setting.byName(userId, name);
    if (found === null) {
        let pair = {
            name,
            value: defaultValue
        };
        pair = await Setting.create(userId, pair);
        return pair;
    }
    return found;
}
Setting.findOrCreateByName = findOrCreateByName;

// Returns a pair {name, value} or the preset default value if not found.
async function findOrCreateDefault(userId, name) {
    assert(userId === 0, 'Setting.findOrCreateDefault first arg must be the userId.');

    if (!DefaultSettings.has(name)) {
        throw new KError(`Setting ${name} has no default value!`);
    }

    let defaultValue = DefaultSettings.get(name);
    return await findOrCreateByName(userId, name, defaultValue);
}
Setting.findOrCreateDefault = findOrCreateDefault;

// Returns a boolean value for a given key, or the preset default.
async function findOrCreateDefaultBooleanValue(userId, name) {
    let pair = await findOrCreateDefault(userId, name);
    return pair.value === 'true';
}
Setting.findOrCreateDefaultBooleanValue = findOrCreateDefaultBooleanValue;

Setting.getLocale = async function(userId) {
    return (await Setting.findOrCreateDefault(userId, 'locale')).value;
};

let oldAll = Setting.all.bind(Setting);

// Returns all the config name/value pairs, except for the ghost ones that are
// implied at runtime.
Setting.allWithoutGhost = async function(userId) {
    const values = await oldAll();

    let nameSet = new Set(values.map(v => v.name));
    for (let ghostName of ConfigGhostSettings.keys()) {
        assert(!nameSet.has(ghostName), `${ghostName} shouldn't be saved into the database.`);
    }

    // Add a pair for the locale.
    if (!nameSet.has('locale')) {
        values.push({
            name: 'locale',
            value: await Setting.getLocale(userId)
        });
    }

    return values;
};

// Returns all the config name/value pairs, including those which are generated
// at runtime.
Setting.all = async function(userId) {
    let values = await Setting.allWithoutGhost(userId);

    let version = await getWeboobVersion();
    values.push({
        name: 'weboob-version',
        value: version
    });

    // Add a pair to indicate weboob install status.
    let isWeboobInstalled = checkWeboobMinimalVersion(version);
    values.push({
        name: 'weboob-installed',
        value: isWeboobInstalled.toString()
    });

    // Indicates at which path Kresus is served.
    values.push({
        name: 'url-prefix',
        value: String(process.kresus.urlPrefix)
    });

    // Have emails been enabled by the administrator?
    values.push({
        name: 'emails-enabled',
        value: String(isEmailEnabled())
    });

    // Is encryption enabled on the server?
    values.push({
        name: 'can-encrypt',
        value: String(process.kresus.salt !== null)
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
