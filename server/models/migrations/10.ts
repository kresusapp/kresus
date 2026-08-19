import { MigrationInterface, QueryRunner } from 'typeorm';

// Banks update, 2021-08-14
export class BanksUpdate1628960505241 implements MigrationInterface {
    public async up(_q: QueryRunner): Promise<void> {
        // Used to be a bank data migration, removed in #3192.
    }

    public async down(): Promise<void> {
        // Empty
    }
}
