import { MigrationInterface, QueryRunner } from 'typeorm';

// Banks update, 2021-05-26
export class BanksUpdate1622062715989 implements MigrationInterface {
    public async up(_q: QueryRunner): Promise<void> {
        // Used to be a bank data migration, removed in #3192.
    }

    public async down(): Promise<void> {
        // Empty
    }
}
