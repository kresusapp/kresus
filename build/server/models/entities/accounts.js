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
        // Methods.
        this.computeBalance = async () => {
            const ops = await transactions_1.default.byAccount(this.userId, this);
            const today = new Date();
            const s = ops
                .filter(op => helpers_1.shouldIncludeInBalance(op, today, this.type))
                .reduce((sum, op) => sum + op.amount, this.initialBalance);
            return Math.round(s * 100) / 100;
        };
        this.computeOutstandingSum = async () => {
            const ops = await transactions_1.default.byAccount(this.userId, this);
            const s = ops
                .filter(op => helpers_1.shouldIncludeInOutstandingSum(op))
                .reduce((sum, op) => sum + op.amount, 0);
            return Math.round(s * 100) / 100;
        };
        this.getCurrencyFormatter = async () => {
            let checkedCurrency;
            if (helpers_1.currency.isKnown(this.currency)) {
                checkedCurrency = this.currency;
            }
            else {
                checkedCurrency = (await settings_1.default.findOrCreateDefault(this.userId, 'default-currency'))
                    .value;
            }
            return helpers_1.currencyFormatter(checkedCurrency);
        };
    }
    static async byVendorId(userId, { uuid: vendorId }) {
        return await repo().find({ userId, vendorId });
    }
    static async findMany(userId, accountIds) {
        return await repo().find({ userId, id: typeorm_1.In(accountIds) });
    }
    static async byAccess(userId, access) {
        return await repo().find({ userId, accessId: access.id });
    }
    // Doesn't insert anything in db, only creates a new instance and normalizes its fields.
    static cast(args) {
        return repo().create(args);
    }
    static async create(userId, attributes) {
        const entity = repo().create({ userId, ...attributes });
        return await repo().save(entity);
    }
    static async find(userId, accessId) {
        return await repo().findOne({ where: { userId, id: accessId } });
    }
    static async all(userId) {
        return await repo().find({ userId });
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
    static async update(userId, accountId, attributes) {
        await repo().update({ userId, id: accountId }, attributes);
        return helpers_1.unwrap(await Account_1.find(userId, accountId));
    }
};
// Static methods
Account.renamings = {
    initialAmount: 'initialBalance',
    bank: 'vendorId',
    lastChecked: 'lastCheckDate',
    bankAccess: 'accessId',
    accountNumber: 'vendorAccountId',
    title: 'label'
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Account.prototype, "id", void 0);
__decorate([
    typeorm_1.ManyToOne(type => users_1.default, { cascade: true, onDelete: 'CASCADE', nullable: false }),
    typeorm_1.JoinColumn(),
    __metadata("design:type", users_1.default)
], Account.prototype, "user", void 0);
__decorate([
    typeorm_1.Column('integer'),
    __metadata("design:type", Number)
], Account.prototype, "userId", void 0);
__decorate([
    typeorm_1.ManyToOne(type => accesses_1.default, { cascade: true, onDelete: 'CASCADE', nullable: false }),
    typeorm_1.JoinColumn(),
    __metadata("design:type", accesses_1.default)
], Account.prototype, "access", void 0);
__decorate([
    typeorm_1.Column('integer'),
    __metadata("design:type", Number)
], Account.prototype, "accessId", void 0);
__decorate([
    typeorm_1.Column('varchar'),
    __metadata("design:type", String)
], Account.prototype, "vendorId", void 0);
__decorate([
    typeorm_1.Column('varchar'),
    __metadata("design:type", String)
], Account.prototype, "vendorAccountId", void 0);
__decorate([
    typeorm_1.Column('varchar', { default: helpers_1.UNKNOWN_ACCOUNT_TYPE }),
    __metadata("design:type", String)
], Account.prototype, "type", void 0);
__decorate([
    typeorm_1.Column({ type: helpers_2.DatetimeType }),
    __metadata("design:type", Date)
], Account.prototype, "importDate", void 0);
__decorate([
    typeorm_1.Column('numeric', { transformer: new helpers_2.ForceNumericColumn() }),
    __metadata("design:type", Number)
], Account.prototype, "initialBalance", void 0);
__decorate([
    typeorm_1.Column({ type: helpers_2.DatetimeType }),
    __metadata("design:type", Date)
], Account.prototype, "lastCheckDate", void 0);
__decorate([
    typeorm_1.Column('varchar'),
    __metadata("design:type", String)
], Account.prototype, "label", void 0);
__decorate([
    typeorm_1.Column('varchar', { nullable: true, default: null }),
    __metadata("design:type", Object)
], Account.prototype, "customLabel", void 0);
__decorate([
    typeorm_1.Column('varchar', { nullable: true, default: null }),
    __metadata("design:type", Object)
], Account.prototype, "iban", void 0);
__decorate([
    typeorm_1.Column('varchar', { nullable: true, default: null }),
    __metadata("design:type", Object)
], Account.prototype, "currency", void 0);
__decorate([
    typeorm_1.Column('boolean', { default: false }),
    __metadata("design:type", Object)
], Account.prototype, "excludeFromBalance", void 0);
Account = Account_1 = __decorate([
    typeorm_1.Entity('account')
], Account);
exports.default = Account;
let REPO = null;
function repo() {
    if (REPO === null) {
        REPO = typeorm_1.getRepository(Account);
    }
    return REPO;
}
