exports.up = function(knex) {
    return knex.schema.createTableIfNotExists('settings', t => {
        t.string('key').notNullable();
        t.string('value').notNullable();
    });
};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists('settings');
};
