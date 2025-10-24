"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddViewIdInBudget1737381056464 = void 0;
const typeorm_1 = require("typeorm");
const helpers_1 = require("../helpers");
const helpers_2 = require("../../helpers");
const settings_1 = require("../../shared/settings");
const users_1 = __importDefault(require("../entities/users"));
const settings_2 = __importDefault(require("../entities/settings"));
const views_1 = __importDefault(require("../entities/views"));
const accounts_1 = __importDefault(require("../entities/accounts"));
const log = (0, helpers_2.makeLogger)('controllers/categories');
const LEGACY_COLUMN_NAMES = ['userId', 'year', 'month', 'categoryId'];
const COLUMN_NAMES = ['userId', 'viewId', 'year', 'month', 'categoryId'];
class AddViewIdInBudget1737381056464 {
    static async guessDefaultAccount(q, userId) {
        const allAccounts = await q.manager.find(accounts_1.default, {
            select: ['id', 'type'],
            where: {
                userId,
            },
        });
        // Find the first checking account if present otherwise use the first account id found.
        const bestGuessAccount = allAccounts.find(acc => acc.type === 'account-type.checking') || allAccounts[0];
        if (!bestGuessAccount) {
            return -1;
        }
        return bestGuessAccount.id;
    }
    async up(q) {
        const views = await q.manager.find(views_1.default, {
            relations: ['accounts'],
        });
        await q.addColumn('budget', new typeorm_1.TableColumn({
            name: 'viewId',
            type: 'integer',
            isNullable: false,
            // Set it to the first existing view id now, and set it by user later
            default: views.length ? views[0].id : 0,
        }));
        // Remove the previous unique constraint. Unfortunately we cannot rely on a previously defined
        // constraint name to remove it, as a random name will be forced, so we have to compare the
        // column names.
        const table = await q.getTable('budget');
        if (table) {
            for (const uniqueConstraint of table.uniques) {
                if (uniqueConstraint.name &&
                    uniqueConstraint.columnNames instanceof Array &&
                    uniqueConstraint.columnNames.length === LEGACY_COLUMN_NAMES.length &&
                    uniqueConstraint.columnNames.every(col => LEGACY_COLUMN_NAMES.includes(col))) {
                    await q.dropUniqueConstraint('budget', uniqueConstraint.name);
                    break;
                }
            }
        }
        // Add the unique constraint.
        await q.createUniqueConstraint('budget', new typeorm_1.TableUnique({ columnNames: COLUMN_NAMES }));
        // Add foreign key
        await q.createForeignKey('budget', new typeorm_1.TableForeignKey((0, helpers_1.foreignKey)('budget_ref_view_id', 'viewId', 'view', 'id', {
            onDelete: 'CASCADE',
        })));
        // For each user, retrieve the current default account id.
        const users = await q.manager.find(users_1.default, {
            select: ['id'],
        });
        const usersDefaultAccountIds = new Map();
        const defaultAccountSettings = await q.manager.find(settings_2.default, {
            where: {
                key: settings_1.DEFAULT_ACCOUNT_ID,
            },
        });
        for (const setting of defaultAccountSettings) {
            if (!setting.value) {
                continue;
            }
            usersDefaultAccountIds.set(setting.userId, parseInt(setting.value, 10));
        }
        // For each user, set the right view id for the budgets.
        for (const usr of users) {
            let accountId = -1;
            if (usersDefaultAccountIds.has(usr.id)) {
                accountId = usersDefaultAccountIds.get(usr.id);
            }
            else {
                accountId = await AddViewIdInBudget1737381056464.guessDefaultAccount(q, usr.id);
            }
            const matchedAccountView = accountId !== -1
                ? views.find(v => v.accounts.length === 1 && v.accounts[0].accountId === accountId)
                : null;
            if (!matchedAccountView) {
                log.warn(`Could not find any default view to apply to existing budgets for user ${usr.id}. Will delete all budgets from this user.`);
                await q.manager.delete('budget', { userId: usr.id });
                continue;
            }
            await q.manager.update('budget', {
                userId: usr.id,
            }, { viewId: matchedAccountView.id });
        }
    }
    async down(q) {
        // Remove foreign key
        await q.dropForeignKey('budget', new typeorm_1.TableForeignKey({
            columnNames: ['viewId'],
            referencedColumnNames: ['id'],
            referencedTableName: 'view',
            onDelete: 'CASCADE',
        }));
        // Remove the unique constraint. Unfortunately we cannot rely on a previously defined
        // constraint name to remove it, as a random name will be forced, so we have to compare the
        // column names.
        const table = await q.getTable('budget');
        if (table) {
            for (const uniqueConstraint of table.uniques) {
                if (uniqueConstraint.name &&
                    uniqueConstraint.columnNames instanceof Array &&
                    uniqueConstraint.columnNames.length === COLUMN_NAMES.length &&
                    uniqueConstraint.columnNames.every(col => COLUMN_NAMES.includes(col))) {
                    await q.dropUniqueConstraint('budget', uniqueConstraint.name);
                    break;
                }
            }
        }
        // Add the unique constraint.
        await q.createUniqueConstraint('budget', new typeorm_1.TableUnique({ columnNames: LEGACY_COLUMN_NAMES }));
        await q.dropColumn('budget', 'viewId');
    }
}
exports.AddViewIdInBudget1737381056464 = AddViewIdInBudget1737381056464;
