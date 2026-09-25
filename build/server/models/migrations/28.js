"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddIgnoredDuplicates1786184677412 = void 0;
const typeorm_1 = require("typeorm");
const helpers_1 = require("../helpers");
class AddIgnoredDuplicates1786184677412 {
    async up(q) {
        await q.createTable(new typeorm_1.Table({
            name: 'duplicates-ignored',
            columns: [
                (0, helpers_1.idColumn)(),
                {
                    name: 'userId',
                    type: 'integer',
                },
                {
                    name: 'transactionId',
                    type: 'integer',
                },
                {
                    name: 'otherTransactionId',
                    type: 'integer',
                },
            ],
            foreignKeys: [
                (0, helpers_1.foreignKeyUserId)('duplicates-ignored'),
                (0, helpers_1.foreignKey)('duplicates-ignored-refs-transaction-id', 'transactionId', 'transaction', 'id'),
                (0, helpers_1.foreignKey)('duplicates-ignored-refs-other-transaction-id', 'otherTransactionId', 'transaction', 'id'),
            ],
            uniques: [
                {
                    name: 'unique-ignored-duplicates-pair',
                    columnNames: ['userId', 'transactionId', 'otherTransactionId'],
                },
            ],
        }));
    }
    async down(q) {
        await q.dropTable('duplicates-ignored');
    }
}
exports.AddIgnoredDuplicates1786184677412 = AddIgnoredDuplicates1786184677412;
