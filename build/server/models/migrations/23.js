"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddViews1734262035140 = void 0;
const typeorm_1 = require("typeorm");
const helpers_1 = require("../helpers");
const accounts_1 = __importDefault(require("../entities/accounts"));
const views_1 = __importDefault(require("../entities/views"));
class AddViews1734262035140 {
    async up(q) {
        await q.createTable(new typeorm_1.Table({
            name: 'view',
            columns: [
                (0, helpers_1.idColumn)(),
                {
                    name: 'userId',
                    type: 'integer',
                },
                {
                    name: 'label',
                    type: 'varchar',
                },
                {
                    name: 'createdByUser',
                    type: 'boolean',
                },
            ],
            foreignKeys: [(0, helpers_1.foreignKeyUserId)('view')],
        }));
        await q.createTable(new typeorm_1.Table({
            name: 'view-accounts',
            columns: [
                (0, helpers_1.idColumn)(),
                {
                    name: 'viewId',
                    type: 'integer',
                },
                {
                    name: 'accountId',
                    type: 'integer',
                },
            ],
            foreignKeys: [
                (0, helpers_1.foreignKey)('view-accounts-refs-view-id', 'viewId', 'view', 'id'),
                (0, helpers_1.foreignKey)('view-accounts-refs-account-id', 'accountId', 'account', 'id'),
            ],
        }));
        // For each existing account, create a view with this account.
        const allAccounts = await q.manager.find(accounts_1.default);
        allAccounts.forEach(async (acc) => {
            await views_1.default.create(acc.userId, {
                label: acc.customLabel || acc.label,
                accounts: [
                    {
                        accountId: acc.id,
                    },
                ],
            });
        });
    }
    async down(q) {
        await q.dropTable('view-accounts');
        await q.dropTable('view');
    }
}
exports.AddViews1734262035140 = AddViews1734262035140;
