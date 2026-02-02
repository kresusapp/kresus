import { MigrationInterface, QueryRunner } from 'typeorm';

export class MoveLoginPasswordToFields1756391927839 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // First copy login/password to access_fields (2 requests because SQLite does not support UNION ALL)
        await queryRunner.query(`
            INSERT INTO access_fields ("userId", "accessId", "name", "value")
            SELECT "userId", "id", 'login', "login" FROM access WHERE "login" IS NOT NULL
        `);
        await queryRunner.query(`
            INSERT INTO access_fields ("userId", "accessId", "name", "value")
            SELECT "userId", "id", 'password', "password" FROM access WHERE "password" IS NOT NULL
        `);

        // Remove columns from access.

        // SQLite will remove the table and recreate it, removing access
        // fields in CASCADE. Disable the foreign keys checks beforehand and re-enable them afterwards.
        // However, doing the "PRAGMA foreign_keys" thing in a transaction is a no-op
        // (see https://www.sqlite.org/pragma.html), so we commit the transaction first.
        const dbType = queryRunner.connection.driver.options.type;
        const isSqlite = dbType === 'sqlite' || dbType === 'better-sqlite3';
        let isInATransaction = false;

        if (isSqlite) {
            try {
                await queryRunner.commitTransaction();

                isInATransaction = true;

                // eslint-disable-next-line no-empty
            } catch (ignore) {}

            await queryRunner.query('PRAGMA foreign_keys = OFF');
        }

        await queryRunner.dropColumns('access', ['login', 'password']);

        if (isSqlite) {
            await queryRunner.query('PRAGMA foreign_keys = ON');

            if (isInATransaction) {
                try {
                    await queryRunner.startTransaction();
                    // eslint-disable-next-line no-empty
                } catch (ignore) {}
            }
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // SQLite does not support two add columns in one query.
        await queryRunner.query(`ALTER TABLE access ADD COLUMN "login" varchar`);
        await queryRunner.query(`ALTER TABLE access ADD COLUMN "password" varchar`);

        await queryRunner.query(`
            UPDATE access
            SET "login" = (
                SELECT "value" FROM access_fields
                WHERE access_fields.accessId = access.id AND access_fields.name = 'login'
                LIMIT 1
            ), "password" = (
                SELECT "value" FROM access_fields
                WHERE access_fields.accessId = access.id AND access_fields.name = 'password'
                LIMIT 1
            )
        `);

        await queryRunner.query(`
            DELETE FROM access_fields WHERE "name" = 'login' OR "name" = 'password'
        `);
    }
}
