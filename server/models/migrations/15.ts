import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveVendorIdInAccount1654086373481 implements MigrationInterface {
    async up(q: QueryRunner): Promise<void> {
        await q.dropColumn('account', 'vendorId');
    }

    async down(): Promise<void> {
        // Empty
    }
}
