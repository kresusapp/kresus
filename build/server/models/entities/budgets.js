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
const __1 = require("..");
const users_1 = __importDefault(require("./users"));
const categories_1 = __importDefault(require("./categories"));
const views_1 = __importDefault(require("./views"));
const helpers_1 = require("../../helpers");
const helpers_2 = require("../helpers");
let Budget = Budget_1 = class Budget {
    constructor() {
        // Threshold used in the budget section, defined by the user.
        this.threshold = null;
    }
    static repo() {
        if (Budget_1.REPO === null) {
            Budget_1.REPO = (0, __1.getRepository)(Budget_1);
        }
        return Budget_1.REPO;
    }
    // Static methods.
    static async all(userId) {
        return await Budget_1.repo().findBy({ userId });
    }
    // Doesn't insert anything in db, only creates a new instance and normalizes its fields.
    static cast(args) {
        return Budget_1.repo().create(args);
    }
    static async create(userId, attributes) {
        const entity = Budget_1.repo().create({ ...attributes, userId });
        return await Budget_1.repo().save(entity);
    }
    static async destroy(userId, budgetId) {
        await Budget_1.repo().delete({ id: budgetId, userId });
    }
    static async byCategory(userId, viewId, categoryId) {
        return await Budget_1.repo().findBy({ userId, viewId, categoryId });
    }
    static async byYearAndMonth(userId, viewId, year, month) {
        return await Budget_1.repo().findBy({ userId, viewId, year, month });
    }
    static async byCategoryAndYearAndMonth(userId, viewId, categoryId, year, month) {
        return await Budget_1.repo().findOne({ where: { userId, viewId, categoryId, year, month } });
    }
    static async findAndUpdate(userId, viewId, categoryId, year, month, threshold) {
        const budget = await Budget_1.byCategoryAndYearAndMonth(userId, viewId, categoryId, year, month);
        if (budget === null) {
            throw new Error('budget not found');
        }
        return await Budget_1.update(userId, budget.id, { threshold });
    }
    static async replaceForCategory(userId, deletedCategoryId, replacementCategoryId) {
        const budgets = await Budget_1.repo().findBy({ userId, categoryId: deletedCategoryId });
        for (const budget of budgets) {
            const replacementCategoryBudget = await Budget_1.byCategoryAndYearAndMonth(userId, budget.viewId, replacementCategoryId, budget.year, budget.month);
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
                    threshold: budget.threshold,
                });
            }
            // No need to destroy the budget for the previous category otherwise: it will be done
            // in cascade on category deletion.
        }
    }
    static async destroyAll(userId) {
        await Budget_1.repo().delete({ userId });
    }
    static async find(userId, budgetId) {
        return await Budget_1.repo().findOne({ where: { id: budgetId, userId } });
    }
    static async exists(userId, budgetId) {
        const found = await Budget_1.find(userId, budgetId);
        return !!found;
    }
    static async update(userId, budgetId, fields) {
        await Budget_1.repo().update({ userId, id: budgetId }, fields);
        return (0, helpers_1.unwrap)(await Budget_1.find(userId, budgetId));
    }
};
Budget.REPO = null;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Budget.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => users_1.default, { cascade: true, onDelete: 'CASCADE', nullable: false }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", users_1.default)
], Budget.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)('integer'),
    __metadata("design:type", Number)
], Budget.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => views_1.default, { cascade: true, onDelete: 'CASCADE', nullable: false }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", views_1.default)
], Budget.prototype, "view", void 0);
__decorate([
    (0, typeorm_1.Column)('integer'),
    __metadata("design:type", Number)
], Budget.prototype, "viewId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => categories_1.default, { cascade: true, onDelete: 'CASCADE', nullable: false }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", categories_1.default)
], Budget.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)('integer'),
    __metadata("design:type", Number)
], Budget.prototype, "categoryId", void 0);
__decorate([
    (0, typeorm_1.Column)('numeric', { nullable: true, transformer: new helpers_2.ForceNumericColumn() }),
    __metadata("design:type", Object)
], Budget.prototype, "threshold", void 0);
__decorate([
    (0, typeorm_1.Column)('int'),
    __metadata("design:type", Number)
], Budget.prototype, "year", void 0);
__decorate([
    (0, typeorm_1.Column)('int'),
    __metadata("design:type", Number)
], Budget.prototype, "month", void 0);
Budget = Budget_1 = __decorate([
    (0, typeorm_1.Entity)('budget'),
    (0, typeorm_1.Unique)(['userId', 'viewId', 'year', 'month', 'categoryId'])
], Budget);
exports.default = Budget;
