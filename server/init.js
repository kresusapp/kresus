import { makeLogger, setupTranslator } from './helpers';

import initModels from './models';
import * as Migrations from './models/migrations';
import * as Settings from './models/config';

import Poller from './lib/poller';

let log = makeLogger('init');

// See comment in index.js.
module.exports = async function() {
    try {
        // Initialize models.
        await initModels();

        // Localize Kresus
        // TODO : do not localize Kresus globally when Kresus is multi-user.
        let locale = await Settings.getLocale(process.kresus.user.id);
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
