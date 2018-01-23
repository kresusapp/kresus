exports.up = async function(knex, Promise) {
    await knex.schema.createTableIfNotExists('accesses', t => {
        t.increments('id');
        t.string('source_id').notNullable();
        t.string('login').notNullable();
        t.string('password').notNullable();
        t.string('fetch_status').defaultTo('OK');
        t.boolean('enabled').defaultTo(true);
    });
    return knex.schema.createTableIfNotExists('custom_fields', t => {
        t.string('name').notNullable();
        t.string('value').notNullable();
        t.integer('access_id').unsigned();
        t.foreign('access_id').references('accesses.id').onDelete('cascade');
    });
};

exports.down = async function(knex, Promise) {
    await knex.schema.dropTableIfExists('accesses');
    return knex.schema.dropTableIfExists('custom_fields');
};
