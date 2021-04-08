import { MigrationInterface, QueryRunner, TableUnique } from 'typeorm';

const COLUMN_NAMES = ['userId', 'year', 'month', 'categoryId'];

export class UniqueBudget1608817798703 implements MigrationInterface {
    public async up(q: QueryRunner): Promise<void> {
        // Add the unique constraint.
        await q.createUniqueConstraint('budget', new TableUnique({ columnNames: COLUMN_NAMES }));
    }

    public async down(q: QueryRunner): Promise<void> {
        // Remove the unique constraint. Unfortunately we cannot rely on a previously defined
        // constraint name to remove it, as a random name will be forced, so we have to compare the
        // column names.
        const table = await q.getTable('budget');
        if (table) {
            for (const uniqueConstraint of table.uniques) {
                if (
                    uniqueConstraint.name &&
                    uniqueConstraint.columnNames instanceof Array &&
                    uniqueConstraint.columnNames.length === COLUMN_NAMES.length &&
                    uniqueConstraint.columnNames.every(col => COLUMN_NAMES.includes(col))
                ) {
                    await q.dropUniqueConstraint('budget', uniqueConstraint.name);
                }
            }
        }
    }
}
