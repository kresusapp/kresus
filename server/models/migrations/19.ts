import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

// Add the "isOrphan" column to accounts.
export class AddIsOrphanColumn1704905841767 implements MigrationInterface {
    public async up(q: QueryRunner): Promise<void> {
        await q.addColumn(
            'account',
            new TableColumn({
                name: 'isOrphan',
                type: 'boolean',
                isNullable: false,
                default: false,
            })
        );
    }

    public async down(): Promise<void> {
        // Empty
    }
}
