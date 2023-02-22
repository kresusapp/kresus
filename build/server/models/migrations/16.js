"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddRecurringTransactions1671005821717 = void 0;
const typeorm_1 = require("typeorm");
const helpers_1 = require("../helpers");
class AddRecurringTransactions1671005821717 {
    async up(q) {
        await q.createTable(new typeorm_1.Table({
            name: 'recurring-transaction',
            columns: [
                (0, helpers_1.idColumn)(),
                {
                    name: 'userId',
                    type: 'integer',
                },
                {
                    name: 'accountId',
                    type: 'integer',
                },
                {
                    name: 'type',
                    type: 'varchar',
                },
                {
                    name: 'label',
                    type: 'varchar',
                },
                {
                    name: 'amount',
                    type: 'numeric',
                },
                {
                    name: 'dayOfMonth',
                    type: 'integer',
                },
                {
                    name: 'listOfMonths',
                    type: 'varchar',
                    default: "'all'",
                },
            ],
            foreignKeys: [
                (0, helpers_1.foreignKeyUserId)('recurring-transaction'),
                (0, helpers_1.foreignKey)('recurring-transaction-refs-account-id', 'accountId', 'account', 'id'),
            ],
        }));
        await q.createTable(new typeorm_1.Table({
            name: 'applied-recurring-transaction',
            columns: [
                (0, helpers_1.idColumn)(),
                {
                    name: 'userId',
                    type: 'integer',
                },
                {
                    name: 'recurringTransactionId',
                    type: 'integer',
                },
                {
                    name: 'accountId',
                    type: 'integer',
                },
                {
                    name: 'month',
                    type: 'integer',
                },
                {
                    name: 'year',
                    type: 'integer',
                },
            ],
            foreignKeys: [
                (0, helpers_1.foreignKeyUserId)('applied-recurring-transaction'),
                (0, helpers_1.foreignKey)('applied-recurring-transaction-refs-recurring-transaction-id', 'recurringTransactionId', 'recurring-transaction', 'id'),
                (0, helpers_1.foreignKey)('applied-recurring-transaction-refs-account-id', 'accountId', 'account', 'id'),
            ],
        }));
        await q.addColumn('transaction', new typeorm_1.TableColumn({
            name: 'isRecurrentTransaction',
            type: 'boolean',
            isNullable: false,
            default: false,
        }));
        await q.manager.update('transaction', {}, { isRecurrentTransaction: false });
    }
    async down(q) {
        await q.dropTable('recurring-transaction');
        await q.dropTable('applied-recurring-transaction');
        await q.dropColumn('transaction', 'isRecurrentTransaction');
    }
}
exports.AddRecurringTransactions1671005821717 = AddRecurringTransactions1671005821717;
