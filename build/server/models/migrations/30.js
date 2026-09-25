"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UniqueSetting1789648671402 = void 0;
const typeorm_1 = require("typeorm");
const COLUMN_NAMES = ['userId', 'key'];
class UniqueSetting1789648671402 {
    async up(q) {
        // Settings could have duplicates entries for a same key, this migration fixes it by
        // adding a unique constraint.
        // It is unlikely it existed in an existing database though (there were no concurrent calls)
        // so we don't clean the database before setting the constraint. Also, it would be painful
        // to revert it in the "down" part of this migration.
        await q.createUniqueConstraint('setting', new typeorm_1.TableUnique({ columnNames: COLUMN_NAMES }));
    }
    async down(q) {
        // Remove the unique constraint. Unfortunately we cannot rely on a previously defined
        // constraint name to remove it, as a random name will be forced, so we have to compare the
        // column names.
        const table = await q.getTable('setting');
        if (table) {
            for (const uniqueConstraint of table.uniques) {
                if (uniqueConstraint.name &&
                    uniqueConstraint.columnNames instanceof Array &&
                    uniqueConstraint.columnNames.length === COLUMN_NAMES.length &&
                    uniqueConstraint.columnNames.every(col => COLUMN_NAMES.includes(col))) {
                    await q.dropUniqueConstraint('setting', uniqueConstraint.name);
                }
            }
        }
    }
}
exports.UniqueSetting1789648671402 = UniqueSetting1789648671402;
