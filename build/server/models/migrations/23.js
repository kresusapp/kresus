"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddViews1734262035140 = void 0;
const typeorm_1 = require("typeorm");
const helpers_1 = require("../helpers");
const accounts_1 = __importDefault(require("../entities/accounts"));
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
        for (const acc of allAccounts) {
            // Don't use View.create: TypeORM's entity manager (q.manager) uses the current database
            // schema, which is only updated after the migration finishes, so the view table is not
            // yet known to the ORM, View.create will fail with "relation does not exist".
            // Insert into view table
            const result = await q.query(`INSERT INTO view ("userId", "label", "createdByUser") VALUES ($1, $2, $3) RETURNING id`, [acc.userId, acc.customLabel || acc.label, false]);
            // Postgresql returns an array whereas SQLite return the inserted id.
            const viewId = result instanceof Array ? result[0].id : result;
            // Insert into view-accounts table
            await q.query(`INSERT INTO "view-accounts" ("viewId", "accountId") VALUES ($1, $2)`, [
                viewId,
                acc.id,
            ]);
        }
    }
    async down(q) {
        await q.dropTable('view-accounts');
        await q.dropTable('view');
    }
}
exports.AddViews1734262035140 = AddViews1734262035140;
