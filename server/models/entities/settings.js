import {
    getRepository,
    Entity,
    PrimaryGeneratedColumn,
    Column,
    JoinColumn,
    ManyToOne
} from 'typeorm';

import DefaultSettings from '../../shared/default-settings';
import { getVersion as getWeboobVersion } from '../../lib/sources/weboob';
import { ConfigGhostSettings } from '../../lib/ghost-settings';

import User from './users';

import {
    assert,
    makeLogger,
    isEmailEnabled,
    checkWeboobMinimalVersion,
    KError
} from '../../helpers';

let log = makeLogger('models/entities/settings');

@Entity()
export default class Setting {
    @PrimaryGeneratedColumn()
    id;

    // eslint-disable-next-line no-unused-vars
    @ManyToOne(type => User, { cascade: true, onDelete: 'CASCADE' })
    @JoinColumn()
    user;

    @Column('integer')
    userId;

    @Column('varchar')
    key;

    @Column('varchar')
    value;
}

let REPO = null;
function repo() {
    if (REPO === null) {
        REPO = getRepository(Setting);
    }
    return REPO;
}

Setting.renamings = {
    name: 'key'
};

Setting.create = async function(userId, attributes) {
    let entity = repo().create({ userId, ...attributes });
    return await repo().save(entity);
};

Setting.update = async function(userId, settingId, fields) {
    await repo().update({ userId, id: settingId }, fields);
    return await Setting.find(userId, settingId);
};

Setting.byKey = async function(userId, key) {
    if (typeof key !== 'string') {
        log.warn('Setting.byKey misuse: key must be a string');
    }
    return await repo().findOne({ where: { userId, key } });
};

// TODO Rejigger all these methods.

// Returns a pair {key, value} or the default value if not found.
Setting.findOrCreateByKey = async function(userId, key, defaultValue) {
    let found = await Setting.byKey(userId, key);
    if (found) {
        return found;
    }
    return await Setting.create(userId, { key, value: defaultValue });
};

Setting.updateByKey = async function(userId, key, value) {
    let newValue = `${value}`;
    let setting = await Setting.findOrCreateByKey(userId, key, newValue);
    if (setting.value === newValue) {
        return setting;
    }
    return await Setting.update(userId, setting.id, { value: newValue });
};

Setting.find = async function(userId, settingId) {
    return await repo().findOne({ where: { userId, id: settingId } });
};

Setting.destroy = async function(userId, settingId) {
    return await repo().delete({ userId, id: settingId });
};

// Returns a pair {key, value} or the preset default value if not found.
Setting.findOrCreateDefault = async function(userId, key) {
    if (!DefaultSettings.has(key)) {
        throw new KError(`Setting ${key} has no default value!`);
    }
    let defaultValue = DefaultSettings.get(key);
    return await Setting.findOrCreateByKey(userId, key, defaultValue);
};

// Returns a boolean value for a given key, or the preset default.
Setting.findOrCreateDefaultBooleanValue = async function(userId, key) {
    let pair = await Setting.findOrCreateDefault(userId, key);
    return pair.value === 'true';
};

Setting.getLocale = async function(userId) {
    return (await Setting.findOrCreateDefault(userId, 'locale')).value;
};

// Returns all the config key/value pairs, except for the ghost ones that are
// implied at runtime.
Setting.allWithoutGhost = async function(userId) {
    const values = await repo().find({ userId });
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
