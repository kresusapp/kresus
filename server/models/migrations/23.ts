import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import { foreignKey, foreignKeyUserId, idColumn, isSqlite } from '../helpers';
import Account from '../entities/accounts';

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

        const isSqliteDriver = isSqlite(q.connection);

        // For each existing account, create a view with this account.
        const allAccounts = await q.manager.find(Account);
        for (const acc of allAccounts) {
            // Don't use View.create: TypeORM's entity manager (q.manager) uses the current database
            // schema, which is only updated after the migration finishes, so the view table is not
            // yet known to the ORM, View.create will fail with "relation does not exist".

            if (isSqliteDriver) {
                // better-sqlite3 uses ? placeholders and returns lastInsertRowid as a BigInt.
                const result = await q.query(
                    `INSERT INTO view ("userId", "label", "createdByUser") VALUES (?, ?, ?)`,
                    [acc.userId, acc.customLabel || acc.label, 0]
                );
                const viewId = Number(result);

                await q.query(`INSERT INTO "view-accounts" ("viewId", "accountId") VALUES (?, ?)`, [
                    viewId,
                    acc.id,
                ]);
            } else {
                // postgres uses $n placeholders and returns a structured object.
                const result = await q.query(
                    `INSERT INTO view ("userId", "label", "createdByUser") VALUES ($1, $2, $3) RETURNING id`,
                    [acc.userId, acc.customLabel || acc.label, false]
                );
                const viewId = result[0].id;

                await q.query(
                    `INSERT INTO "view-accounts" ("viewId", "accountId") VALUES ($1, $2)`,
                    [viewId, acc.id]
                );
            }
        }
    }

    public async down(q: QueryRunner): Promise<void> {
        await q.dropTable('view-accounts');
        await q.dropTable('view');
    }
}
