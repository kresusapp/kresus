import Knex from 'knex';
import * as orm from 'objection';

export default async function init() {
    // Initialize knex connection.
    const knex = Knex({
        client: 'sqlite3',
        useNullAsDefault: true,
        connection: {
            filename: '/tmp/example.db'
        }
    });

    orm.Model.knex(knex);

    // TODO here
}
