import { type MigrationInterface, type QueryRunner, Table } from 'typeorm';
import { foreignKey, foreignKeyUserId, idColumn } from '../helpers';

export class AddIgnoredDuplicates1786184677412 implements MigrationInterface {
    public async up(q: QueryRunner): Promise<void> {
        await q.createTable(
            new Table({
                name: 'duplicates-ignored',

                columns: [
                    idColumn(),

                    {
                        name: 'userId',
                        type: 'integer',
                    },

                    {
                        name: 'transactionId',
                        type: 'integer',
                    },

                    {
                        name: 'otherTransactionId',
                        type: 'integer',
                    },
                ],

                foreignKeys: [
                    foreignKeyUserId('duplicates-ignored'),
                    foreignKey(
                        'duplicates-ignored-refs-transaction-id',
                        'transactionId',
                        'transaction',
                        'id'
                    ),
                    foreignKey(
                        'duplicates-ignored-refs-other-transaction-id',
                        'otherTransactionId',
                        'transaction',
                        'id'
                    ),
                ],

                uniques: [
                    {
                        name: 'unique-ignored-duplicates-pair',
                        columnNames: ['userId', 'transactionId', 'otherTransactionId'],
                    },
                ],
            })
        );
    }

    public async down(q: QueryRunner): Promise<void> {
        await q.dropTable('duplicates-ignored');
    }
}
