import { MigrationInterface, QueryRunner } from 'typeorm';

export class SetDefaultBalance1648536789093 implements MigrationInterface {
    public async up(_q: QueryRunner): Promise<void> {
        // No-op: used to set the default balance based on the computed balance, but this is mostly
        // wrong nowadays. Removed in #3192.
    }

    public async down(): Promise<void> {
        // Empty
    }
}
