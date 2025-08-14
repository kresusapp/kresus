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
var User_1;
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const __1 = require("..");
let User = User_1 = class User {
    constructor() {
        // True if the user can see server logs, etc.
        this.isAdmin = false;
    }
    static repo() {
        if (User_1.REPO === null) {
            User_1.REPO = (0, __1.getRepository)(User_1);
        }
        return User_1.REPO;
    }
    // Static methods.
    static async create(attributes) {
        const user = User_1.repo().create(attributes);
        return await User_1.repo().save(user);
    }
    static async find(userId) {
        return await User_1.repo().findOneBy({ id: userId });
    }
    static async findByLogin(login) {
        return await User_1.repo().findOneBy({ login });
    }
    static async all() {
        return await User_1.repo().find();
    }
    static async destroy(userId) {
        await User_1.repo().delete({ id: userId });
    }
};
User.REPO = null;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], User.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar'),
    __metadata("design:type", String)
], User.prototype, "login", void 0);
__decorate([
    (0, typeorm_1.Column)('boolean', { default: false }),
    __metadata("design:type", Object)
], User.prototype, "isAdmin", void 0);
User = User_1 = __decorate([
    (0, typeorm_1.Entity)('user')
], User);
exports.default = User;
