import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

// Add a new column "session" that contains a serialized JSON object containing
// the current cookie/session store for a bank backend.

export class AddSessionInAccess1585594463828 implements MigrationInterface {
    async up(q: QueryRunner): Promise<void> {
        await q.addColumn(
            'access',
            new TableColumn({
                name: 'session',
                type: 'varchar',
                isNullable: true,
                default: null,
            })
        );
    }

    async down(q: QueryRunner): Promise<void> {
        await q.dropColumn('access', 'session');
    }
}
