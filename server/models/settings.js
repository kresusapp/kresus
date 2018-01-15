import { Model } from 'objection';

import { assert, KError, isEmailEnabled, checkWeboobMinimalVersion } from '../helpers';
import DefaultSettings from '../shared/default-settings';

import { getVersion as getWeboobVersion } from '../../lib/sources/weboob';

// A list of all the settings that are implied at runtime and should not be
// saved into the database. *Never* ever remove a name from this list, since
// these are used also to know which settings shouldn't be imported or
// exported.
const GHOST_SETTINGS = new Set([
    'weboob-version',
    'weboob-installed',
    'standalone-mode',
    'url-prefix',
    'emails-enabled'
]);

// Model.
class SettingModel extends Model {
    static tableName = 'settings';

    static get jsonSchema() {
        return {
            type: 'object',
            required: [],
            properties: {
                key: { type: 'string' },
                value: { type: 'string' }
            }
        };
    }
}

// Controller.
export default class Settings {
    /**
     * @return a Set of all the keys of "ghost settings" (i.e. those which
     * shouldn't ever be saved into the database).
     */
    static ghostSettings() {
        return GHOST_SETTINGS;
    }

    /**
     * @return all the setting pairs as [ { key, value } ].
     */
    static async allWithoutGhost() {
        let values = await SettingModel.query();

        let keySet = new Set(values.map(v => v.key));
        for (let ghostName of GHOST_SETTINGS.keys()) {
            assert(!keySet.has(ghostName), `${ghostName} shouldn't be saved into the database.`);
        }

        // Add a pair for the locale.
        if (!keySet.has('locale')) {
            values.push({
                key: 'locale',
                value: await Settings.getLocale()
            });
        }

        return values;
    }

    static async all() {
        let values = Settings.allWithoutGhost();

        // Add a pair to indicate weboob install status.
        let version = await getWeboobVersion();
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

        return values;
    }

    /**
     * Inserts or update the pair keyed by `key` to the value `value`.
     */
    static async upsert(key, value) {
        assert(!GHOST_SETTINGS.has(key), "ghost setting shouldn't be saved into the database.");
        let pair = await SettingModel.query().where('key', '=', key);
        if (pair.length) {
            await SettingModel.query()
                .patch({ value })
                .where('key', '=', key);
        } else {
            await SettingModel.query().insert({ key, value });
        }
    }

    /**
     * @return Value associated to the given key (if it's not found, it will be
     * created with the value `defaultVal`).
     */
    static async getOrCreate(key, defaultVal = null) {
        assert(!GHOST_SETTINGS.has(key), "ghost setting shouldn't be saved into the database.");

        let defaultValue = defaultVal;
        if (defaultValue === null) {
            if (!DefaultSettings.has(key)) {
                throw new KError(`Setting ${key} has no default value!`);
            }
            defaultValue = DefaultSettings.get(key);
        }

        let pair = await SettingModel.query().where('key', '=', key);

        if (pair.length) {
            return pair[0].value;
        }

        await SettingModel.query().insert({ key, value: defaultVal });
        return defaultVal;
    }

    /**
     * @return Boolean value associated to the given `key`.
     */
    static async getOrCreateBool(key) {
        let value = await Settings.getOrCreate(key);
        return value === 'true';
    }

    /**
     * @return Value of the locale (e.g. 'en-en', 'fr-ca', etc.).
     */
    static async getLocale() {
        return await Settings.getOrCreate('locale');
    }
}
