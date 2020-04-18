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
var Access_1;
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const users_1 = __importDefault(require("./users"));
const access_fields_1 = __importDefault(require("./access-fields"));
const helpers_1 = require("../../helpers");
const bank_vendors_1 = require("../../lib/bank-vendors");
let Access = Access_1 = class Access {
    constructor() {
        this.password = null;
        // Text status indicating whether the last poll was successful or not.
        this.fetchStatus = helpers_1.FETCH_STATUS_SUCCESS;
        // Text label set by the user.
        this.customLabel = null;
        // A JSON-serialized session's content.
        this.session = null;
    }
    // Entity methods.
    hasPassword() {
        return typeof this.password === 'string' && this.password.length > 0;
    }
    // Is the access enabled?
    isEnabled() {
        return this.password !== null;
    }
    // Returns a cleaned up label for this access.
    getLabel() {
        if (this.customLabel) {
            return this.customLabel;
        }
        return bank_vendors_1.bankVendorByUuid(this.vendorId).name;
    }
    // Can the access be polled?
    canBePolled() {
        return (this.isEnabled() &&
            this.fetchStatus !== 'INVALID_PASSWORD' &&
            this.fetchStatus !== 'EXPIRED_PASSWORD' &&
            this.fetchStatus !== 'INVALID_PARAMETERS' &&
            this.fetchStatus !== 'NO_PASSWORD' &&
            this.fetchStatus !== 'ACTION_NEEDED' &&
            this.fetchStatus !== 'AUTH_METHOD_NYI' &&
            this.fetchStatus !== 'REQUIRES_INTERACTIVE');
    }
    // Doesn't insert anything in db, only creates a new instance and normalizes its fields.
    static cast(args) {
        return repo().create(args);
    }
    static async create(userId, { fields = [], ...other }) {
        const fieldsWithUserId = fields.map(field => ({
            userId,
            ...field
        }));
        const entity = repo().create({ userId, ...other, fields: fieldsWithUserId });
        const access = await repo().save(entity);
        return access;
    }
    static async find(userId, accessId) {
        return await repo().findOne({ where: { userId, id: accessId }, relations: ['fields'] });
    }
    static async all(userId) {
        return await repo().find({ where: { userId }, relations: ['fields'] });
    }
    static async exists(userId, accessId) {
        const found = await repo().findOne({ where: { userId, id: accessId } });
        return !!found;
    }
    static async destroy(userId, accessId) {
        await repo().delete({ userId, id: accessId });
    }
    static async destroyAll(userId) {
        await repo().delete({ userId });
    }
    static async update(userId, accessId, newAttributes) {
        if (typeof newAttributes.fields !== 'undefined') {
            throw new Error('API error: use AccessField model instead!');
        }
        await repo().update({ userId, id: accessId }, newAttributes);
        return helpers_1.unwrap(await Access_1.find(userId, accessId));
    }
    static async byVendorId(userId, { uuid: vendorId }) {
        return await repo().find({ where: { userId, vendorId }, relations: ['fields'] });
    }
};
// Static attributes.
Access.renamings = {
    bank: 'vendorId'
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Access.prototype, "id", void 0);
__decorate([
    typeorm_1.ManyToOne(type => users_1.default, { cascade: true, onDelete: 'CASCADE', nullable: false }),
    typeorm_1.JoinColumn(),
    __metadata("design:type", users_1.default)
], Access.prototype, "user", void 0);
__decorate([
    typeorm_1.Column('integer'),
    __metadata("design:type", Number)
], Access.prototype, "userId", void 0);
__decorate([
    typeorm_1.Column('varchar'),
    __metadata("design:type", String)
], Access.prototype, "vendorId", void 0);
__decorate([
    typeorm_1.Column('varchar'),
    __metadata("design:type", String)
], Access.prototype, "login", void 0);
__decorate([
    typeorm_1.Column('varchar', { nullable: true, default: null }),
    __metadata("design:type", Object)
], Access.prototype, "password", void 0);
__decorate([
    typeorm_1.Column('varchar', { default: helpers_1.FETCH_STATUS_SUCCESS }),
    __metadata("design:type", String)
], Access.prototype, "fetchStatus", void 0);
__decorate([
    typeorm_1.Column('varchar', { nullable: true, default: null }),
    __metadata("design:type", Object)
], Access.prototype, "customLabel", void 0);
__decorate([
    typeorm_1.OneToMany(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type => access_fields_1.default, accessField => accessField.access, { cascade: ['insert'] }),
    __metadata("design:type", Array)
], Access.prototype, "fields", void 0);
__decorate([
    typeorm_1.Column('varchar', { nullable: true, default: null }),
    __metadata("design:type", Object)
], Access.prototype, "session", void 0);
Access = Access_1 = __decorate([
    typeorm_1.Entity('access')
], Access);
exports.default = Access;
let REPO = null;
function repo() {
    if (REPO === null) {
        REPO = typeorm_1.getRepository(Access);
    }
    return REPO;
}
