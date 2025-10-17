"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccessesSubscriber = void 0;
const typeorm_1 = require("typeorm");
const accesses_1 = __importDefault(require("../entities/accesses"));
const views_1 = __importDefault(require("../entities/views"));
// eslint new-cap rule does not like decorators. See https://github.com/eslint/typescript-eslint-parser/issues/569
// eslint-disable-next-line new-cap
let AccessesSubscriber = class AccessesSubscriber {
    listenTo() {
        return accesses_1.default;
    }
    /* Deletes views without accounts after access deletion (the cascade does not call any account
    subscription) */
    async afterRemove() {
        // When using the destroy method and not the remove method, the entity is not provided in
        // the event, so we cannot filter by userId, but that's fine to do it for all users.
        // See https://github.com/typeorm/typeorm/issues/6876
        await views_1.default.destroyViewsWithoutAccounts();
    }
};
exports.AccessesSubscriber = AccessesSubscriber;
exports.AccessesSubscriber = AccessesSubscriber = __decorate([
    (0, typeorm_1.EventSubscriber)()
], AccessesSubscriber);
