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
var TransactionRuleAction_1;
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const helpers_1 = require("../../helpers");
const __1 = require("..");
const transaction_rule_1 = __importDefault(require("./transaction-rule"));
const categories_1 = __importDefault(require("./categories"));
const users_1 = __importDefault(require("./users"));
let TransactionRuleAction = TransactionRuleAction_1 = class TransactionRuleAction {
    static repo() {
        if (TransactionRuleAction_1.REPO === null) {
            TransactionRuleAction_1.REPO = (0, __1.getRepository)(TransactionRuleAction_1);
        }
        return TransactionRuleAction_1.REPO;
    }
    // Static methods.
    // Doesn't insert anything in db, only creates a new instance and normalizes its fields.
    static cast(args) {
        return TransactionRuleAction_1.repo().create(args);
    }
    static async find(userId, actionId) {
        return await TransactionRuleAction_1.repo().findOne({ where: { id: actionId, userId } });
    }
    static async exists(userId, actionId) {
        const found = await TransactionRuleAction_1.find(userId, actionId);
        return !!found;
    }
    static async all(userId) {
        return await TransactionRuleAction_1.repo().findBy({ userId });
    }
    static async create(userId, attributes) {
        const alert = TransactionRuleAction_1.repo().create({ ...attributes, userId });
        return await TransactionRuleAction_1.repo().save(alert);
    }
    static async destroy(userId, actionId) {
        await TransactionRuleAction_1.repo().delete({ id: actionId, userId });
    }
    static async update(userId, actionId, fields) {
        await TransactionRuleAction_1.repo().update({ userId, id: actionId }, fields);
        return (0, helpers_1.unwrap)(await TransactionRuleAction_1.find(userId, actionId));
    }
};
TransactionRuleAction.REPO = null;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], TransactionRuleAction.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => users_1.default, { cascade: true, onDelete: 'CASCADE', nullable: false }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", users_1.default)
], TransactionRuleAction.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)('integer'),
    __metadata("design:type", Number)
], TransactionRuleAction.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => transaction_rule_1.default, { cascade: true, onDelete: 'CASCADE', nullable: false }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", transaction_rule_1.default)
], TransactionRuleAction.prototype, "rule", void 0);
__decorate([
    (0, typeorm_1.Column)('integer'),
    __metadata("design:type", Number)
], TransactionRuleAction.prototype, "ruleId", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar'),
    __metadata("design:type", String)
], TransactionRuleAction.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => categories_1.default, { cascade: true, onDelete: 'CASCADE', nullable: false }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", categories_1.default)
], TransactionRuleAction.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)('integer'),
    __metadata("design:type", Number)
], TransactionRuleAction.prototype, "categoryId", void 0);
TransactionRuleAction = TransactionRuleAction_1 = __decorate([
    (0, typeorm_1.Entity)('transaction-rule-action')
], TransactionRuleAction);
exports.default = TransactionRuleAction;
