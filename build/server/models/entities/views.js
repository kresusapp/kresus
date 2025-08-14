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
var View_1;
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const helpers_1 = require("../../helpers");
const __1 = require("..");
const users_1 = __importDefault(require("./users"));
const view_accounts_1 = __importDefault(require("./view-accounts"));
let View = View_1 = class View {
    constructor() {
        // whether the user has created the view by itself, or if the backend
        // did. This can be used to discriminate deletable views on the client side.
        this.createdByUser = false;
    }
    static repo() {
        if (View_1.REPO === null) {
            View_1.REPO = (0, __1.getRepository)(View_1);
        }
        return View_1.REPO;
    }
    // Static methods.
    // Doesn't insert anything in db, only creates a new instance and normalizes its fields.
    static cast(args) {
        return View_1.repo().create(args);
    }
    // Subscribers will need to pass the repository (to do things inside a same transaction).
    static async create(userId, attributes, repository) {
        const repo = repository || View_1.repo();
        (0, helpers_1.assert)(typeof attributes.accounts !== 'undefined', 'view must have at least one account');
        (0, helpers_1.assert)(attributes.accounts.length > 0, 'view must have at least one account');
        attributes.accounts = attributes.accounts.map(view_accounts_1.default.cast);
        const view = repo.create({ ...attributes, userId });
        return await repo.save(view);
    }
    static async find(userId, viewId) {
        return await View_1.repo().findOne({
            where: { id: viewId, userId },
            relations: ['accounts'],
        });
    }
    static async exists(userId, viewId) {
        const found = await View_1.find(userId, viewId);
        return !!found;
    }
    static async all(userId) {
        return await View_1.repo().find({ where: { userId }, relations: ['accounts'] });
    }
    static async destroy(userId, viewId) {
        await View_1.repo().delete({ id: viewId, userId });
    }
    static async destroyAll(userId) {
        await View_1.repo().delete({ userId });
    }
    /**
     * This method will destroy any view that does not have any account linked.
     * The method can be called after accounts deletion to ensure no empty
     * view remains.
     */
    static async destroyViewsWithoutAccounts(userId) {
        const qb = View_1.repo().createQueryBuilder('view');
        await qb
            .delete()
            .where(`view.id NOT IN ${qb
            .subQuery()
            .select('viewAccount.viewId', 'view.id')
            .distinct()
            .from(view_accounts_1.default, 'viewAccount')
            .addFrom(View_1, 'view')
            .where('view.id = viewAccount.viewId')
            .andWhere('view.userId = :userId')
            .setParameter('userId', userId)
            .getQuery()}`)
            .andWhere('userId = :userId')
            .setParameter('userId', userId)
            .execute();
    }
    static async update(userId, viewId, fields) {
        // We cannot use View.repo().update due to https://github.com/typeorm/typeorm/issues/8404
        const view = await View_1.find(userId, viewId);
        if (view) {
            if (fields.accounts) {
                // This is a mess but I could not find a way to tell typeorm to automatically remove old view accounts and create the new ones.
                await view_accounts_1.default.destroyFromView(viewId);
                const viewAccounts = [];
                for (const va of fields.accounts) {
                    const entity = await view_accounts_1.default.create({ ...va, viewId });
                    viewAccounts.push(entity);
                }
                view.accounts = viewAccounts;
            }
            if (fields.label) {
                view.label = fields.label;
            }
            await View_1.repo().save(view);
        }
        return (0, helpers_1.unwrap)(view);
    }
};
View.REPO = null;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], View.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => users_1.default, { cascade: true, onDelete: 'CASCADE', nullable: false }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", users_1.default)
], View.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)('integer'),
    __metadata("design:type", Number)
], View.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar'),
    __metadata("design:type", String)
], View.prototype, "label", void 0);
__decorate([
    (0, typeorm_1.Column)('boolean', { default: false }),
    __metadata("design:type", Object)
], View.prototype, "createdByUser", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => view_accounts_1.default, viewAccount => viewAccount.view, { cascade: ['insert'] }),
    __metadata("design:type", Array)
], View.prototype, "accounts", void 0);
View = View_1 = __decorate([
    (0, typeorm_1.Entity)('view')
], View);
exports.default = View;
