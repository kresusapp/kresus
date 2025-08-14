import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import { foreignKey, foreignKeyUserId, idColumn } from '../helpers';
import Account from '../entities/accounts';
import View from '../entities/views';

export class AddViews1734262035140 implements MigrationInterface {
    public async up(q: QueryRunner): Promise<void> {
        await q.createTable(
            new Table({
                name: 'view',

                columns: [
                    idColumn(),

                    {
                        name: 'userId',
                        type: 'integer',
                    },

                    {
                        name: 'label',
                        type: 'varchar',
                    },

                    {
                        name: 'createdByUser',
                        type: 'boolean',
                    },
                ],

                foreignKeys: [foreignKeyUserId('view')],
            })
        );

        await q.createTable(
            new Table({
                name: 'view-accounts',

                columns: [
                    idColumn(),

                    {
                        name: 'viewId',
                        type: 'integer',
                    },

                    {
                        name: 'accountId',
                        type: 'integer',
                    },
                ],

                foreignKeys: [
                    foreignKey('view-accounts-refs-view-id', 'viewId', 'view', 'id'),
                    foreignKey('view-accounts-refs-account-id', 'accountId', 'account', 'id'),
                ],
            })
        );

        // For each existing account, create a view with this account.
        const allAccounts = await q.manager.find(Account);
        allAccounts.forEach(async acc => {
            await View.create(acc.userId, {
                label: acc.customLabel || acc.label,
                accounts: [
                    {
                        accountId: acc.id,
                    },
                ],
            });
        });
    }

    public async down(q: QueryRunner): Promise<void> {
        await q.dropTable('view-accounts');
        await q.dropTable('view');
    }
}
