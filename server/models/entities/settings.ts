import {
    getRepository,
    Entity,
    PrimaryGeneratedColumn,
    Column,
    JoinColumn,
    ManyToOne,
    Repository
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

const log = makeLogger('models/entities/settings');

@Entity()
export default class Setting {
    @PrimaryGeneratedColumn()
    id;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @ManyToOne(type => User, { cascade: true, onDelete: 'CASCADE' })
    @JoinColumn()
    user;

    @Column('integer')
    userId;

    @Column('varchar')
    key;

    @Column('varchar')
    value;

    // Static methods

    static renamings = {
        name: 'key'
    };

    static async create(userId, attributes) {
        const entity = repo().create({ userId, ...attributes });
        return await repo().save(entity);
    }

    static async update(userId, settingId, fields) {
        await repo().update({ userId, id: settingId }, fields);
        return await Setting.find(userId, settingId);
    }

    static async byKey(userId, key): Promise<Setting | void> {
        if (typeof key !== 'string') {
            log.warn('Setting.byKey misuse: key must be a string');
        }
        return await repo().findOne({ where: { userId, key } });
    }

    // TODO Rejigger all these methods.

    // Returns a pair {key, value} or the default value if not found.
    static async findOrCreateByKey(userId, key, defaultValue): Promise<Setting> {
        const found = await Setting.byKey(userId, key);
        if (found) {
            return found;
        }
        return await Setting.create(userId, { key, value: defaultValue });
    }

    static async updateByKey(userId, key, value) {
        const newValue = `${value}`;
        const setting = await Setting.findOrCreateByKey(userId, key, newValue);
        if (setting.value === newValue) {
            return setting;
        }
        return await Setting.update(userId, setting.id, { value: newValue });
    }

    static async find(userId, settingId) {
        return await repo().findOne({ where: { userId, id: settingId } });
    }

    static async destroy(userId, settingId) {
        return await repo().delete({ userId, id: settingId });
    }

    static async destroyAll(userId) {
        return await repo().delete({ userId });
    }

    // Returns a pair {key, value} or the preset default value if not found.
    static async findOrCreateDefault(userId, key) {
        if (!DefaultSettings.has(key)) {
            throw new KError(`Setting ${key} has no default value!`);
        }
        const defaultValue = DefaultSettings.get(key);
        return await Setting.findOrCreateByKey(userId, key, defaultValue);
    }

    // Returns a boolean value for a given key, or the preset default.
    static async findOrCreateDefaultBooleanValue(userId, key) {
        const pair = await Setting.findOrCreateDefault(userId, key);
        return pair.value === 'true';
    }

    static async getLocale(userId) {
        return (await Setting.findOrCreateDefault(userId, 'locale')).value;
    }

    // Returns all the config key/value pairs, except for the ghost ones that are
    // implied at runtime.
    static async allWithoutGhost(userId) {
        const values = await repo().find({ userId });
        const keySet = new Set(values.map(v => v.key));
        for (const ghostKey of ConfigGhostSettings.keys()) {
            assert(!keySet.has(ghostKey), `${ghostKey} shouldn't be saved into the database.`);
        }
        // Add a pair for the locale.
        if (!keySet.has('locale')) {
            const localeSetting = await Setting.findOrCreateDefault(userId, 'locale');
            values.push(localeSetting);
        }
        return values;
    }

    // Returns all the config key/value pairs, including those which are generated
    // at runtime.
    static async all(userId) {
        const values = await Setting.allWithoutGhost(userId);

        const version = await getWeboobVersion();
        values.push({
            key: 'weboob-version',
            value: version
        });

        // Add a pair to indicate weboob install status.
        const isWeboobInstalled = checkWeboobMinimalVersion(version);
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
    }
}

let REPO: Repository<Setting> | null = null;
function repo(): Repository<Setting> {
    if (REPO === null) {
        REPO = getRepository(Setting);
    }
    return REPO;
}
