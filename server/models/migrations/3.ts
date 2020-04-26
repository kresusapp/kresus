import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddIsUserDefinedTypeToTransaction1586769077310 implements MigrationInterface {
    public async up(q: QueryRunner): Promise<void> {
        await q.addColumn(
            'transaction',
            new TableColumn({
                name: 'isUserDefinedType',
                type: 'boolean',
                isNullable: false,
                default: false,
            })
        );

        // Mark existing transactions as having a user defined type; we can't
        // know for sure, but assuming it's not user-defined could lead to
        // creation of new duplicates.
        await q.manager.update('transaction', {}, { isUserDefinedType: true });
    }

    public async down(q: QueryRunner): Promise<void> {
        await q.dropColumn('transaction', 'isUserDefinedType');
    }
}
