import { Model } from 'objection';

import { assert, KError, isEmailEnabled, checkWeboobMinimalVersion } from '../helpers';
import DefaultSettings from '../shared/default-settings';

import { getVersion as getWeboobVersion } from '../lib/sources/weboob';

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
    static get tableName() {
        return 'settings';
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: [],
            properties: {
                userId: { type: 'integer' },
                key: { type: 'string' },
                value: { type: 'string' }
            }
        };
    }
}

// Collection.
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
    static async allWithoutGhost(userId) {
        let values = await SettingModel.query().where({ userId });

        let keySet = new Set(values.map(v => v.key));
        for (let ghostName of GHOST_SETTINGS.keys()) {
            assert(!keySet.has(ghostName), `${ghostName} shouldn't be saved into the database.`);
        }

        // Add a pair for the locale.
        if (!keySet.has('locale')) {
            values.push({
                key: 'locale',
                value: await Settings.getLocale(userId)
            });
        }

        return values;
    }

    static async all(userId) {
        let values = await Settings.allWithoutGhost(userId);

        let version = await getWeboobVersion();
        values.push({
            key: 'weboob-version',
            value: version.toString()
        });

        // Add a pair to indicate weboob install status.
        let isWeboobInstalled = checkWeboobMinimalVersion(version);
        values.push({
            key: 'weboob-installed',
            value: isWeboobInstalled.toString()
        });

        // Indicates at which server path Kresus is served.
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
    static async upsert(userId, key, value) {
        assert(!GHOST_SETTINGS.has(key), "ghost setting shouldn't be saved into the database.");
        let pair = await SettingModel.query().where({ key, userId });
        if (pair.length) {
            if (pair[0].value === `${value}`) {
                return;
            }
            await SettingModel.query()
                .patch({ value })
                .where({ key, userId });
        } else {
            await SettingModel.query().insert({ key, value, userId });
        }
    }

    /**
     * @return Value associated to the given key; if it's not found, it will be
     * created with the value `pDefaultValue`. The default value will be the one
     * passed if it's not null, otherwise it will be taken from the
     * DefaultSettings map.
     */
    static async getOrCreate(userId, key, pDefaultValue) {
        assert(!GHOST_SETTINGS.has(key), "ghost setting shouldn't be saved into the database.");

        let defaultValue;
        if (pDefaultValue === null || typeof pDefaultValue === 'undefined') {
            if (!DefaultSettings.has(key)) {
                throw new KError(`Setting ${key} has no default value!`);
            }
            defaultValue = DefaultSettings.get(key);
        } else {
            defaultValue = pDefaultValue;
        }

        let pair = await SettingModel.query().where({ key, userId });

        if (pair.length) {
            return pair[0].value;
        }

        // Only insert the default value if it's not the one from the default
        // settings map.
        await SettingModel.query().insert({ userId, key, value: defaultValue });
        return defaultValue;
    }

    /**
     * @return Boolean value associated to the given `key`.
     */
    static async getOrCreateBool(userId, key) {
        let value = await Settings.getOrCreate(userId, key);
        return value === 'true';
    }

    /**
     * @return Value of the locale (e.g. 'en-en', 'fr-ca', etc.).
     */
    static async getLocale(userId) {
        return await Settings.getOrCreate(userId, 'locale');
    }
}
