import { makeLogger, setupTranslator, setupMoment } from './helpers';

import * as Migrations from './models/migrations';
import * as Bank from './models/bank';
import * as Settings from './models/config';

import Poller from './lib/poller';

import BanksData from './shared/banks.json';

let log = makeLogger('init');

// See comment in index.js.
module.exports = async function(app, server, callback) {
    try {
        // Localize Kresus
        let locale = await Settings.getLocale();
        setupTranslator(locale);
        setupMoment(locale);

        // Do data migrations first
        log.info('Applying data migrations...');
        await Migrations.run();
        log.info('Done running data migrations.');

        // Bank initialization
        log.info('Maybe adding banks...');
        for (let bank of BanksData) {
            await Bank.createOrUpdate(bank);
        }
        log.info('Success: All banks added.');

        // Start bank polling
        log.info('Starting bank accounts polling et al...');
        await Poller.runAtStartup();

        log.info("Server is ready, let's start the show!");

    } catch (err) {
        log.error(`Error at initialization:
Message: ${err.message}
${err.stack}`);
    }

    if (callback)
        callback(app, server);
};
