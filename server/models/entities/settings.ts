import {
    getRepository,
    Entity,
    PrimaryGeneratedColumn,
    Column,
    JoinColumn,
    ManyToOne,
    Repository,
} from 'typeorm';

import DefaultSettings from '../../shared/default-settings';
import { getVersion as getWeboobVersion } from '../../providers/weboob';
import { ConfigGhostSettings } from '../../lib/ghost-settings';

import User from './users';

import {
    assert,
    makeLogger,
    isEmailEnabled,
    isAppriseApiEnabled,
    checkWeboobMinimalVersion,
    KError,
    unwrap,
} from '../../helpers';
import { UNKNOWN_WEBOOB_VERSION } from '../../shared/helpers';

const log = makeLogger('models/entities/settings');

@Entity('setting')
export default class Setting {
    @PrimaryGeneratedColumn()
    id!: number;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @ManyToOne(type => User, { cascade: true, onDelete: 'CASCADE' })
    @JoinColumn()
    user!: User;

    @Column('integer')
    userId!: number;

    @Column('varchar')
    key!: string;

    @Column('varchar')
    value!: string;

    // Static methods

    static renamings = {
        name: 'key',
    };

    // Doesn't insert anything in db, only creates a new instance and normalizes its fields.
    static cast(args: Partial<Setting>): Setting {
        return repo().create(args);
    }

    static async create(userId: number, attributes: Partial<Setting>): Promise<Setting> {
        const entity = repo().create({ userId, ...attributes });
        return await repo().save(entity);
    }

    static async update(
        userId: number,
        settingId: number,
        fields: Partial<Setting>
    ): Promise<Setting> {
        await repo().update({ userId, id: settingId }, fields);
        return unwrap(await Setting.find(userId, settingId));
    }

    static async byKey(userId: number, key: string): Promise<Setting | void> {
        if (typeof key !== 'string') {
            log.warn('Setting.byKey misuse: key must be a string');
        }
        return await repo().findOne({ where: { userId, key } });
    }

    // TODO Rejigger all these methods.

    // Returns a pair {key, value} or the default value if not found.
    static async findOrCreateByKey(
        userId: number,
        key: string,
        defaultValue: string
    ): Promise<Setting> {
        const found = await Setting.byKey(userId, key);
        if (found) {
            return found;
        }
        return await Setting.create(userId, { key, value: defaultValue });
    }

    static async updateByKey(userId: number, key: string, value: string): Promise<Setting> {
        const newValue = `${value}`;
        const setting = await Setting.findOrCreateByKey(userId, key, newValue);
        if (setting.value === newValue) {
            return setting;
        }
        return await Setting.update(userId, setting.id, { value: newValue });
    }

    static async find(userId: number, settingId: number): Promise<Setting | undefined> {
        return await repo().findOne({ where: { userId, id: settingId } });
    }

    static async destroy(userId: number, settingId: number): Promise<void> {
        await repo().delete({ userId, id: settingId });
    }

    static async destroyAll(userId: number): Promise<void> {
        await repo().delete({ userId });
    }

    // Returns a pair {key, value} or the preset default value if not found.
    static async findOrCreateDefault(userId: number, key: string): Promise<Setting> {
        if (!DefaultSettings.has(key)) {
            throw new KError(`Setting ${key} has no default value!`);
        }
        const defaultValue = DefaultSettings.get(key);
        return await Setting.findOrCreateByKey(userId, key, defaultValue);
    }

    // Returns a boolean value for a given key, or the preset default.
    static async findOrCreateDefaultBooleanValue(userId: number, key: string): Promise<boolean> {
        const pair = await Setting.findOrCreateDefault(userId, key);
        return pair.value === 'true';
    }

    static async getLocale(userId: number): Promise<string> {
        return (await Setting.findOrCreateDefault(userId, 'locale')).value;
    }

    // Returns all the config key/value pairs, except for the ghost ones that are
    // implied at runtime.
    static async allWithoutGhost(userId: number): Promise<Setting[]> {
        const values: Setting[] = await repo().find({ userId });
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
    static async all(userId: number): Promise<Setting[]> {
        const values = await Setting.allWithoutGhost(userId);

        const version = await getWeboobVersion();

        // Only transmit the version is it known.
        if (version !== UNKNOWN_WEBOOB_VERSION) {
            values.push(Setting.cast({ key: 'weboob-version', value: `${version}` }));
        }

        // Add a pair to indicate weboob install status.
        const isWeboobInstalled = checkWeboobMinimalVersion(version);
        values.push(Setting.cast({ key: 'weboob-installed', value: isWeboobInstalled.toString() }));

        // Indicates at which path Kresus is served.
        values.push(Setting.cast({ key: 'url-prefix', value: String(process.kresus.urlPrefix) }));

        // Have emails been enabled by the administrator?
        values.push(Setting.cast({ key: 'emails-enabled', value: String(isEmailEnabled()) }));

        // Have notifications been enabled by the administrator?
        values.push(
            Setting.cast({ key: 'notifications-enabled', value: String(isAppriseApiEnabled()) })
        );

        // Is encryption enabled on the server?
        values.push(
            Setting.cast({ key: 'can-encrypt', value: String(process.kresus.salt !== null) })
        );

        // Is the server set up for demo?
        values.push(
            Setting.cast({ key: 'force-demo-mode', value: String(!!process.kresus.forceDemoMode) })
        );

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
