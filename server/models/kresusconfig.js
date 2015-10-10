let log = require('printit')({
    prefix: 'models/config',
    date: true
});

import * as americano from 'cozydb';
import {promisify, promisifyModel} from '../helpers';
import {TestInstall} from '../lib/sources/weboob';

let Config = americano.getModel('kresusconfig', {
    name: String,
    value: String
});

Config = promisifyModel(Config);

let request = promisify(::Config.request);

Config.byName = async function byName(name) {
    if (typeof name !== 'string')
        log.warn("Config.byName API misuse: name isn't a string");
    let founds = await request('byName', {key: name});
    if (founds && founds.length)
        return founds[0];
    return null;
}

Config.findOrCreateByName = async function findOrCreateByName(name, defaultValue) {
    let found = await request('byName', {key: name});
    if (!found || !found.length) {
        let pair = {
            name,
            value: defaultValue
        }
        pair = await Config.create(pair);
        return pair;
    }
    return found[0];
}

let oldAll = ::Config.all;
Config.all = async function() {
    let values = await oldAll();

    // Manually add a pair to indicate weboob install status
    let pair = {
        name: 'weboob-installed',
        value: await TestInstall()
    }

    values.push(pair);
    return values;
}

export default Config;
