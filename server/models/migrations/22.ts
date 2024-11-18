import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

// Add the "excludeFromPoll" column to accesses.
export class addExcludeFromSync1731961575709 implements MigrationInterface {
    public async up(q: QueryRunner): Promise<void> {
        await q.addColumn(
            'access',
            new TableColumn({
                name: 'excludeFromPoll',
                type: 'boolean',
                isNullable: false,
                default: false,
            })
        );
    }

    public async down(q: QueryRunner): Promise<void> {
        await q.dropColumn('access', 'excludeFromPoll');
    }
}
