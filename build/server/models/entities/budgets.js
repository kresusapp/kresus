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
var Budget_1;
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const users_1 = __importDefault(require("./users"));
const categories_1 = __importDefault(require("./categories"));
const helpers_1 = require("../../helpers");
const helpers_2 = require("../helpers");
const log = helpers_1.makeLogger('models/entities/budget');
let Budget = Budget_1 = class Budget {
    // Static methods.
    static async all(userId) {
        return await repo().find({ userId });
    }
    static async create(userId, attributes) {
        const entity = repo().create({ userId, ...attributes });
        return await repo().save(entity);
    }
    static async destroy(userId, budgetId) {
        await repo().delete({ id: budgetId, userId });
    }
    static async byCategory(userId, categoryId) {
        if (typeof categoryId !== 'number') {
            log.warn(`Budget.byCategory API misuse: ${categoryId}`);
        }
        return await repo().find({ userId, categoryId });
    }
    static async byYearAndMonth(userId, year, month) {
        if (typeof year !== 'number') {
            log.warn('Budget.byYearAndMonth misuse: year must be a number');
        }
        if (typeof month !== 'number') {
            log.warn('Budget.byYearAndMonth misuse: month must be a number');
        }
        return await repo().find({ userId, year, month });
    }
    static async byCategoryAndYearAndMonth(userId, categoryId, year, month) {
        if (typeof categoryId !== 'number') {
            log.warn('Budget.byCategoryAndYearAndMonth misuse: categoryId must be a number');
        }
        if (typeof year !== 'number') {
            log.warn('Budget.byCategoryAndYearAndMonth misuse: year must be a number');
        }
        if (typeof month !== 'number') {
            log.warn('Budget.byCategoryAndYearAndMonth misuse: month must be a number');
        }
        return await repo().findOne({ where: { userId, categoryId, year, month } });
    }
    static async findAndUpdate(userId, categoryId, year, month, threshold) {
        const budget = await Budget_1.byCategoryAndYearAndMonth(userId, categoryId, year, month);
        if (typeof budget === 'undefined') {
            throw new Error('budget not found');
        }
        return await Budget_1.update(userId, budget.id, { threshold });
    }
    static async destroyForCategory(userId, deletedCategoryId, replacementCategoryId) {
        if (!replacementCategoryId) {
            // Just let cascading delete all the budgets for this category.
            return;
        }
        const budgets = await Budget_1.byCategory(userId, deletedCategoryId);
        for (const budget of budgets) {
            const replacementCategoryBudget = await Budget_1.byCategoryAndYearAndMonth(userId, replacementCategoryId, budget.year, budget.month);
            // If there is no budget for the existing replacement category, don't actually delete
            // the current budget, just update its category with the new one.
            if (!replacementCategoryBudget) {
                await Budget_1.update(userId, budget.id, { categoryId: replacementCategoryId });
                // Do not delete the budget we just updated.
                continue;
            }
            if (!replacementCategoryBudget.threshold && budget.threshold) {
                // If there is an existing budget without threshold, use the current threshold.
                await Budget_1.update(userId, replacementCategoryBudget.id, {
                    threshold: budget.threshold
                });
            }
        }
        // Let cascading delete the budgets instances attached to this category.
    }
    static async destroyAll(userId) {
        await repo().delete({ userId });
    }
    static async find(userId, budgetId) {
        return await repo().findOne({ where: { id: budgetId, userId } });
    }
    static async exists(userId, budgetId) {
        const found = await Budget_1.find(userId, budgetId);
        return !!found;
    }
    static async update(userId, budgetId, fields) {
        await repo().update({ userId, id: budgetId }, fields);
        return helpers_1.unwrap(await Budget_1.find(userId, budgetId));
    }
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Object)
], Budget.prototype, "id", void 0);
__decorate([
    typeorm_1.ManyToOne(type => users_1.default, { cascade: true, onDelete: 'CASCADE', nullable: false }),
    typeorm_1.JoinColumn(),
    __metadata("design:type", Object)
], Budget.prototype, "user", void 0);
__decorate([
    typeorm_1.Column('integer'),
    __metadata("design:type", Object)
], Budget.prototype, "userId", void 0);
__decorate([
    typeorm_1.ManyToOne(type => categories_1.default, { cascade: true, onDelete: 'CASCADE', nullable: false }),
    typeorm_1.JoinColumn(),
    __metadata("design:type", Object)
], Budget.prototype, "category", void 0);
__decorate([
    typeorm_1.Column('integer'),
    __metadata("design:type", Object)
], Budget.prototype, "categoryId", void 0);
__decorate([
    typeorm_1.Column('numeric', { nullable: true, transformer: new helpers_2.ForceNumericColumn() }),
    __metadata("design:type", Object)
], Budget.prototype, "threshold", void 0);
__decorate([
    typeorm_1.Column('int'),
    __metadata("design:type", Object)
], Budget.prototype, "year", void 0);
__decorate([
    typeorm_1.Column('int'),
    __metadata("design:type", Object)
], Budget.prototype, "month", void 0);
Budget = Budget_1 = __decorate([
    typeorm_1.Entity('budget')
], Budget);
exports.default = Budget;
let REPO = null;
function repo() {
    if (REPO === null) {
        REPO = typeorm_1.getRepository(Budget);
    }
    return REPO;
}
