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
var AccessField_1;
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const users_1 = __importDefault(require("./users"));
const accesses_1 = __importDefault(require("./accesses"));
const helpers_1 = require("../../helpers");
let AccessField = AccessField_1 = class AccessField {
    static async create(userId, attributes) {
        const { accessId } = attributes;
        helpers_1.assert(typeof accessId === 'number', 'AccessField.create second arg should have "accessId" id property');
        const entity = repo().create(Object.assign({}, attributes, { userId }));
        return await repo().save(entity);
    }
    static async find(userId, fieldId) {
        return await repo().findOne({ where: { id: fieldId, userId } });
    }
    static async all(userId) {
        return await repo().find({ userId });
    }
    static async exists(userId, fieldId) {
        const found = await repo().findOne({ where: { userId, id: fieldId } });
        return !!found;
    }
    static async destroy(userId, fieldId) {
        await repo().delete({ userId, id: fieldId });
    }
    static async destroyAll(userId) {
        await repo().delete({ userId });
    }
    static async update(userId, fieldId, attributes) {
        await repo().update({ userId, id: fieldId }, attributes);
        const updated = await AccessField_1.find(userId, fieldId);
        return helpers_1.unwrap(updated);
    }
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], AccessField.prototype, "id", void 0);
__decorate([
    typeorm_1.ManyToOne(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type => users_1.default, { cascade: true, onDelete: 'CASCADE', nullable: false }),
    typeorm_1.JoinColumn(),
    __metadata("design:type", users_1.default)
], AccessField.prototype, "user", void 0);
__decorate([
    typeorm_1.Column('integer'),
    __metadata("design:type", Number)
], AccessField.prototype, "userId", void 0);
__decorate([
    typeorm_1.ManyToOne(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type => accesses_1.default, access => access.fields, { cascade: true, onDelete: 'CASCADE', nullable: false }),
    typeorm_1.JoinColumn(),
    __metadata("design:type", accesses_1.default)
], AccessField.prototype, "access", void 0);
__decorate([
    typeorm_1.Column('integer'),
    __metadata("design:type", Number)
], AccessField.prototype, "accessId", void 0);
__decorate([
    typeorm_1.Column('varchar'),
    __metadata("design:type", String)
], AccessField.prototype, "name", void 0);
__decorate([
    typeorm_1.Column('varchar'),
    __metadata("design:type", String)
], AccessField.prototype, "value", void 0);
AccessField = AccessField_1 = __decorate([
    typeorm_1.Entity('access_fields')
], AccessField);
exports.default = AccessField;
let REPO = null;
function repo() {
    if (REPO === null) {
        REPO = typeorm_1.getRepository(AccessField);
    }
    return REPO;
}
