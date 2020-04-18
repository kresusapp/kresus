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
var Alert_1;
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const accounts_1 = __importDefault(require("./accounts"));
const users_1 = __importDefault(require("./users"));
const helpers_1 = require("../../helpers");
const helpers_2 = require("../helpers");
const log = helpers_1.makeLogger('models/entities/alert');
let Alert = Alert_1 = class Alert {
    // Methods.
    testTransaction(operation) {
        if (this.type !== 'transaction') {
            return false;
        }
        const amount = Math.abs(operation.amount);
        return ((this.order === 'lt' && amount <= this.limit) ||
            (this.order === 'gt' && amount >= this.limit));
    }
    testBalance(balance) {
        if (this.type !== 'balance') {
            return false;
        }
        return ((this.order === 'lt' && balance <= this.limit) ||
            (this.order === 'gt' && balance >= this.limit));
    }
    formatOperationMessage(operation, accountName, formatCurrency) {
        const cmp = this.order === 'lt'
            ? helpers_1.translate('server.alert.operation.lessThan')
            : helpers_1.translate('server.alert.operation.greaterThan');
        const amount = formatCurrency(operation.amount);
        const date = helpers_1.formatDate.toShortString(operation.date);
        const limit = formatCurrency(this.limit);
        return helpers_1.translate('server.alert.operation.content', {
            label: operation.label,
            account: accountName,
            amount,
            cmp,
            date,
            limit
        });
    }
    formatAccountMessage(label, balance, formatCurrency) {
        const cmp = this.order === 'lt'
            ? helpers_1.translate('server.alert.balance.lessThan')
            : helpers_1.translate('server.alert.balance.greaterThan');
        const limit = formatCurrency(this.limit);
        const formattedBalance = formatCurrency(balance);
        return helpers_1.translate('server.alert.balance.content', {
            label,
            cmp,
            limit,
            balance: formattedBalance
        });
    }
    // Static methods
    static async byAccountAndType(userId, accountId, type) {
        if (typeof accountId !== 'number') {
            log.warn('Alert.byAccountAndType misuse: accountId must be a number');
        }
        if (typeof type !== 'string') {
            log.warn('Alert.byAccountAndType misuse: type must be a string');
        }
        return await repo().find({ userId, accountId, type });
    }
    static async reportsByFrequency(userId, frequency) {
        if (typeof frequency !== 'string') {
            log.warn('Alert.reportsByFrequency misuse: frequency must be a string');
        }
        return await repo().find({ where: { userId, type: 'report', frequency } });
    }
    static async destroyByAccount(userId, accountId) {
        if (typeof accountId !== 'number') {
            log.warn("Alert.destroyByAccount API misuse: accountId isn't a number");
        }
        await repo().delete({ userId, accountId });
    }
    static async find(userId, alertId) {
        return await repo().findOne({ where: { id: alertId, userId } });
    }
    static async exists(userId, alertId) {
        const found = await Alert_1.find(userId, alertId);
        return !!found;
    }
    static async all(userId) {
        return await repo().find({ userId });
    }
    static async create(userId, attributes) {
        const alert = repo().create({ userId, ...attributes });
        return await repo().save(alert);
    }
    static async destroy(userId, alertId) {
        await repo().delete({ id: alertId, userId });
    }
    static async destroyAll(userId) {
        await repo().delete({ userId });
    }
    static async update(userId, alertId, fields) {
        await repo().update({ userId, id: alertId }, fields);
        return helpers_1.unwrap(await Alert_1.find(userId, alertId));
    }
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Object)
], Alert.prototype, "id", void 0);
__decorate([
    typeorm_1.ManyToOne(type => users_1.default, { cascade: true, onDelete: 'CASCADE', nullable: false }),
    typeorm_1.JoinColumn(),
    __metadata("design:type", Object)
], Alert.prototype, "user", void 0);
__decorate([
    typeorm_1.Column('integer'),
    __metadata("design:type", Object)
], Alert.prototype, "userId", void 0);
__decorate([
    typeorm_1.ManyToOne(type => accounts_1.default, { cascade: true, onDelete: 'CASCADE', nullable: false }),
    typeorm_1.JoinColumn(),
    __metadata("design:type", Object)
], Alert.prototype, "account", void 0);
__decorate([
    typeorm_1.Column('integer'),
    __metadata("design:type", Object)
], Alert.prototype, "accountId", void 0);
__decorate([
    typeorm_1.Column('varchar'),
    __metadata("design:type", Object)
], Alert.prototype, "type", void 0);
__decorate([
    typeorm_1.Column('varchar', { nullable: true, default: null }),
    __metadata("design:type", Object)
], Alert.prototype, "frequency", void 0);
__decorate([
    typeorm_1.Column('numeric', { nullable: true, default: null, transformer: new helpers_2.ForceNumericColumn() }),
    __metadata("design:type", Object)
], Alert.prototype, "limit", void 0);
__decorate([
    typeorm_1.Column('varchar', { nullable: true, default: null }),
    __metadata("design:type", Object)
], Alert.prototype, "order", void 0);
__decorate([
    typeorm_1.Column({ type: helpers_2.DatetimeType, nullable: true, default: null }),
    __metadata("design:type", Object)
], Alert.prototype, "lastTriggeredDate", void 0);
Alert = Alert_1 = __decorate([
    typeorm_1.Entity('alert')
], Alert);
exports.default = Alert;
let REPO = null;
function repo() {
    if (REPO === null) {
        REPO = typeorm_1.getRepository(Alert);
    }
    return REPO;
}
