import type { MigrationInterface, QueryRunner } from 'typeorm';

// Banks update, 2023-09-26
export class BanksUpdate1695709108939 implements MigrationInterface {
    public async up(_q: QueryRunner): Promise<void> {
        // Used to be a bank data migration, removed in #3192.
    }

    public async down(): Promise<void> {
        // Empty
    }
}
