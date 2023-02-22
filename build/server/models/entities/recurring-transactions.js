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
var RecurringTransaction_1;
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const helpers_1 = require("../../helpers");
const helpers_2 = require("../helpers");
const accounts_1 = __importDefault(require("./accounts"));
const users_1 = __importDefault(require("./users"));
const applied_recurring_transactions_1 = __importDefault(require("./applied-recurring-transactions"));
let RecurringTransaction = RecurringTransaction_1 = class RecurringTransaction {
    constructor() {
        this.type = helpers_1.UNKNOWN_TRANSACTION_TYPE;
    }
    static repo() {
        if (RecurringTransaction_1.REPO === null) {
            RecurringTransaction_1.REPO = (0, typeorm_1.getRepository)(RecurringTransaction_1);
        }
        return RecurringTransaction_1.REPO;
    }
    // Static methods.
    static isValidListOfMonths(list) {
        if (list === 'all') {
            return true;
        }
        return /^[1-9][0-2]?(?:;[1-9][0-2]?)*$/.test(list);
    }
    // Doesn't insert anything in db, only creates a new instance and normalizes its fields.
    static cast(args) {
        return RecurringTransaction_1.repo().create(args);
    }
    static async all(userId) {
        return await RecurringTransaction_1.repo().find({ where: { userId } });
    }
    static async byAccountId(userId, accountId) {
        return await RecurringTransaction_1.repo().find({ where: { userId, accountId } });
    }
    static async find(userId, recurringTrId) {
        return await RecurringTransaction_1.repo().findOne({ where: { id: recurringTrId, userId } });
    }
    static async exists(userId, recurringTrId) {
        const found = await RecurringTransaction_1.find(userId, recurringTrId);
        return !!found;
    }
    static async create(userId, attributes) {
        (0, helpers_1.assert)(typeof attributes.accountId === 'number', 'recurring transaction must have an accountId');
        (0, helpers_1.assert)(typeof attributes.type !== 'undefined', 'recurring transaction must have a type');
        (0, helpers_1.assert)(typeof attributes.label === 'string', 'recurring transaction must have a label');
        (0, helpers_1.assert)(typeof attributes.amount === 'number', 'recurring transaction must have an amount');
        (0, helpers_1.assert)(typeof attributes.dayOfMonth === 'number' &&
            attributes.dayOfMonth >= 0 &&
            attributes.dayOfMonth <= 31, 'recurring transaction must have a day of month');
        (0, helpers_1.assert)(typeof attributes.listOfMonths === 'string' &&
            RecurringTransaction_1.isValidListOfMonths(attributes.listOfMonths), 'recurring transaction must have a valid list of months');
        const recurringTransaction = RecurringTransaction_1.repo().create({ ...attributes, userId });
        return await RecurringTransaction_1.repo().save(recurringTransaction);
    }
    static async destroy(userId, recurringTrId) {
        await RecurringTransaction_1.repo().delete({ id: recurringTrId, userId });
    }
    static async destroyAll(userId) {
        await RecurringTransaction_1.repo().delete({ userId });
    }
    static async update(userId, recurringTrId, fields) {
        // Do not allow accountId changes (that could lead to duplicates and the recurrent
        // transaction modification should be done by account anyway).
        if (typeof fields.accountId !== 'undefined') {
            delete fields.accountId;
        }
        await RecurringTransaction_1.repo().update({ userId, id: recurringTrId }, fields);
        return (0, helpers_1.unwrap)(await RecurringTransaction_1.find(userId, recurringTrId));
    }
    static async getCurrentMonthMissingRecurringTransactions(userId, accountId, month, year) {
        const qb = RecurringTransaction_1.repo().createQueryBuilder('recurring');
        return await qb
            .where(`recurring.id NOT IN ${qb
            .subQuery()
            .select('applied.recurringTransactionId')
            .from(applied_recurring_transactions_1.default, 'applied')
            .where('applied.userId = :userId')
            .andWhere('applied.accountId = :accountId')
            .andWhere('applied.month = :month')
            .andWhere('applied.year = :year')
            .getQuery()}`)
            .andWhere('recurring.userId = :userId')
            .andWhere('recurring.accountId = :accountId')
            .setParameter('userId', userId)
            .setParameter('accountId', accountId)
            .setParameter('month', month)
            .setParameter('year', year)
            .getMany();
    }
};
RecurringTransaction.REPO = null;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], RecurringTransaction.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => users_1.default, { cascade: true, onDelete: 'CASCADE', nullable: false }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", users_1.default)
], RecurringTransaction.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)('integer'),
    __metadata("design:type", Number)
], RecurringTransaction.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => accounts_1.default, { cascade: true, onDelete: 'CASCADE', nullable: false }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", accounts_1.default)
], RecurringTransaction.prototype, "account", void 0);
__decorate([
    (0, typeorm_1.Column)('integer'),
    __metadata("design:type", Number)
], RecurringTransaction.prototype, "accountId", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { default: helpers_1.UNKNOWN_TRANSACTION_TYPE }),
    __metadata("design:type", String)
], RecurringTransaction.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { nullable: false }),
    __metadata("design:type", String)
], RecurringTransaction.prototype, "label", void 0);
__decorate([
    (0, typeorm_1.Column)('numeric', { transformer: new helpers_2.ForceNumericColumn() }),
    __metadata("design:type", Number)
], RecurringTransaction.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)('integer'),
    __metadata("design:type", Number)
], RecurringTransaction.prototype, "dayOfMonth", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { nullable: false, default: "'all'" }),
    __metadata("design:type", String)
], RecurringTransaction.prototype, "listOfMonths", void 0);
RecurringTransaction = RecurringTransaction_1 = __decorate([
    (0, typeorm_1.Entity)('recurring-transaction')
], RecurringTransaction);
exports.default = RecurringTransaction;
