import { makeLogger, assertHas, setupTranslator } from './helpers';

import initModels from './models';
import * as Migrations from './models/pouch/migrations';
import Settings from './models/settings';

import Poller from './lib/poller';

let log = makeLogger('init');

// See comment in index.js.
module.exports = async function() {
    try {
        // Initialize ORM.
        await initModels();

        assertHas(process.kresus, 'user');
        assertHas(process.kresus.user, 'id');
        let userId = process.kresus.user.id;

        // Localize Kresus
        let locale = await Settings.getLocale(userId);
        setupTranslator(locale);

        // Do data migrations first
        log.info('Applying data migrations...');
        await Migrations.run();
        log.info('Done running data migrations.');

        // Start bank polling
        log.info('Starting bank accounts polling et al...');
        await Poller.runAtStartup();

        log.info("Server is ready, let's start the show!");
    } catch (err) {
        log.error(`Error at initialization:
Message: ${err.message}
${err.stack}`);
    }
};
