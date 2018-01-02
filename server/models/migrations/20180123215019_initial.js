import { UNKNOWN_OPERATION_TYPE } from '../../helpers';

exports.up = async function(knex) {
    await knex.schema.createTableIfNotExists('users', t => {
        t.increments('id');
        t.string('login').notNullable();
        t.string('password').notNullable();
        t.string('email').nullable();
    });

    await knex.schema.createTableIfNotExists('settings', t => {
        t
            .integer('userId')
            .unsigned()
            .notNullable();
        t
            .foreign('userId')
            .references('users.id')
            .onDelete('cascade');

        t.string('key').notNullable();
        t.string('value').notNullable();
    });

    await knex.schema.createTableIfNotExists('accesses', t => {
        t.increments('id');

        t
            .integer('userId')
            .unsigned()
            .notNullable();
        t
            .foreign('userId')
            .references('users.id')
            .onDelete('cascade');

        t.string('sourceId').notNullable();
        t.string('login').notNullable();
        t.string('password').nullable();
        t.string('fetchStatus').defaultTo('OK');
        t.boolean('enabled').defaultTo(true);
    });

    await knex.schema.createTableIfNotExists('accounts', t => {
        t.increments('id');

        t
            .integer('userId')
            .unsigned()
            .notNullable();
        t
            .foreign('userId')
            .references('users.id')
            .onDelete('cascade');

        t.string('accessId').unsigned();
        t
            .foreign('accessId')
            .references('accesses.id')
            .onDelete('cascade');

        t.string('sourceAccountNumber').notNullable();
        t.string('sourceLabel').notNullable();
        t.string('iban').nullable();
        t.string('currency').nullable();

        t.decimal('initialBalance').defaultTo(0);
        t.date('importedAt').notNullable();
        t.datetime('lastCheckedAt').notNullable();

        t.boolean('excludeFromBalance').notNullable().defaultTo(false);
    });

    await knex.schema.createTableIfNotExists('categories', t => {
        t.increments('id');

        t
            .integer('userId')
            .unsigned()
            .notNullable();
        t
            .foreign('userId')
            .references('users.id')
            .onDelete('cascade');

        t.string('title').notNullable();
        t.string('color').notNullable();
        t.decimal('budgetThreshold').defaultTo(0);
    });

    await knex.schema.createTableIfNotExists('transactions', t => {
        t.increments('id');

        t
            .integer('userId')
            .unsigned()
            .notNullable();
        t
            .foreign('userId')
            .references('users.id')
            .onDelete('cascade');

        t
            .integer('accountId')
            .unsigned()
            .notNullable();
        t
            .foreign('accountId')
            .references('accounts.id')
            .onDelete('cascade');

        t
            .integer('categoryId')
            .unsigned()
            .nullable();
        t
            .foreign('categoryId')
            .references('categories.id')
            .onDelete('set null');

        t.string('type').defaultTo(UNKNOWN_OPERATION_TYPE);

        t.string('title').notNullable();
        t.string('raw').notNullable();
        t.string('customLabel').nullable();

        t.date('processedAt').notNullable();
        t.date('importedAt').notNullable();
        t.date('budgetDate').nullable();

        t.decimal('amount').notNullable();
        t.boolean('createdByUser').defaultTo(false);
    });

    await knex.schema.createTableIfNotExists('old_alerts', t => {
        t.increments('id');

        t
            .integer('userId')
            .unsigned()
            .notNullable();
        t
            .foreign('userId')
            .references('users.id')
            .onDelete('cascade');

        t
            .integer('accountId')
            .unsigned()
            .notNullable();
        t
            .foreign('accountId')
            .references('accounts.id')
            .onDelete('cascade');

        t.enu('type', ['report', 'balance', 'transaction']).notNullable();

        t.enu('reportFrequency', ['daily', 'weekly', 'monthly']).nullable();

        t.decimal('alertThreshold').nullable();
        t.enu('alertOrder', ['gt', 'lt']).nullable();

        t.datetime('lastTriggeredAt').notNullable();
    });

    return knex.schema.createTableIfNotExists('custom_fields', t => {
        t.integer('accessId').unsigned();
        t
            .foreign('accessId')
            .references('accesses.id')
            .onDelete('cascade');

        t.string('name').notNullable();
        t.string('value').notNullable();
    });
};

exports.down = async function(knex) {
    await knex.schema.dropTableIfExists('custom_fields');
    await knex.schema.dropTableIfExists('old_alerts');
    await knex.schema.dropTableIfExists('transactions');
    await knex.schema.dropTableIfExists('categories');
    await knex.schema.dropTableIfExists('accounts');
    await knex.schema.dropTableIfExists('accesses');
    await knex.schema.dropTableIfExists('settings');
    return knex.schema.dropTableIfExists('users');
};
