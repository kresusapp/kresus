exports.up = function(knex) {
    return knex.schema.createTable('settings', t => {
        t
            .string('key')
            .notNullable()
            .unique();
        t.string('value').notNullable();
    });
};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists('settings');
};
