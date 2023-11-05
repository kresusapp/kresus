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
var Transaction_1;
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const __1 = require("..");
const users_1 = __importDefault(require("./users"));
const accounts_1 = __importDefault(require("./accounts"));
const categories_1 = __importDefault(require("./categories"));
const helpers_1 = require("../../helpers");
const helpers_2 = require("../helpers");
// Whenever you're adding something to the model, don't forget to modify
// the mergeWith function in the helpers file.
let Transaction = Transaction_1 = class Transaction {
    constructor() {
        // internal category id.
        this.category = null;
        this.categoryId = null;
        // external (backend) type id or UNKNOWN_TRANSACTION_TYPE.
        this.type = helpers_1.UNKNOWN_TRANSACTION_TYPE;
        // description entered by the user.
        this.customLabel = null;
        // date at which the transaction has to be applied.
        this.budgetDate = null;
        // date at which the transaction was (or will be) debited.
        this.debitDate = null;
        // whether the user has created the transaction by itself, or if the backend
        // did.
        this.createdByUser = false;
        // True if the user changed the transaction's type.
        this.isUserDefinedType = false;
        // True if the transaction was created through the recurrent transactions system.
        this.isRecurrentTransaction = false;
    }
    static repo() {
        if (Transaction_1.REPO === null) {
            Transaction_1.REPO = (0, __1.getRepository)(Transaction_1);
        }
        return Transaction_1.REPO;
    }
    // Methods.
    mergeWith(other) {
        return (0, helpers_2.mergeWith)(this, other);
    }
    // Doesn't insert anything in db, only creates a new instance and normalizes its fields.
    static cast(args) {
        return Transaction_1.repo().create(args);
    }
    static async create(userId, attributes) {
        const entity = Transaction_1.repo().create({ ...attributes, userId });
        return await Transaction_1.repo().save(entity);
    }
    // Note: doesn't return the inserted entities.
    static async bulkCreate(userId, transactions) {
        const fullTransactions = transactions.map(tr => {
            return { ...tr, userId };
        });
        return await (0, helpers_2.bulkInsert)(Transaction_1.repo(), fullTransactions);
    }
    static async find(userId, transactionId) {
        return await Transaction_1.repo().findOne({ where: { userId, id: transactionId } });
    }
    static async all(userId) {
        return await Transaction_1.repo().findBy({ userId });
    }
    static async destroy(userId, transactionId) {
        await Transaction_1.repo().delete({ userId, id: transactionId });
    }
    static async destroyAll(userId) {
        await Transaction_1.repo().delete({ userId });
    }
    static async update(userId, transactionId, fields) {
        await Transaction_1.repo().update({ userId, id: transactionId }, fields);
        return (0, helpers_1.unwrap)(await Transaction_1.find(userId, transactionId));
    }
    static async byAccount(userId, accountId, columns) {
        const options = {
            where: {
                userId,
                accountId,
            },
        };
        if (columns && columns.length) {
            options.select = columns;
        }
        return await Transaction_1.repo().find(options);
    }
    static async byAccounts(userId, accountIds) {
        return await Transaction_1.repo().findBy({ userId, accountId: (0, typeorm_1.In)(accountIds) });
    }
    static async byBankSortedByDateBetweenDates(userId, account, minDate, maxDate) {
        return await Transaction_1.repo().find({
            where: {
                userId,
                accountId: account.id,
                date: (0, typeorm_1.Between)(minDate, maxDate),
            },
            order: {
                date: 'DESC',
            },
        });
    }
    static async destroyByAccount(userId, accountId) {
        await Transaction_1.repo().delete({ userId, accountId });
    }
    static async replaceCategory(userId, categoryId, replacementCategoryId) {
        await Transaction_1.repo()
            .createQueryBuilder()
            .update()
            .set({ categoryId: replacementCategoryId })
            .where({ userId, categoryId })
            .execute();
    }
    static async replaceAccount(userId, accountId, replacementAccountId) {
        await Transaction_1.repo()
            .createQueryBuilder()
            .update()
            .set({ accountId: replacementAccountId })
            .where({ userId, accountId })
            .execute();
    }
    // Checks the input object has the minimum set of attributes required for being a transaction.
    static isTransaction(input) {
        return (input.hasOwnProperty('accountId') &&
            input.hasOwnProperty('label') &&
            input.hasOwnProperty('date') &&
            input.hasOwnProperty('amount') &&
            input.hasOwnProperty('type'));
    }
};
Transaction.REPO = null;
// Static methods
Transaction.renamings = {
    raw: 'rawLabel',
    dateImport: 'importDate',
    title: 'label',
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Transaction.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => users_1.default, { cascade: true, onDelete: 'CASCADE', nullable: false }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", users_1.default)
], Transaction.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)('integer'),
    __metadata("design:type", Number)
], Transaction.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => accounts_1.default, { cascade: true, onDelete: 'CASCADE', nullable: false }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", accounts_1.default)
], Transaction.prototype, "account", void 0);
__decorate([
    (0, typeorm_1.Column)('integer'),
    __metadata("design:type", Number)
], Transaction.prototype, "accountId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => categories_1.default, { cascade: true, onDelete: 'SET NULL', nullable: true }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", Object)
], Transaction.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)('integer', { nullable: true, default: null }),
    __metadata("design:type", Object)
], Transaction.prototype, "categoryId", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { default: helpers_1.UNKNOWN_TRANSACTION_TYPE }),
    __metadata("design:type", String)
], Transaction.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar'),
    __metadata("design:type", String)
], Transaction.prototype, "label", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar'),
    __metadata("design:type", String)
], Transaction.prototype, "rawLabel", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { nullable: true, default: null }),
    __metadata("design:type", Object)
], Transaction.prototype, "customLabel", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: helpers_2.DatetimeType }),
    __metadata("design:type", Date)
], Transaction.prototype, "date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: helpers_2.DatetimeType }),
    __metadata("design:type", Date)
], Transaction.prototype, "importDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: helpers_2.DatetimeType, nullable: true, default: null }),
    __metadata("design:type", Object)
], Transaction.prototype, "budgetDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: helpers_2.DatetimeType, nullable: true, default: null }),
    __metadata("design:type", Object)
], Transaction.prototype, "debitDate", void 0);
__decorate([
    (0, typeorm_1.Column)('numeric', { transformer: new helpers_2.ForceNumericColumn() }),
    __metadata("design:type", Number)
], Transaction.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)('boolean', { default: false }),
    __metadata("design:type", Object)
], Transaction.prototype, "createdByUser", void 0);
__decorate([
    (0, typeorm_1.Column)('boolean', { default: false }),
    __metadata("design:type", Object)
], Transaction.prototype, "isUserDefinedType", void 0);
__decorate([
    (0, typeorm_1.Column)('boolean', { default: false }),
    __metadata("design:type", Object)
], Transaction.prototype, "isRecurrentTransaction", void 0);
Transaction = Transaction_1 = __decorate([
    (0, typeorm_1.Entity)('transaction')
], Transaction);
exports.default = Transaction;
