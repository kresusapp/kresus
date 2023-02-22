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
var AppliedRecurringTransaction_1;
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const helpers_1 = require("../../helpers");
const recurring_transactions_1 = __importDefault(require("./recurring-transactions"));
const accounts_1 = __importDefault(require("./accounts"));
const users_1 = __importDefault(require("./users"));
let AppliedRecurringTransaction = AppliedRecurringTransaction_1 = class AppliedRecurringTransaction {
    static repo() {
        if (AppliedRecurringTransaction_1.REPO === null) {
            AppliedRecurringTransaction_1.REPO = (0, typeorm_1.getRepository)(AppliedRecurringTransaction_1);
        }
        return AppliedRecurringTransaction_1.REPO;
    }
    // Static methods.
    // Doesn't insert anything in db, only creates a new instance and normalizes its fields.
    static cast(args) {
        return AppliedRecurringTransaction_1.repo().create(args);
    }
    static async all(userId) {
        return await AppliedRecurringTransaction_1.repo().find({ where: { userId } });
    }
    static async find(userId, accountId, month, year) {
        return await AppliedRecurringTransaction_1.repo().findOne({
            where: {
                userId,
                accountId,
                month,
                year,
            },
        });
    }
    static async byMonthAndYear(userId, month, year) {
        return await AppliedRecurringTransaction_1.repo().find({
            userId,
            month,
            year,
        });
    }
    static async exists(userId, accountId, month, year) {
        const found = await AppliedRecurringTransaction_1.find(userId, accountId, month, year);
        return !!found;
    }
    static async create(userId, attributes) {
        (0, helpers_1.assert)(typeof attributes.accountId === 'number', 'applied recurring transaction must have an accountId');
        (0, helpers_1.assert)(typeof attributes.recurringTransactionId === 'number', 'applied recurring transaction must have a recurring transaction id');
        (0, helpers_1.assert)(typeof attributes.month === 'number' && attributes.month >= 0 && attributes.month <= 12, 'applied recurring transaction must have a month');
        (0, helpers_1.assert)(typeof attributes.year === 'number' && attributes.year > 0, 'applied recurring transaction must have a year');
        const appliedRecurringTransaction = AppliedRecurringTransaction_1.repo().create({
            ...attributes,
            userId,
        });
        return await AppliedRecurringTransaction_1.repo().save(appliedRecurringTransaction);
    }
    static async destroyAll(userId) {
        await AppliedRecurringTransaction_1.repo().delete({ userId });
    }
};
AppliedRecurringTransaction.REPO = null;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], AppliedRecurringTransaction.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => users_1.default, { cascade: true, onDelete: 'CASCADE', nullable: false }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", users_1.default)
], AppliedRecurringTransaction.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)('integer'),
    __metadata("design:type", Number)
], AppliedRecurringTransaction.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => recurring_transactions_1.default, { cascade: true, onDelete: 'CASCADE', nullable: false }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", recurring_transactions_1.default)
], AppliedRecurringTransaction.prototype, "recurringTransaction", void 0);
__decorate([
    (0, typeorm_1.Column)('integer'),
    __metadata("design:type", Number)
], AppliedRecurringTransaction.prototype, "recurringTransactionId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => accounts_1.default, { cascade: true, onDelete: 'CASCADE', nullable: false }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", accounts_1.default)
], AppliedRecurringTransaction.prototype, "account", void 0);
__decorate([
    (0, typeorm_1.Column)('integer'),
    __metadata("design:type", Number)
], AppliedRecurringTransaction.prototype, "accountId", void 0);
__decorate([
    (0, typeorm_1.Column)('integer'),
    __metadata("design:type", Number)
], AppliedRecurringTransaction.prototype, "month", void 0);
__decorate([
    (0, typeorm_1.Column)('integer'),
    __metadata("design:type", Number)
], AppliedRecurringTransaction.prototype, "year", void 0);
AppliedRecurringTransaction = AppliedRecurringTransaction_1 = __decorate([
    (0, typeorm_1.Entity)('applied-recurring-transaction')
], AppliedRecurringTransaction);
exports.default = AppliedRecurringTransaction;
