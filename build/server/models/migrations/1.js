"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateDb1573504127414 = void 0;
const typeorm_1 = require("typeorm");
const helpers_1 = require("../../helpers");
const helpers_2 = require("../helpers");
class CreateDb1573504127414 {
    async up(q) {
        // User table.
        await q.createTable(new typeorm_1.Table({
            // CREATE TABLE "user"
            name: 'user',
            columns: [
                // "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL
                helpers_2.idColumn(),
                // "login" varchar NOT NULL
                {
                    name: 'login',
                    type: 'varchar',
                },
            ],
        }));
        // Setting table.
        await q.createTable(new typeorm_1.Table({
            // CREATE TABLE "setting"
            name: 'setting',
            columns: [
                // "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                helpers_2.idColumn(),
                // "userId" integer NOT NULL,
                {
                    name: 'userId',
                    type: 'integer',
                },
                // "key" varchar NOT NULL,
                {
                    name: 'key',
                    type: 'varchar',
                },
                // "value" varchar NOT NULL,
                {
                    name: 'value',
                    type: 'varchar',
                },
            ],
            foreignKeys: [
                // CONSTRAINT "setting_ref_user_id" FOREIGN KEY ("userId") REFERENCES "user"
                // ("id") ON DELETE CASCADE ON UPDATE NO ACTION)
                helpers_2.foreignKeyUserId('setting'),
            ],
        }));
        // Access table.
        await q.createTable(new typeorm_1.Table({
            // CREATE TABLE "access"
            name: 'access',
            columns: [
                // "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                helpers_2.idColumn(),
                // "userId" integer NOT NULL,
                {
                    name: 'userId',
                    type: 'integer',
                },
                // "vendorId" varchar NOT NULL,
                {
                    name: 'vendorId',
                    type: 'varchar',
                },
                // "login" varchar NOT NULL.
                {
                    name: 'login',
                    type: 'varchar',
                },
                // "password" varchar.
                {
                    name: 'password',
                    type: 'varchar',
                    isNullable: true,
                    default: null,
                },
                // "fetchStatus" varchar NOT NULL DEFAULT ('OK'),
                {
                    name: 'fetchStatus',
                    type: 'varchar',
                    default: `'${helpers_1.FETCH_STATUS_SUCCESS}'`,
                },
                // "customLabel" varchar
                {
                    name: 'customLabel',
                    type: 'varchar',
                    isNullable: true,
                    default: null,
                },
            ],
            foreignKeys: [
                // CONSTRAINT "access_ref_user_id" FOREIGN KEY ("userId") REFERENCES "user"
                // ("id") ON DELETE CASCADE ON UPDATE NO ACTION)
                helpers_2.foreignKeyUserId('access'),
            ],
        }));
        // Access fields table.
        await q.createTable(new typeorm_1.Table({
            // CREATE TABLE "access_fields"
            name: 'access_fields',
            columns: [
                // "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                helpers_2.idColumn(),
                // "userId" integer NOT NULL,
                {
                    name: 'userId',
                    type: 'integer',
                },
                // "accessid" integer not null,
                {
                    name: 'accessId',
                    type: 'integer',
                },
                // "name" varchar not null,
                {
                    name: 'name',
                    type: 'varchar',
                },
                // "value" varchar NOT NULL,
                {
                    name: 'value',
                    type: 'varchar',
                },
            ],
            foreignKeys: [
                // CONSTRAINT "access_field_ref_user_id" FOREIGN KEY ("userId") REFERENCES
                // "user" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)
                helpers_2.foreignKeyUserId('access_field'),
                // FOREIGN KEY ("accessId") REFERENCES "access" ("id") ON DELETE CASCADE ON
                // UPDATE NO ACTION
                helpers_2.foreignKey('access_field_ref_access_id', 'accessId', 'access', 'id'),
            ],
        }));
        // Category table.
        await q.createTable(new typeorm_1.Table({
            // CREATE TABLE "category"
            name: 'category',
            columns: [
                // "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                helpers_2.idColumn(),
                // "userId" integer NOT NULL,
                {
                    name: 'userId',
                    type: 'integer',
                },
                // "label" varchar NOT NULL
                {
                    name: 'label',
                    type: 'varchar',
                },
                // "color" varchar
                {
                    name: 'color',
                    type: 'varchar',
                    isNullable: true,
                    default: null,
                },
            ],
            foreignKeys: [
                // CONSTRAINT "category_ref_user_id" FOREIGN KEY ("userId") REFERENCES "user"
                // ("id") ON DELETE CASCADE ON UPDATE NO ACTION)
                helpers_2.foreignKeyUserId('category'),
            ],
        }));
        // Account table.
        await q.createTable(new typeorm_1.Table({
            // CREATE TABLE "account"
            name: 'account',
            columns: [
                // "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                helpers_2.idColumn(),
                // "userId" integer NOT NULL,
                {
                    name: 'userId',
                    type: 'integer',
                },
                // "accessId" integer NOT NULL,
                {
                    name: 'accessId',
                    type: 'integer',
                },
                // "vendorId" varchar NOT NULL,
                {
                    name: 'vendorId',
                    type: 'varchar',
                },
                // "vendorAccountId" varchar NOT NULL,
                {
                    name: 'vendorAccountId',
                    type: 'varchar',
                },
                // "type" varchar NOT NULL DEFAULT ('account-type.unknown'),
                {
                    name: 'type',
                    type: 'varchar',
                    default: `'${helpers_1.UNKNOWN_ACCOUNT_TYPE}'`,
                },
                // "importDate" datetime NOT NULL,
                {
                    name: 'importDate',
                    type: helpers_2.datetimeType(q),
                },
                // "initialBalance" numeric NOT NULL,
                {
                    name: 'initialBalance',
                    type: 'numeric',
                },
                // "lastCheckDate" datetime NOT NULL,
                {
                    name: 'lastCheckDate',
                    type: helpers_2.datetimeType(q),
                },
                // "label" varchar NOT NULL,
                {
                    name: 'label',
                    type: 'varchar',
                },
                // "customLabel" varchar,
                {
                    name: 'customLabel',
                    type: 'varchar',
                    isNullable: true,
                    default: null,
                },
                // "iban" varchar,
                {
                    name: 'iban',
                    type: 'varchar',
                    isNullable: true,
                    default: null,
                },
                // "currency" varchar,
                {
                    name: 'currency',
                    type: 'varchar',
                    isNullable: true,
                    default: null,
                },
                // "excludeFromBalance" boolean NOT NULL DEFAULT (0)
                {
                    name: 'excludeFromBalance',
                    type: 'boolean',
                    default: false,
                },
            ],
            foreignKeys: [
                // CONSTRAINT "account_ref_user_id" FOREIGN KEY ("userId") REFERENCES "user"
                // ("id") ON DELETE CASCADE ON UPDATE NO ACTION)
                helpers_2.foreignKeyUserId('account'),
                // CONSTRAINT "account_ref_access_id" FOREIGN KEY ("accessId") REFERENCES
                // "access" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
                helpers_2.foreignKey('account_ref_access_id', 'accessId', 'access', 'id'),
            ],
        }));
        // Transaction table.
        await q.createTable(new typeorm_1.Table({
            // CREATE TABLE "transaction"
            name: 'transaction',
            columns: [
                // "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                helpers_2.idColumn(),
                // "userId" integer NOT NULL,
                {
                    name: 'userId',
                    type: 'integer',
                },
                // "accountId" integer NOT NULL,
                {
                    name: 'accountId',
                    type: 'integer',
                },
                // "categoryId" integer,
                {
                    name: 'categoryId',
                    type: 'integer',
                    isNullable: true,
                    default: null,
                },
                // "type" varchar NOT NULL DEFAULT ('type.unknown'),
                {
                    name: 'type',
                    type: 'varchar',
                    default: `'${helpers_1.UNKNOWN_OPERATION_TYPE}'`,
                },
                // "label" varchar NOT NULL,
                {
                    name: 'label',
                    type: 'varchar',
                },
                // "rawLabel" varchar NOT NULL,
                {
                    name: 'rawLabel',
                    type: 'varchar',
                },
                // "customLabel" varchar,
                {
                    name: 'customLabel',
                    type: 'varchar',
                    isNullable: true,
                    default: null,
                },
                // "date" date NOT NULL,
                {
                    name: 'date',
                    type: helpers_2.datetimeType(q),
                },
                // "importDate" datetime NOT NULL,
                {
                    name: 'importDate',
                    type: helpers_2.datetimeType(q),
                },
                // "budgetDate" date,
                {
                    name: 'budgetDate',
                    type: helpers_2.datetimeType(q),
                    isNullable: true,
                    default: null,
                },
                // "debitDate" date,
                {
                    name: 'debitDate',
                    type: helpers_2.datetimeType(q),
                    isNullable: true,
                    default: null,
                },
                // "amount" numeric NOT NULL,
                {
                    name: 'amount',
                    type: 'numeric',
                },
                // "createdByUser" boolean NOT NULL DEFAULT (0)
                {
                    name: 'createdByUser',
                    type: 'boolean',
                    default: false,
                },
            ],
            foreignKeys: [
                // CONSTRAINT "transaction_ref_user_id" FOREIGN KEY ("userId") REFERENCES
                // "user" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)
                helpers_2.foreignKeyUserId('transaction'),
                // CONSTRAINT "transaction_ref_account_id" FOREIGN KEY ("accountId") REFERENCES
                // "account" ("id") ON DELETE CASCADE ON UPDATE NO ACTION,
                helpers_2.foreignKey('transaction_ref_account_id', 'accountId', 'account', 'id'),
                // CONSTRAINT "transaction_ref_category_id" FOREIGN KEY ("categoryId")
                // REFERENCES "category" ("id") ON DELETE SET NULL ON UPDATE NO ACTION)
                helpers_2.foreignKey('transaction_ref_category_id', 'categoryId', 'category', 'id', {
                    onDelete: 'SET NULL',
                    onUpdate: 'NO ACTION',
                }),
            ],
        }));
        // Alert table.
        await q.createTable(new typeorm_1.Table({
            // CREATE TABLE "alert"
            name: 'alert',
            columns: [
                // "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                helpers_2.idColumn(),
                // "userId" integer NOT NULL,
                {
                    name: 'userId',
                    type: 'integer',
                },
                // "accountId" integer NOT NULL,
                {
                    name: 'accountId',
                    type: 'integer',
                },
                // "type" varchar NOT NULL
                {
                    name: 'type',
                    type: 'varchar',
                },
                // "frequency" varchar,
                {
                    name: 'frequency',
                    type: 'varchar',
                    isNullable: true,
                    default: null,
                },
                // "limit" numeric,
                {
                    name: 'limit',
                    type: 'numeric',
                    isNullable: true,
                    default: null,
                },
                // "order" varchar,
                {
                    name: 'order',
                    type: 'varchar',
                    isNullable: true,
                    default: null,
                },
                // "lastTriggeredDate" datetime NOT NULL
                {
                    name: 'lastTriggeredDate',
                    type: helpers_2.datetimeType(q),
                    isNullable: true,
                    default: null,
                },
            ],
            foreignKeys: [
                // CONSTRAINT "alert_ref_user_id" FOREIGN KEY ("userId") REFERENCES "user"
                // ("id") ON DELETE CASCADE ON UPDATE NO ACTION
                helpers_2.foreignKeyUserId('alert'),
                // CONSTRAINT "alert_ref_account_id" FOREIGN KEY ("accountId") REFERENCES
                // "account" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
                helpers_2.foreignKey('alert_ref_account_id', 'accountId', 'account', 'id'),
            ],
        }));
        // Budget table.
        await q.createTable(new typeorm_1.Table({
            // CREATE TABLE "budget"
            name: 'budget',
            columns: [
                // "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                helpers_2.idColumn(),
                // "userId" integer NOT NULL,
                {
                    name: 'userId',
                    type: 'integer',
                },
                // "categoryId" integer NOT NULL,
                {
                    name: 'categoryId',
                    type: 'integer',
                },
                // "threshold" numeric NOT NULL DEFAULT (0),
                {
                    name: 'threshold',
                    type: 'numeric',
                    isNullable: true,
                    default: null,
                },
                // "year" integer NOT NULL,
                {
                    name: 'year',
                    type: 'integer',
                },
                // "month" integer NOT NULL,
                {
                    name: 'month',
                    type: 'integer',
                },
            ],
            foreignKeys: [
                // CONSTRAINT "budget_ref_user_id" FOREIGN KEY ("userId") REFERENCES "user"
                // ("id") ON DELETE CASCADE ON UPDATE NO ACTION
                helpers_2.foreignKeyUserId('budget'),
                // CONSTRAINT "budget_ref_category_id" FOREIGN KEY ("accountId") REFERENCES
                // "account" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
                helpers_2.foreignKey('budget_ref_category_id', 'categoryId', 'category', 'id'),
            ],
        }));
    }
    async down(q) {
        await q.dropTable('budget');
        await q.dropTable('alert');
        await q.dropTable('transaction');
        await q.dropTable('account');
        await q.dropTable('category');
        await q.dropTable('access_fields');
        await q.dropTable('access');
        await q.dropTable('setting');
        await q.dropTable('user');
    }
}
exports.CreateDb1573504127414 = CreateDb1573504127414;
