import * as americano from 'cozydb';

import { makeLogger, promisify, promisifyModel, KError } from '../helpers';
import { testInstall } from '../lib/sources/weboob';

import DefaultSettings from '../shared/default-settings';

let log = makeLogger('models/config');

let Config = americano.getModel('kresusconfig', {
    name: String,
    value: String
});

Config = promisifyModel(Config);

let request = promisify(::Config.request);

// Returns a pair {name, value}
Config.byName = async function byName(name) {
    if (typeof name !== 'string')
        log.warn('Config.byName misuse: name must be a string');
    let founds = await request('byName', { key: name });
    if (founds && founds.length)
        return founds[0];
    return null;
};

// Returns a pair {name, value}
async function findOrCreateByName(name, defaultValue) {
    let found = await request('byName', { key: name });
    if (!found || !found.length) {
        let pair = {
            name,
            value: defaultValue
        };
        pair = await Config.create(pair);
        return pair;
    }
    return found[0];
}
Config.findOrCreateByName = findOrCreateByName;

// Returns a pair {name, value}
async function findOrCreateDefault(name) {
    if (!DefaultSettings.has(name))
        throw new KError(`Setting ${name} has no default value!`);
    let defaultValue = DefaultSettings.get(name);
    return await findOrCreateByName(name, defaultValue);
}
Config.findOrCreateDefault = findOrCreateDefault;

// Returns the boolean value
async function findOrCreateDefaultBooleanValue(name) {
    let pair = await findOrCreateDefault(name);
    return pair.value === 'true';
}
Config.findOrCreateDefaultBooleanValue = findOrCreateDefaultBooleanValue;

let oldAll = ::Config.all;
Config.all = async function() {
    let values = await oldAll();

    // Manually add a pair to indicate weboob install status
    let pair = {
        name: 'weboob-installed',
        value: (await testInstall()).toString()
    };

    values.push(pair);
    return values;
};

module.exports = Config;
