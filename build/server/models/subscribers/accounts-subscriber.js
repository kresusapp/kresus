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
exports.AccountsSubscriber = void 0;
const typeorm_1 = require("typeorm");
const accounts_1 = __importDefault(require("../entities/accounts"));
const views_1 = __importDefault(require("../entities/views"));
// eslint new-cap rule does not like decorators. See https://github.com/eslint/typescript-eslint-parser/issues/569
// eslint-disable-next-line new-cap
let AccountsSubscriber = class AccountsSubscriber {
    listenTo() {
        return accounts_1.default;
    }
    /* Creates associated views upon account creation */
    async afterInsert(event) {
        const account = event.entity;
        await views_1.default.create(account.userId, {
            label: account.customLabel || account.label,
            accounts: [
                {
                    accountId: account.id,
                },
            ],
        }, event.manager.getRepository(views_1.default));
    }
    /* Renames associated views after account renaming */
    async afterUpdate(event) {
        const account = event.entity;
        if (!account) {
            return;
        }
        // No need to pass the repository, as there will not be dependencies on newly created
        // entities & entities ids.
        const newLabel = account.customLabel || account.label;
        const allViews = await views_1.default.all(account.userId);
        for (const view of allViews) {
            if (view.accounts.length === 1 && view.accounts[0].accountId === account.id) {
                await views_1.default.update(view.userId, view.id, { label: newLabel });
            }
        }
    }
    /* Deletes views without accounts after account deletion */
    async afterRemove() {
        // When using the destroy method and not the remove method, the entity is not provided in
        // the event, so we cannot filter by userId, but that's fine to do it for all users.
        // See https://github.com/typeorm/typeorm/issues/6876
        await views_1.default.destroyViewsWithoutAccounts();
    }
};
exports.AccountsSubscriber = AccountsSubscriber;
exports.AccountsSubscriber = AccountsSubscriber = __decorate([
    (0, typeorm_1.EventSubscriber)()
], AccountsSubscriber);
