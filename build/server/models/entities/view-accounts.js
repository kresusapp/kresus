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
var ViewAccount_1;
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const __1 = require("..");
const accounts_1 = __importDefault(require("./accounts"));
const views_1 = __importDefault(require("./views"));
let ViewAccount = ViewAccount_1 = class ViewAccount {
    static repo() {
        if (ViewAccount_1.REPO === null) {
            ViewAccount_1.REPO = (0, __1.getRepository)(ViewAccount_1);
        }
        return ViewAccount_1.REPO;
    }
    // Static methods.
    // Doesn't insert anything in db, only creates a new instance and normalizes its fields.
    static cast(args) {
        return ViewAccount_1.repo().create(args);
    }
    static async create(attributes) {
        const link = ViewAccount_1.repo().create(attributes);
        return await ViewAccount_1.repo().save(link);
    }
    static async all() {
        return await ViewAccount_1.repo().find();
    }
    static async destroy(linkId) {
        await ViewAccount_1.repo().delete({ id: linkId });
    }
    static async destroyFromView(viewId) {
        await ViewAccount_1.repo().delete({ viewId });
    }
};
ViewAccount.REPO = null;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ViewAccount.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => views_1.default, { cascade: true, onDelete: 'CASCADE', nullable: false }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", views_1.default)
], ViewAccount.prototype, "view", void 0);
__decorate([
    (0, typeorm_1.Column)('integer'),
    __metadata("design:type", Number)
], ViewAccount.prototype, "viewId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => accounts_1.default, { cascade: true, onDelete: 'CASCADE', nullable: false }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", accounts_1.default)
], ViewAccount.prototype, "account", void 0);
__decorate([
    (0, typeorm_1.Column)('integer'),
    __metadata("design:type", Number)
], ViewAccount.prototype, "accountId", void 0);
ViewAccount = ViewAccount_1 = __decorate([
    (0, typeorm_1.Entity)('view-accounts')
], ViewAccount);
exports.default = ViewAccount;
