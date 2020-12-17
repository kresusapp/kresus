import { MigrationInterface, QueryRunner, TableUnique } from 'typeorm';

export class UniqueBudget1608817798703 implements MigrationInterface {
    public async up(q: QueryRunner): Promise<void> {
        // Add the unique constraint.
        await q.createUniqueConstraint(
            'budget',
            new TableUnique({ columnNames: ['userId', 'year', 'month', 'categoryId'] })
        );
    }

    public async down(q: QueryRunner): Promise<void> {
        // Remove the unique constraint.
        await q.dropUniqueConstraint(
            'budget',
            new TableUnique({ columnNames: ['userId', 'year', 'month', 'categoryId'] })
        );
    }
}
