"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddRules1607288457201 = void 0;
const typeorm_1 = require("typeorm");
const helpers_1 = require("../helpers");
class AddRules1607288457201 {
    async up(q) {
        await q.createTable(new typeorm_1.Table({
            name: 'transaction-rule',
            columns: [
                helpers_1.idColumn(),
                {
                    name: 'userId',
                    type: 'integer',
                },
                {
                    name: 'position',
                    type: 'integer',
                },
            ],
            foreignKeys: [helpers_1.foreignKeyUserId('transaction-rule')],
        }));
        await q.createTable(new typeorm_1.Table({
            name: 'transaction-rule-condition',
            columns: [
                helpers_1.idColumn(),
                {
                    name: 'userId',
                    type: 'integer',
                },
                {
                    name: 'ruleId',
                    type: 'integer',
                },
                {
                    name: 'type',
                    type: 'varchar',
                },
                {
                    name: 'value',
                    type: 'varchar',
                },
            ],
            foreignKeys: [
                helpers_1.foreignKeyUserId('transaction-rule-condition'),
                helpers_1.foreignKey('transaction-rule-condition-refs-transaction-rule-id', 'ruleId', 'transaction-rule', 'id'),
            ],
        }));
        await q.createTable(new typeorm_1.Table({
            name: 'transaction-rule-action',
            columns: [
                helpers_1.idColumn(),
                {
                    name: 'userId',
                    type: 'integer',
                },
                {
                    name: 'ruleId',
                    type: 'integer',
                },
                {
                    name: 'type',
                    type: 'varchar',
                },
                {
                    name: 'categoryId',
                    type: 'integer',
                    isNullable: true,
                    default: null,
                },
            ],
            foreignKeys: [
                helpers_1.foreignKeyUserId('transaction-rule-action'),
                helpers_1.foreignKey('transaction-rule-action-refs-transaction-rule-id', 'ruleId', 'transaction-rule', 'id'),
            ],
        }));
    }
    async down(q) {
        await q.dropTable('transaction-rule-condition');
        await q.dropTable('transaction-rule-action');
        await q.dropTable('transaction-rule');
    }
}
exports.AddRules1607288457201 = AddRules1607288457201;
