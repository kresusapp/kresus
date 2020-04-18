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
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
let User = class User {
    // Static methods.
    static async create(attributes) {
        const user = repo().create(attributes);
        return await repo().save(user);
    }
    static async find(userId) {
        return await repo().findOne(userId);
    }
    static async all() {
        return await repo().find();
    }
    static async destroy(userId) {
        await repo().delete({ id: userId });
    }
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], User.prototype, "id", void 0);
__decorate([
    typeorm_1.Column('varchar'),
    __metadata("design:type", String)
], User.prototype, "login", void 0);
User = __decorate([
    typeorm_1.Entity('user')
], User);
exports.default = User;
let REPO = null;
function repo() {
    if (REPO === null) {
        REPO = typeorm_1.getRepository(User);
    }
    return REPO;
}
