import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

// Add a new column "isAdmin" (boolean) to the User model.

export class AddIsAdminInUser1741675783114 implements MigrationInterface {
    async up(q: QueryRunner): Promise<void> {
        await q.addColumn(
            'user',
            new TableColumn({
                name: 'isAdmin',
                type: 'boolean',
                isNullable: false,
                default: false,
            })
        );

        // Enable current users as administrators.
        await q.query('UPDATE `user` SET `isAdmin` = true');
    }

    async down(q: QueryRunner): Promise<void> {
        await q.dropColumn('isAdmin', 'user');
    }
}
