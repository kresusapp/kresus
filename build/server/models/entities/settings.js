"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var Setting_1;
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const default_settings_1 = __importDefault(require("../../shared/default-settings"));
const weboob_1 = require("../../providers/weboob");
const ghost_settings_1 = require("../../lib/ghost-settings");
const users_1 = __importDefault(require("./users"));
const helpers_1 = require("../../helpers");
const helpers_2 = require("../../shared/helpers");
const log = helpers_1.makeLogger('models/entities/settings');
let Setting = Setting_1 = class Setting {
    // Doesn't insert anything in db, only creates a new instance and normalizes its fields.
    static cast(args) {
        return repo().create(args);
    }
    static async create(userId, attributes) {
        const entity = repo().create({ userId, ...attributes });
        return await repo().save(entity);
    }
    static async update(userId, settingId, fields) {
        await repo().update({ userId, id: settingId }, fields);
        return helpers_1.unwrap(await Setting_1.find(userId, settingId));
    }
    static async byKey(userId, key) {
        if (typeof key !== 'string') {
            log.warn('Setting.byKey misuse: key must be a string');
        }
        return await repo().findOne({ where: { userId, key } });
    }
    // TODO Rejigger all these methods.
    // Returns a pair {key, value} or the default value if not found.
    static async findOrCreateByKey(userId, key, defaultValue) {
        const found = await Setting_1.byKey(userId, key);
        if (found) {
            return found;
        }
        return await Setting_1.create(userId, { key, value: defaultValue });
    }
    static async updateByKey(userId, key, value) {
        const newValue = `${value}`;
        const setting = await Setting_1.findOrCreateByKey(userId, key, newValue);
        if (setting.value === newValue) {
            return setting;
        }
        return await Setting_1.update(userId, setting.id, { value: newValue });
    }
    static async find(userId, settingId) {
        return await repo().findOne({ where: { userId, id: settingId } });
    }
    static async destroy(userId, settingId) {
        await repo().delete({ userId, id: settingId });
    }
    static async destroyAll(userId) {
        await repo().delete({ userId });
    }
    // Returns a pair {key, value} or the preset default value if not found.
    static async findOrCreateDefault(userId, key) {
        if (!default_settings_1.default.has(key)) {
            throw new helpers_1.KError(`Setting ${key} has no default value!`);
        }
        const defaultValue = default_settings_1.default.get(key);
        return await Setting_1.findOrCreateByKey(userId, key, defaultValue);
    }
    // Returns a boolean value for a given key, or the preset default.
    static async findOrCreateDefaultBooleanValue(userId, key) {
        const pair = await Setting_1.findOrCreateDefault(userId, key);
        return pair.value === 'true';
    }
    static async getLocale(userId) {
        return (await Setting_1.findOrCreateDefault(userId, 'locale')).value;
    }
    // Returns all the config key/value pairs, except for the ghost ones that are
    // implied at runtime.
    static async allWithoutGhost(userId) {
        const values = await repo().find({ userId });
        const keySet = new Set(values.map(v => v.key));
        for (const ghostKey of ghost_settings_1.ConfigGhostSettings.keys()) {
            helpers_1.assert(!keySet.has(ghostKey), `${ghostKey} shouldn't be saved into the database.`);
        }
        // Add a pair for the locale.
        if (!keySet.has('locale')) {
            const localeSetting = await Setting_1.findOrCreateDefault(userId, 'locale');
            values.push(localeSetting);
        }
        return values;
    }
    // Returns all the config key/value pairs, including those which are generated
    // at runtime.
    static async all(userId) {
        const values = await Setting_1.allWithoutGhost(userId);
        const version = await weboob_1.getVersion();
        // Only transmit the version is it known.
        if (version !== helpers_2.UNKNOWN_WEBOOB_VERSION) {
            values.push(Setting_1.cast({ key: 'weboob-version', value: `${version}` }));
        }
        // Add a pair to indicate weboob install status.
        const isWeboobInstalled = helpers_1.checkWeboobMinimalVersion(version);
        values.push(Setting_1.cast({ key: 'weboob-installed', value: isWeboobInstalled.toString() }));
        // Indicates at which path Kresus is served.
        values.push(Setting_1.cast({ key: 'url-prefix', value: String(process.kresus.urlPrefix) }));
        // Have emails been enabled by the administrator?
        values.push(Setting_1.cast({ key: 'emails-enabled', value: String(helpers_1.isEmailEnabled()) }));
        // Have notifications been enabled by the administrator?
        values.push(Setting_1.cast({ key: 'notifications-enabled', value: String(helpers_1.isAppriseApiEnabled()) }));
        // Is encryption enabled on the server?
        values.push(Setting_1.cast({ key: 'can-encrypt', value: String(process.kresus.salt !== null) }));
        // Is the server set up for demo?
        values.push(Setting_1.cast({ key: 'force-demo-mode', value: String(!!process.kresus.forceDemoMode) }));
        return values;
    }
};
// Static methods
Setting.renamings = {
    name: 'key'
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Object)
], Setting.prototype, "id", void 0);
__decorate([
    typeorm_1.ManyToOne(type => users_1.default, { cascade: true, onDelete: 'CASCADE' }),
    typeorm_1.JoinColumn(),
    __metadata("design:type", Object)
], Setting.prototype, "user", void 0);
__decorate([
    typeorm_1.Column('integer'),
    __metadata("design:type", Object)
], Setting.prototype, "userId", void 0);
__decorate([
    typeorm_1.Column('varchar'),
    __metadata("design:type", Object)
], Setting.prototype, "key", void 0);
__decorate([
    typeorm_1.Column('varchar'),
    __metadata("design:type", Object)
], Setting.prototype, "value", void 0);
Setting = Setting_1 = __decorate([
    typeorm_1.Entity('setting')
], Setting);
exports.default = Setting;
let REPO = null;
function repo() {
    if (REPO === null) {
        REPO = typeorm_1.getRepository(Setting);
    }
    return REPO;
}
