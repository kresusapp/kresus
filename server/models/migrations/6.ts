import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import { foreignKey, foreignKeyUserId, idColumn } from '../helpers';

export class AddRules1607288457201 implements MigrationInterface {
    public async up(q: QueryRunner): Promise<void> {
        await q.createTable(
            new Table({
                name: 'transaction-rule',

                columns: [
                    idColumn(),

                    {
                        name: 'userId',
                        type: 'integer',
                    },

                    {
                        name: 'position',
                        type: 'integer',
                    },
                ],

                foreignKeys: [foreignKeyUserId('transaction-rule')],
            })
        );

        await q.createTable(
            new Table({
                name: 'transaction-rule-condition',

                columns: [
                    idColumn(),

                    {
                        name: 'userId',
                        type: 'integer',
                    },

                    {
                        name: 'ruleId',
                        type: 'integer',
                    },

                    {
                        name: 'type',
                        type: 'varchar',
                    },

                    {
                        name: 'value',
                        type: 'varchar',
                    },
                ],

                foreignKeys: [
                    foreignKeyUserId('transaction-rule-condition'),
                    foreignKey(
                        'transaction-rule-condition-refs-transaction-rule-id',
                        'ruleId',
                        'transaction-rule',
                        'id'
                    ),
                ],
            })
        );

        await q.createTable(
            new Table({
                name: 'transaction-rule-action',

                columns: [
                    idColumn(),

                    {
                        name: 'userId',
                        type: 'integer',
                    },

                    {
                        name: 'ruleId',
                        type: 'integer',
                    },

                    {
                        name: 'type',
                        type: 'varchar',
                    },

                    {
                        name: 'categoryId',
                        type: 'integer',
                        isNullable: true,
                        default: null,
                    },
                ],

                foreignKeys: [
                    foreignKeyUserId('transaction-rule-action'),
                    foreignKey(
                        'transaction-rule-action-refs-transaction-rule-id',
                        'ruleId',
                        'transaction-rule',
                        'id'
                    ),
                ],
            })
        );
    }

    public async down(q: QueryRunner): Promise<void> {
        await q.dropTable('transaction-rule-condition');
        await q.dropTable('transaction-rule-action');
        await q.dropTable('transaction-rule');
    }
}
