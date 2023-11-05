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
const instance_1 = require("../../lib/instance");
const __1 = require("..");
const users_1 = __importDefault(require("./users"));
const helpers_1 = require("../../helpers");
const settings_1 = require("../../shared/settings");
const log = (0, helpers_1.makeLogger)('models/entities/settings');
let Setting = Setting_1 = class Setting {
    static repo() {
        if (Setting_1.REPO === null) {
            Setting_1.REPO = (0, __1.getRepository)(Setting_1);
        }
        return Setting_1.REPO;
    }
    // Doesn't insert anything in db, only creates a new instance and normalizes its fields.
    static cast(args) {
        return Setting_1.repo().create(args);
    }
    static async create(userId, attributes) {
        const entity = Setting_1.repo().create({ ...attributes, userId });
        return await Setting_1.repo().save(entity);
    }
    static async update(userId, settingId, fields) {
        await Setting_1.repo().update({ userId, id: settingId }, fields);
        return (0, helpers_1.unwrap)(await Setting_1.find(userId, settingId));
    }
    static async byKey(userId, key) {
        if (typeof key !== 'string') {
            log.warn('Setting.byKey misuse: key must be a string');
        }
        return await Setting_1.repo().findOne({ where: { userId, key } });
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
        return await Setting_1.repo().findOne({ where: { userId, id: settingId } });
    }
    static async destroy(userId, settingId) {
        await Setting_1.repo().delete({ userId, id: settingId });
    }
    static async destroyAll(userId) {
        await Setting_1.repo().delete({ userId });
    }
    // Returns a pair {key, value} or the preset default value if not found.
    static async findOrCreateDefault(userId, key) {
        if (!default_settings_1.default.has(key)) {
            throw new helpers_1.KError(`Setting ${key} has no default value!`);
        }
        const defaultValue = default_settings_1.default.get(key);
        (0, helpers_1.assert)(typeof defaultValue !== 'undefined', 'because of above check');
        return await Setting_1.findOrCreateByKey(userId, key, defaultValue);
    }
    // Returns a boolean value for a given key, or the preset default.
    static async findOrCreateDefaultBooleanValue(userId, key) {
        const pair = await Setting_1.findOrCreateDefault(userId, key);
        return pair.value === 'true';
    }
    static async getLocale(userId) {
        return (await Setting_1.findOrCreateDefault(userId, settings_1.LOCALE)).value;
    }
    static async all(userId) {
        const values = await Setting_1.repo().findBy({ userId });
        const keySet = new Set(values.map(v => v.key));
        for (const ghostKey of instance_1.ConfigGhostSettings.keys()) {
            (0, helpers_1.assert)(!keySet.has(ghostKey), `${ghostKey} shouldn't be saved into the database.`);
        }
        // Add a pair for the locale.
        if (!keySet.has(settings_1.LOCALE)) {
            const localeSetting = await Setting_1.findOrCreateDefault(userId, settings_1.LOCALE);
            values.push(localeSetting);
        }
        return values;
    }
};
Setting.REPO = null;
// Static methods
Setting.renamings = {
    name: 'key',
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Setting.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => users_1.default, { cascade: true, onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", users_1.default)
], Setting.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)('integer'),
    __metadata("design:type", Number)
], Setting.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar'),
    __metadata("design:type", String)
], Setting.prototype, "key", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar'),
    __metadata("design:type", String)
], Setting.prototype, "value", void 0);
Setting = Setting_1 = __decorate([
    (0, typeorm_1.Entity)('setting')
], Setting);
exports.default = Setting;
