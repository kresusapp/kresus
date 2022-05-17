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
var Alert_1;
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const __1 = require("../");
const helpers_1 = require("../../helpers");
const helpers_2 = require("../helpers");
let Alert = Alert_1 = class Alert {
    constructor() {
        // Frequency, for reports : daily, weekly, monthly.
        this.frequency = null;
        // Threshold value, for balance/transaction alerts.
        this.limit = null;
        // Ordering, for balance/transaction alerts: gt, lt.
        this.order = null;
        // When did the alert get triggered for the last time?
        this.lastTriggeredDate = null;
    }
    static repo() {
        if (Alert_1.REPO === null) {
            Alert_1.REPO = (0, typeorm_1.getRepository)(Alert_1);
        }
        return Alert_1.REPO;
    }
    // Methods.
    testTransaction(operation) {
        if (this.type !== 'transaction') {
            return false;
        }
        (0, helpers_1.assert)(this.limit !== null, 'limit must be set for testTransaction');
        const amount = Math.abs(operation.amount);
        return ((this.order === 'lt' && amount <= this.limit) ||
            (this.order === 'gt' && amount >= this.limit));
    }
    testBalance(balance) {
        if (this.type !== 'balance') {
            return false;
        }
        (0, helpers_1.assert)(this.limit !== null, 'limit must be set for testBalance');
        return ((this.order === 'lt' && balance <= this.limit) ||
            (this.order === 'gt' && balance >= this.limit));
    }
    formatOperationMessage(i18n, transaction, accountName, formatCurrency) {
        const cmp = this.order === 'lt'
            ? (0, helpers_1.translate)(i18n, 'server.alert.operation.lessThan')
            : (0, helpers_1.translate)(i18n, 'server.alert.operation.greaterThan');
        const amount = formatCurrency(transaction.amount);
        const date = (0, helpers_1.formatDate)(i18n.localeId).toShortString(transaction.date);
        (0, helpers_1.assert)(this.limit !== null, 'limit must be set for formatOperationMessage');
        const limit = formatCurrency(this.limit);
        return (0, helpers_1.translate)(i18n, 'server.alert.operation.content', {
            label: transaction.label,
            account: accountName,
            amount,
            cmp,
            date,
            limit,
        });
    }
    formatAccountMessage(i18n, label, balance, formatCurrency) {
        const cmp = this.order === 'lt'
            ? (0, helpers_1.translate)(i18n, 'server.alert.balance.lessThan')
            : (0, helpers_1.translate)(i18n, 'server.alert.balance.greaterThan');
        (0, helpers_1.assert)(this.limit !== null, 'limit must be set for formatAccountMessage');
        const limit = formatCurrency(this.limit);
        const formattedBalance = formatCurrency(balance);
        return (0, helpers_1.translate)(i18n, 'server.alert.balance.content', {
            label,
            cmp,
            limit,
            balance: formattedBalance,
        });
    }
    // Static methods
    static async byAccountAndType(userId, accountId, type) {
        return await Alert_1.repo().find({ userId, accountId, type });
    }
    static async reportsByFrequency(userId, frequency) {
        return await Alert_1.repo().find({ where: { userId, type: 'report', frequency } });
    }
    static async destroyByAccount(userId, accountId) {
        await Alert_1.repo().delete({ userId, accountId });
    }
    static async find(userId, alertId) {
        return await Alert_1.repo().findOne({ where: { id: alertId, userId } });
    }
    static async exists(userId, alertId) {
        const found = await Alert_1.find(userId, alertId);
        return !!found;
    }
    static async all(userId) {
        return await Alert_1.repo().find({ userId });
    }
    static async create(userId, attributes) {
        const alert = Alert_1.repo().create({ ...attributes, userId });
        return await Alert_1.repo().save(alert);
    }
    static async destroy(userId, alertId) {
        await Alert_1.repo().delete({ id: alertId, userId });
    }
    static async destroyAll(userId) {
        await Alert_1.repo().delete({ userId });
    }
    static async update(userId, alertId, fields) {
        await Alert_1.repo().update({ userId, id: alertId }, fields);
        return (0, helpers_1.unwrap)(await Alert_1.find(userId, alertId));
    }
};
Alert.REPO = null;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Alert.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => __1.User, { cascade: true, onDelete: 'CASCADE', nullable: false }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", __1.User)
], Alert.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)('integer'),
    __metadata("design:type", Number)
], Alert.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => __1.Account, { cascade: true, onDelete: 'CASCADE', nullable: false }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", __1.Account)
], Alert.prototype, "account", void 0);
__decorate([
    (0, typeorm_1.Column)('integer'),
    __metadata("design:type", Number)
], Alert.prototype, "accountId", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar'),
    __metadata("design:type", String)
], Alert.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { nullable: true, default: null }),
    __metadata("design:type", Object)
], Alert.prototype, "frequency", void 0);
__decorate([
    (0, typeorm_1.Column)('numeric', { nullable: true, default: null, transformer: new helpers_2.ForceNumericColumn() }),
    __metadata("design:type", Object)
], Alert.prototype, "limit", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { nullable: true, default: null }),
    __metadata("design:type", Object)
], Alert.prototype, "order", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: helpers_2.DatetimeType, nullable: true, default: null }),
    __metadata("design:type", Object)
], Alert.prototype, "lastTriggeredDate", void 0);
Alert = Alert_1 = __decorate([
    (0, typeorm_1.Entity)('alert')
], Alert);
exports.default = Alert;
