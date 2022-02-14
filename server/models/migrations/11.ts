import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddBalanceInAccount1631037503295 implements MigrationInterface {
    async up(q: QueryRunner): Promise<void> {
        await q.addColumn(
            'account',
            new TableColumn({
                name: 'balance',
                type: 'numeric',
                isNullable: true,
                default: null,
            })
        );
    }

    async down(q: QueryRunner): Promise<void> {
        await q.dropColumn('account', 'balance');
    }
}
