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
var TransactionRule_1;
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const __1 = require("..");
const helpers_1 = require("../../helpers");
const users_1 = __importDefault(require("./users"));
let TransactionRule = TransactionRule_1 = class TransactionRule {
    static repo() {
        if (TransactionRule_1.REPO === null) {
            TransactionRule_1.REPO = typeorm_1.getRepository(TransactionRule_1);
        }
        return TransactionRule_1.REPO;
    }
    // Static methods.
    // Returns a non cryptographically-secure hash, for quick comparisons.
    static easyHash(rule) {
        helpers_1.assert(typeof rule.conditions !== 'undefined', 'must have conditions at least');
        helpers_1.assert(typeof rule.actions !== 'undefined', 'must have actions at least');
        let s = '';
        for (const condition of rule.conditions) {
            s += `if%${condition.type}%${condition.value}%`;
        }
        for (const action of rule.actions) {
            s += `then%${action.type}%`;
            if (typeof action.categoryId !== 'undefined') {
                s += `${action.categoryId}%`;
            }
        }
        return s;
    }
    // Doesn't insert anything in db, only creates a new instance and normalizes its fields.
    static cast(args) {
        return TransactionRule_1.repo().create(args);
    }
    static async find(userId, ruleId) {
        return await TransactionRule_1.repo().findOne({ where: { id: ruleId, userId } });
    }
    static async exists(userId, ruleId) {
        const found = await TransactionRule_1.find(userId, ruleId);
        return !!found;
    }
    static async allOrdered(userId) {
        return await TransactionRule_1.repo().find({
            where: { userId },
            relations: ['conditions', 'actions'],
            order: {
                position: 'ASC',
            },
        });
    }
    // Returns the maximum rule position already included in the database.
    static async maxPosition(userId) {
        const rule = await TransactionRule_1.repo().findOne({
            where: { userId },
            order: { position: 'DESC' },
        });
        return rule ? rule.position : null;
    }
    static async create(userId, attributes) {
        helpers_1.assert(typeof attributes.actions !== 'undefined', 'rule must have at least one action');
        helpers_1.assert(attributes.actions.length > 0, 'rule must have at least one action');
        helpers_1.assert(typeof attributes.conditions !== 'undefined', 'rule must have at least one condition');
        helpers_1.assert(attributes.conditions.length > 0, 'rule must have at least one condition');
        let i = 0;
        for (const action of attributes.actions) {
            attributes.actions[i++] = __1.TransactionRuleAction.cast({ ...action, userId });
        }
        i = 0;
        for (const condition of attributes.conditions) {
            attributes.conditions[i++] = __1.TransactionRuleCondition.cast({ ...condition, userId });
        }
        const rule = TransactionRule_1.repo().create({ ...attributes, userId });
        return await TransactionRule_1.repo().save(rule);
    }
    static async destroy(userId, ruleId) {
        await TransactionRule_1.repo().delete({ id: ruleId, userId });
    }
    static async destroyAll(userId) {
        await TransactionRule_1.repo().delete({ userId });
    }
    static async update(userId, ruleId, fields) {
        await TransactionRule_1.repo().update({ userId, id: ruleId }, fields);
        return helpers_1.unwrap(await TransactionRule_1.find(userId, ruleId));
    }
    // Get categorize rules for which there's at least one action that would
    // categorize with the given categoryId.
    static async getCategorizeRules(userId, categoryId) {
        const qb = TransactionRule_1.repo().createQueryBuilder('rule');
        // Note: we bind a `categorize` variable explicitly because postgres
        // doesn't seem to like that we embed a string directly in there. Oh
        // well.
        return await qb
            .where(`rule.id IN ${qb
            .subQuery()
            .select('action.ruleId')
            .from(__1.TransactionRuleAction, 'action')
            .where('action.type = :categorize')
            .andWhere('action.categoryId = :categoryId')
            .andWhere('action.userId = :userId')
            .getQuery()}`)
            .setParameter('categorize', 'categorize')
            .setParameter('userId', userId)
            .setParameter('categoryId', categoryId)
            .leftJoinAndSelect('rule.actions', 'actions')
            .leftJoinAndSelect('rule.conditions', 'conditions')
            .getMany();
    }
};
TransactionRule.REPO = null;
__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], TransactionRule.prototype, "id", void 0);
__decorate([
    typeorm_1.ManyToOne(() => users_1.default, { cascade: true, onDelete: 'CASCADE', nullable: false }),
    typeorm_1.JoinColumn(),
    __metadata("design:type", users_1.default)
], TransactionRule.prototype, "user", void 0);
__decorate([
    typeorm_1.Column('integer'),
    __metadata("design:type", Number)
], TransactionRule.prototype, "userId", void 0);
__decorate([
    typeorm_1.Column('integer'),
    __metadata("design:type", Number)
], TransactionRule.prototype, "position", void 0);
__decorate([
    typeorm_1.OneToMany(() => __1.TransactionRuleCondition, condition => condition.rule, { cascade: ['insert'] }),
    __metadata("design:type", Array)
], TransactionRule.prototype, "conditions", void 0);
__decorate([
    typeorm_1.OneToMany(() => __1.TransactionRuleAction, action => action.rule, { cascade: ['insert'] }),
    __metadata("design:type", Array)
], TransactionRule.prototype, "actions", void 0);
TransactionRule = TransactionRule_1 = __decorate([
    typeorm_1.Entity('transaction-rule')
], TransactionRule);
exports.default = TransactionRule;
