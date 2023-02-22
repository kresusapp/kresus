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
var TransactionRuleCondition_1;
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const helpers_1 = require("../../helpers");
const transaction_rule_1 = __importDefault(require("./transaction-rule"));
const users_1 = __importDefault(require("./users"));
let TransactionRuleCondition = TransactionRuleCondition_1 = class TransactionRuleCondition {
    static repo() {
        if (TransactionRuleCondition_1.REPO === null) {
            TransactionRuleCondition_1.REPO = (0, typeorm_1.getRepository)(TransactionRuleCondition_1);
        }
        return TransactionRuleCondition_1.REPO;
    }
    // Static methods.
    // Doesn't insert anything in db, only creates a new instance and normalizes its fields.
    static cast(args) {
        return TransactionRuleCondition_1.repo().create(args);
    }
    static async find(userId, conditionId) {
        return await TransactionRuleCondition_1.repo().findOne({
            where: { id: conditionId, userId },
        });
    }
    static async byRuleId(userId, ruleId) {
        return await TransactionRuleCondition_1.repo().find({
            where: { userId, ruleId },
        });
    }
    static async exists(userId, conditionId) {
        const found = await TransactionRuleCondition_1.find(userId, conditionId);
        return !!found;
    }
    static async all(userId) {
        return await TransactionRuleCondition_1.repo().find({ userId });
    }
    static async create(userId, attributes) {
        const alert = TransactionRuleCondition_1.repo().create({ ...attributes, userId });
        return await TransactionRuleCondition_1.repo().save(alert);
    }
    static async destroy(userId, conditionId) {
        await TransactionRuleCondition_1.repo().delete({ id: conditionId, userId });
    }
    static async update(userId, conditionId, fields) {
        await TransactionRuleCondition_1.repo().update({ userId, id: conditionId }, fields);
        return (0, helpers_1.unwrap)(await TransactionRuleCondition_1.find(userId, conditionId));
    }
};
TransactionRuleCondition.REPO = null;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], TransactionRuleCondition.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => users_1.default, { cascade: true, onDelete: 'CASCADE', nullable: false }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", users_1.default)
], TransactionRuleCondition.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)('integer'),
    __metadata("design:type", Number)
], TransactionRuleCondition.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => transaction_rule_1.default, { cascade: true, onDelete: 'CASCADE', nullable: false }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", transaction_rule_1.default)
], TransactionRuleCondition.prototype, "rule", void 0);
__decorate([
    (0, typeorm_1.Column)('integer'),
    __metadata("design:type", Number)
], TransactionRuleCondition.prototype, "ruleId", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar'),
    __metadata("design:type", String)
], TransactionRuleCondition.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar'),
    __metadata("design:type", String)
], TransactionRuleCondition.prototype, "value", void 0);
TransactionRuleCondition = TransactionRuleCondition_1 = __decorate([
    (0, typeorm_1.Entity)('transaction-rule-condition')
], TransactionRuleCondition);
exports.default = TransactionRuleCondition;
