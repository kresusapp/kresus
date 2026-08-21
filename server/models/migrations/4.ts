import type { MigrationInterface, QueryRunner } from 'typeorm';

// Banks update, 2020-04-14
export class BanksUpdate1586890559919 implements MigrationInterface {
    public async up(_q: QueryRunner): Promise<void> {
        // Used to be a bank data migration, removed in #3192.
    }

    public async down(): Promise<void> {
        // Empty
    }
}
