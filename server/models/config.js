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

let log = makeLogger('models/config');

// A simple key/value configuration pair.
let Config = cozydb.getModel('kresusconfig', {
    name: String,
    value: String
});

Config = promisifyModel(Config);

let request = promisify(Config.request.bind(Config));

let olderCreate = Config.create;
Config.create = async function(userId, pair) {
    assert(userId === 0, 'Config.create first arg must be the userId.');
    return await olderCreate(pair);
};

// Returns a pair {name, value} or null if not found.
Config.byName = async function byName(userId, name) {
    assert(userId === 0, 'Config.byName first arg must be the userId.');

    if (typeof name !== 'string') {
        log.warn('Config.byName misuse: name must be a string');
    }

    let founds = await request('byName', { key: name });
    if (founds && founds.length) {
        return founds[0];
    }

    return null;
};

// Returns a pair {name, value} or the default value if not found.
async function findOrCreateByName(userId, name, defaultValue) {
    assert(userId === 0, 'Config.findOrCreateByName first arg must be the userId.');

    let found = await Config.byName(userId, name);
    if (found === null) {
        let pair = {
            name,
            value: defaultValue
        };
        pair = await Config.create(userId, pair);
        return pair;
    }
    return found;
}
Config.findOrCreateByName = findOrCreateByName;

// Returns a pair {name, value} or the preset default value if not found.
async function findOrCreateDefault(userId, name) {
    assert(userId === 0, 'Config.findOrCreateDefault first arg must be the userId.');

    if (!DefaultSettings.has(name)) {
        throw new KError(`Setting ${name} has no default value!`);
    }

    let defaultValue = DefaultSettings.get(name);
    return await findOrCreateByName(userId, name, defaultValue);
}
Config.findOrCreateDefault = findOrCreateDefault;

// Returns a boolean value for a given key, or the preset default.
async function findOrCreateDefaultBooleanValue(userId, name) {
    let pair = await findOrCreateDefault(userId, name);
    return pair.value === 'true';
}
Config.findOrCreateDefaultBooleanValue = findOrCreateDefaultBooleanValue;

Config.getLocale = async function(userId) {
    return (await Config.findOrCreateDefault(userId, 'locale')).value;
};

let oldAll = Config.all.bind(Config);

// A list of all the settings that are implied at runtime and should not be
// saved into the database.
// *Never* ever remove a name from this list, since these are used also to
// know which settings shouldn't be imported or exported.
Config.ghostSettings = new Set([
    'weboob-version',
    'weboob-installed',
    'standalone-mode',
    'url-prefix',
    'emails-enabled'
]);

// Returns all the config name/value pairs, except for the ghost ones that are
// implied at runtime.
Config.allWithoutGhost = async function(userId) {
    const values = await oldAll();

    let nameSet = new Set(values.map(v => v.name));
    for (let ghostName of Config.ghostSettings.keys()) {
        assert(!nameSet.has(ghostName), `${ghostName} shouldn't be saved into the database.`);
    }

    // Add a pair for the locale.
    if (!nameSet.has('locale')) {
        values.push({
            name: 'locale',
            value: await Config.getLocale(userId)
        });
    }

    return values;
};

// Returns all the config name/value pairs, including those which are generated
// at runtime.
Config.all = async function(userId) {
    let values = await Config.allWithoutGhost(userId);

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

    return values;
};

module.exports = Config;
