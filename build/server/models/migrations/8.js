"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UniqueBudget1608817798703 = void 0;
const typeorm_1 = require("typeorm");
const COLUMN_NAMES = ['userId', 'year', 'month', 'categoryId'];
class UniqueBudget1608817798703 {
    async up(q) {
        // Add the unique constraint.
        await q.createUniqueConstraint('budget', new typeorm_1.TableUnique({ columnNames: COLUMN_NAMES }));
    }
    async down(q) {
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
                }
            }
        }
    }
}
exports.UniqueBudget1608817798703 = UniqueBudget1608817798703;
