import path from 'path';

import Knex from 'knex';
import * as orm from 'objection';

import { makeLogger } from '../helpers';

const log = makeLogger('models');

function logQuery(query) {
    log.info('SQL:', query.sql);
}

export default async function init() {
    try {
        log.info('Initializing Knex connection...');

        // eslint-disable-next-line new-cap
        const knex = Knex({
            // TODO make it configurable
            client: 'sqlite3',
            useNullAsDefault: true,
            connection: {
                filename: '/tmp/example.db'
            }
        });

        knex.on('query', logQuery);

        log.info('Initializing Objection...');
        orm.Model.knex(knex);

        log.info('Migrating to the latest version of the database...');
        await knex.migrate.latest({
            directory: path.join(__dirname, 'migrations')
        });
    } catch (e) {
        log.error('at ORM initialization: ', e);
    }
}
