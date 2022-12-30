import { MigrationInterface, QueryRunner, Table, TableColumn } from 'typeorm';
import { foreignKey, foreignKeyUserId, idColumn } from '../helpers';

export class AddRecurringTransactions1671005821717 implements MigrationInterface {
    public async up(q: QueryRunner): Promise<void> {
        await q.createTable(
            new Table({
                name: 'recurring-transaction',

                columns: [
                    idColumn(),

                    {
                        name: 'userId',
                        type: 'integer',
                    },

                    {
                        name: 'accountId',
                        type: 'integer',
                    },

                    {
                        name: 'type',
                        type: 'varchar',
                    },

                    {
                        name: 'label',
                        type: 'varchar',
                    },

                    {
                        name: 'amount',
                        type: 'numeric',
                    },

                    {
                        name: 'dayOfMonth',
                        type: 'integer',
                    },

                    {
                        name: 'listOfMonths',
                        type: 'varchar',
                        default: "'all'",
                    },
                ],

                foreignKeys: [
                    foreignKeyUserId('recurring-transaction'),
                    foreignKey(
                        'recurring-transaction-refs-account-id',
                        'accountId',
                        'account',
                        'id'
                    ),
                ],
            })
        );

        await q.createTable(
            new Table({
                name: 'applied-recurring-transaction',

                columns: [
                    idColumn(),

                    {
                        name: 'userId',
                        type: 'integer',
                    },

                    {
                        name: 'recurringTransactionId',
                        type: 'integer',
                    },

                    {
                        name: 'accountId',
                        type: 'integer',
                    },

                    {
                        name: 'month',
                        type: 'integer',
                    },

                    {
                        name: 'year',
                        type: 'integer',
                    },
                ],

                foreignKeys: [
                    foreignKeyUserId('applied-recurring-transaction'),
                    foreignKey(
                        'applied-recurring-transaction-refs-recurring-transaction-id',
                        'recurringTransactionId',
                        'recurring-transaction',
                        'id'
                    ),
                    foreignKey(
                        'applied-recurring-transaction-refs-account-id',
                        'accountId',
                        'account',
                        'id'
                    ),
                ],
            })
        );

        await q.addColumn(
            'transaction',
            new TableColumn({
                name: 'isRecurrentTransaction',
                type: 'boolean',
                isNullable: false,
                default: false,
            })
        );

        await q.manager.update('transaction', {}, { isRecurrentTransaction: false });
    }

    public async down(q: QueryRunner): Promise<void> {
        await q.dropTable('recurring-transaction');
        await q.dropTable('applied-recurring-transaction');
        await q.dropColumn('transaction', 'isRecurrentTransaction');
    }
}
