import { Table, MigrationInterface, QueryRunner } from 'typeorm';
import { UNKNOWN_ACCOUNT_TYPE, FETCH_STATUS_SUCCESS, UNKNOWN_OPERATION_TYPE } from '../../helpers';
import { datetimeType } from '../helpers';
import { TableColumnOptions } from 'typeorm/schema-builder/options/TableColumnOptions';
import { TableForeignKeyOptions } from 'typeorm/schema-builder/options/TableForeignKeyOptions';

function idColumn(): TableColumnOptions {
    return {
        name: 'id',
        type: 'integer',
        isPrimary: true,
        isGenerated: true,
        generationStrategy: 'increment',
    };
}

function foreignKey(
    constraintName,
    columnName,
    referencedTableName,
    referencedColumnName,
    cascadeOpts = { onDelete: 'CASCADE', onUpdate: 'NO ACTION' }
): TableForeignKeyOptions {
    return {
        name: constraintName,
        columnNames: [columnName],
        referencedColumnNames: [referencedColumnName],
        referencedTableName,
        ...cascadeOpts,
    };
}

function foreignKeyUserId(tableName): TableForeignKeyOptions {
    return foreignKey(`${tableName}_ref_user_id`, 'userId', 'user', 'id');
}

export class CreateDb1573504127414 implements MigrationInterface {
    async up(q: QueryRunner): Promise<void> {
        // User table.
        await q.createTable(
            new Table({
                // CREATE TABLE "user"
                name: 'user',

                columns: [
                    // "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL
                    idColumn(),

                    // "login" varchar NOT NULL
                    {
                        name: 'login',
                        type: 'varchar',
                    },
                ],
            })
        );

        // Setting table.
        await q.createTable(
            new Table({
                // CREATE TABLE "setting"
                name: 'setting',

                columns: [
                    // "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                    idColumn(),

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
                    foreignKeyUserId('setting'),
                ],
            })
        );

        // Access table.
        await q.createTable(
            new Table({
                // CREATE TABLE "access"
                name: 'access',

                columns: [
                    // "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                    idColumn(),

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
                        default: `'${FETCH_STATUS_SUCCESS}'`,
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
                    foreignKeyUserId('access'),
                ],
            })
        );

        // Access fields table.
        await q.createTable(
            new Table({
                // CREATE TABLE "access_fields"
                name: 'access_fields',

                columns: [
                    // "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                    idColumn(),

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
                    foreignKeyUserId('access_field'),

                    // FOREIGN KEY ("accessId") REFERENCES "access" ("id") ON DELETE CASCADE ON
                    // UPDATE NO ACTION
                    foreignKey('access_field_ref_access_id', 'accessId', 'access', 'id'),
                ],
            })
        );

        // Category table.
        await q.createTable(
            new Table({
                // CREATE TABLE "category"
                name: 'category',

                columns: [
                    // "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                    idColumn(),

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
                    foreignKeyUserId('category'),
                ],
            })
        );

        // Account table.
        await q.createTable(
            new Table({
                // CREATE TABLE "account"
                name: 'account',

                columns: [
                    // "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                    idColumn(),

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
                        default: `'${UNKNOWN_ACCOUNT_TYPE}'`,
                    },

                    // "importDate" datetime NOT NULL,
                    {
                        name: 'importDate',
                        type: datetimeType(q),
                    },

                    // "initialBalance" numeric NOT NULL,
                    {
                        name: 'initialBalance',
                        type: 'numeric',
                    },

                    // "lastCheckDate" datetime NOT NULL,
                    {
                        name: 'lastCheckDate',
                        type: datetimeType(q),
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
                    foreignKeyUserId('account'),

                    // CONSTRAINT "account_ref_access_id" FOREIGN KEY ("accessId") REFERENCES
                    // "access" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
                    foreignKey('account_ref_access_id', 'accessId', 'access', 'id'),
                ],
            })
        );

        // Transaction table.
        await q.createTable(
            new Table({
                // CREATE TABLE "transaction"
                name: 'transaction',

                columns: [
                    // "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                    idColumn(),

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
                        default: `'${UNKNOWN_OPERATION_TYPE}'`,
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
                        type: datetimeType(q),
                    },

                    // "importDate" datetime NOT NULL,
                    {
                        name: 'importDate',
                        type: datetimeType(q),
                    },

                    // "budgetDate" date,
                    {
                        name: 'budgetDate',
                        type: datetimeType(q),
                        isNullable: true,
                        default: null,
                    },

                    // "debitDate" date,
                    {
                        name: 'debitDate',
                        type: datetimeType(q),
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
                    foreignKeyUserId('transaction'),

                    // CONSTRAINT "transaction_ref_account_id" FOREIGN KEY ("accountId") REFERENCES
                    // "account" ("id") ON DELETE CASCADE ON UPDATE NO ACTION,
                    foreignKey('transaction_ref_account_id', 'accountId', 'account', 'id'),

                    // CONSTRAINT "transaction_ref_category_id" FOREIGN KEY ("categoryId")
                    // REFERENCES "category" ("id") ON DELETE SET NULL ON UPDATE NO ACTION)
                    foreignKey('transaction_ref_category_id', 'categoryId', 'category', 'id', {
                        onDelete: 'SET NULL',
                        onUpdate: 'NO ACTION',
                    }),
                ],
            })
        );

        // Alert table.
        await q.createTable(
            new Table({
                // CREATE TABLE "alert"
                name: 'alert',

                columns: [
                    // "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                    idColumn(),

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
                        type: datetimeType(q),
                        isNullable: true,
                        default: null,
                    },
                ],

                foreignKeys: [
                    // CONSTRAINT "alert_ref_user_id" FOREIGN KEY ("userId") REFERENCES "user"
                    // ("id") ON DELETE CASCADE ON UPDATE NO ACTION
                    foreignKeyUserId('alert'),

                    // CONSTRAINT "alert_ref_account_id" FOREIGN KEY ("accountId") REFERENCES
                    // "account" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
                    foreignKey('alert_ref_account_id', 'accountId', 'account', 'id'),
                ],
            })
        );

        // Budget table.
        await q.createTable(
            new Table({
                // CREATE TABLE "budget"
                name: 'budget',

                columns: [
                    // "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                    idColumn(),

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
                    foreignKeyUserId('budget'),

                    // CONSTRAINT "budget_ref_category_id" FOREIGN KEY ("accountId") REFERENCES
                    // "account" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
                    foreignKey('budget_ref_category_id', 'categoryId', 'category', 'id'),
                ],
            })
        );
    }

    async down(q: QueryRunner): Promise<void> {
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
