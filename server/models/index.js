import path from 'path';

import Knex from 'knex';
import * as orm from 'objection';

import Users from './users';

import { assert, makeLogger } from '../helpers';

const log = makeLogger('models');

const queryLogger = makeLogger('SQL');
const logQuery = query => queryLogger.info(query.sql);

async function createDefaultUser() {
    let { login } = process.kresus.user;
    assert(login, 'There should be a default login set!');

    // Leave other fields empty for now.
    let email = '';
    let password = '';

    let user = await Users.exists({ login, email });
    if (!user) {
        user = await Users.create({ login, email, password });
    }

    process.kresus.user.id = user.id;
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

        await createDefaultUser();
    } catch (e) {
        log.error('at ORM initialization: ', e);
    }
}
