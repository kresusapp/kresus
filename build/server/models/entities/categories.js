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
var Category_1;
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const users_1 = __importDefault(require("./users"));
const helpers_1 = require("../../helpers");
let Category = Category_1 = class Category {
    constructor() {
        // Hexadecimal RGB format.
        this.color = null;
    }
    static repo() {
        if (Category_1.REPO === null) {
            Category_1.REPO = (0, typeorm_1.getRepository)(Category_1);
        }
        return Category_1.REPO;
    }
    static async find(userId, categoryId) {
        return await Category_1.repo().findOne({ where: { id: categoryId, userId } });
    }
    static async exists(userId, categoryId) {
        const found = await Category_1.find(userId, categoryId);
        return !!found;
    }
    static async all(userId) {
        return await Category_1.repo().find({ userId });
    }
    // Doesn't insert anything in db, only creates a new instance and normalizes its fields.
    static cast(args) {
        return Category_1.repo().create(args);
    }
    static async create(userId, attributes) {
        const category = Category_1.repo().create({ ...attributes, userId });
        return await Category_1.repo().save(category);
    }
    // Make sure to update attached rules as well!
    static async destroy(userId, categoryId) {
        await Category_1.repo().delete({ id: categoryId, userId });
    }
    static async destroyAll(userId) {
        await Category_1.repo().delete({ userId });
    }
    static async update(userId, categoryId, fields) {
        await Category_1.repo().update({ userId, id: categoryId }, fields);
        return (0, helpers_1.unwrap)(await Category_1.find(userId, categoryId));
    }
};
Category.REPO = null;
// Static methods
Category.renamings = {
    title: 'label',
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Category.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => users_1.default, { cascade: true, onDelete: 'CASCADE', nullable: false }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", users_1.default)
], Category.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)('integer'),
    __metadata("design:type", Number)
], Category.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar'),
    __metadata("design:type", String)
], Category.prototype, "label", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { nullable: true, default: null }),
    __metadata("design:type", Object)
], Category.prototype, "color", void 0);
Category = Category_1 = __decorate([
    (0, typeorm_1.Entity)('category')
], Category);
exports.default = Category;
