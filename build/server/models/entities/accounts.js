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
var Account_1;
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const users_1 = __importDefault(require("./users"));
const accesses_1 = __importDefault(require("./accesses"));
const transactions_1 = __importDefault(require("./transactions"));
const settings_1 = __importDefault(require("./settings"));
const helpers_1 = require("../../helpers");
const helpers_2 = require("../helpers");
const settings_2 = require("../../shared/settings");
let Account = Account_1 = class Account {
    constructor() {
        // external (backend) type id or UNKNOWN_ACCOUNT_TYPE.
        this.type = helpers_1.UNKNOWN_ACCOUNT_TYPE;
        // description entered by the user.
        this.customLabel = null;
        // IBAN provided by the source (optional).
        this.iban = null;
        // Currency used by the account.
        this.currency = null;
        // If true, this account is not used to eval the balance of an access.
        this.excludeFromBalance = false;
        // Balance on the account, updated at each account update.
        this.balance = null;
        // Methods.
        this.computeBalance = async (offset = 0) => {
            // If more Account fields are ever required to make this function work, don't forget to
            // update migration #13 too!
            // We only select the columns we need, to avoid migrations issues when
            // columns are added later to the transaction model.
            const ops = await transactions_1.default.byAccount(this.userId, this.id, [
                'amount',
                'type',
                'debitDate',
                'date',
            ]);
            const today = new Date();
            const s = ops
                .filter(op => (0, helpers_1.shouldIncludeInBalance)(op, today, this.type))
                .reduce((sum, op) => sum + op.amount, offset);
            return Math.round(s * 100) / 100;
        };
        this.computeOutstandingSum = async () => {
            const ops = await transactions_1.default.byAccount(this.userId, this.id);
            const isOngoingLimitedToCurrentMonth = await settings_1.default.findOrCreateDefaultBooleanValue(this.userId, settings_2.LIMIT_ONGOING_TO_CURRENT_MONTH);
            const s = ops
                .filter(op => (0, helpers_1.shouldIncludeInOutstandingSum)(op, isOngoingLimitedToCurrentMonth))
                .reduce((sum, op) => sum + op.amount, 0);
            return Math.round(s * 100) / 100;
        };
        this.getCurrencyFormatter = async () => {
            let checkedCurrency;
            if (helpers_1.currency.isKnown(this.currency)) {
                checkedCurrency = this.currency;
            }
            else {
                checkedCurrency = (await settings_1.default.findOrCreateDefault(this.userId, settings_2.DEFAULT_CURRENCY))
                    .value;
            }
            (0, helpers_1.assert)(checkedCurrency !== null, 'currency is known at this point');
            return (0, helpers_1.currencyFormatter)(checkedCurrency);
        };
    }
    static repo() {
        if (Account_1.REPO === null) {
            Account_1.REPO = (0, typeorm_1.getRepository)(Account_1);
        }
        return Account_1.REPO;
    }
    static async ensureBalance(account) {
        // If there is no balance for an account, compute one based on the initial amount and the
        // transactions.
        if (account.balance === null) {
            account.balance = await account.computeBalance();
        }
    }
    static async findMany(userId, accountIds) {
        const accounts = await Account_1.repo().find({ userId, id: (0, typeorm_1.In)(accountIds) });
        await Promise.all(accounts.map(Account_1.ensureBalance));
        return accounts;
    }
    static async byAccess(userId, access) {
        const accounts = await Account_1.repo().find({ userId, accessId: access.id });
        await Promise.all(accounts.map(Account_1.ensureBalance));
        return accounts;
    }
    // Doesn't insert anything in db, only creates a new instance and normalizes its fields.
    static cast(args) {
        return Account_1.repo().create(args);
    }
    static async create(userId, attributes) {
        const entity = Account_1.repo().create({ ...attributes, userId });
        const account = await Account_1.repo().save(entity);
        await Account_1.ensureBalance(account);
        return account;
    }
    static async find(userId, accountId) {
        const account = await Account_1.repo().findOne({ where: { userId, id: accountId } });
        if (account) {
            await Account_1.ensureBalance(account);
        }
        return account;
    }
    static async all(userId) {
        const accounts = await Account_1.repo().find({ userId });
        await Promise.all(accounts.map(Account_1.ensureBalance));
        return accounts;
    }
    static async exists(userId, accessId) {
        const found = await Account_1.repo().findOne({ where: { userId, id: accessId } });
        return !!found;
    }
    static async destroy(userId, accessId) {
        await Account_1.repo().delete({ userId, id: accessId });
    }
    static async destroyAll(userId) {
        await Account_1.repo().delete({ userId });
    }
    static async update(userId, accountId, attributes) {
        await Account_1.repo().update({ userId, id: accountId }, attributes);
        return (0, helpers_1.unwrap)(await Account_1.find(userId, accountId));
    }
};
Account.REPO = null;
// Static methods
Account.renamings = {
    initialAmount: 'initialBalance',
    lastChecked: 'lastCheckDate',
    bankAccess: 'accessId',
    accountNumber: 'vendorAccountId',
    title: 'label',
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Account.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => users_1.default, { cascade: true, onDelete: 'CASCADE', nullable: false }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", users_1.default)
], Account.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)('integer'),
    __metadata("design:type", Number)
], Account.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => accesses_1.default, { cascade: true, onDelete: 'CASCADE', nullable: false }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", accesses_1.default)
], Account.prototype, "access", void 0);
__decorate([
    (0, typeorm_1.Column)('integer'),
    __metadata("design:type", Number)
], Account.prototype, "accessId", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar'),
    __metadata("design:type", String)
], Account.prototype, "vendorAccountId", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { default: helpers_1.UNKNOWN_ACCOUNT_TYPE }),
    __metadata("design:type", String)
], Account.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: helpers_2.DatetimeType }),
    __metadata("design:type", Date)
], Account.prototype, "importDate", void 0);
__decorate([
    (0, typeorm_1.Column)('numeric', { transformer: new helpers_2.ForceNumericColumn() }),
    __metadata("design:type", Number)
], Account.prototype, "initialBalance", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: helpers_2.DatetimeType }),
    __metadata("design:type", Date)
], Account.prototype, "lastCheckDate", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar'),
    __metadata("design:type", String)
], Account.prototype, "label", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { nullable: true, default: null }),
    __metadata("design:type", Object)
], Account.prototype, "customLabel", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { nullable: true, default: null }),
    __metadata("design:type", Object)
], Account.prototype, "iban", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { nullable: true, default: null }),
    __metadata("design:type", Object)
], Account.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)('boolean', { default: false }),
    __metadata("design:type", Object)
], Account.prototype, "excludeFromBalance", void 0);
__decorate([
    (0, typeorm_1.Column)('numeric', { nullable: true, default: null, transformer: new helpers_2.ForceNumericColumn() }),
    __metadata("design:type", Object)
], Account.prototype, "balance", void 0);
Account = Account_1 = __decorate([
    (0, typeorm_1.Entity)('account')
], Account);
exports.default = Account;
