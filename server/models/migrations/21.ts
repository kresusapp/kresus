import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

// Add the "gracePeriod" column to accounts
export class addGracePeriod1727285965918 implements MigrationInterface {
    public async up(q: QueryRunner): Promise<void> {
        await q.addColumn(
            'account',
            new TableColumn({
                name: 'gracePeriod',
                type: 'numeric',
                isNullable: false,
                default: 0,
            })
        );
    }

    public async down(q: QueryRunner): Promise<void> {
        await q.dropColumn('account', 'gracePeriod');
    }
}
