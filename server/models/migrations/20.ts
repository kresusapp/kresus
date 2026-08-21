import type { MigrationInterface, QueryRunner } from 'typeorm';

// Banks update, 2024-05-02
export class BanksUpdate1714649322180 implements MigrationInterface {
    public async up(_q: QueryRunner): Promise<void> {
        // Used to be a bank data migration, removed in #3192.
    }

    public async down(): Promise<void> {
        // Empty
    }
}
