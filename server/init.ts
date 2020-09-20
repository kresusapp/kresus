import { makeLogger, setupTranslator } from './helpers';
import { DEMO_MODE } from './shared/settings';

import { initModels, Setting } from './models';
import Poller from './lib/poller';
import * as DemoController from './controllers/demo';

const log = makeLogger('init');

// Checks if the demo mode is enabled, and set it up if that's the case.
async function checkDemoMode() {
    if (process.kresus.forceDemoMode) {
        const isDemoModeEnabled = await Setting.findOrCreateDefaultBooleanValue(0, DEMO_MODE);
        if (!isDemoModeEnabled) {
            try {
                log.info('Setting up demo mode...');
                await DemoController.setupDemoMode(0);
                log.info('Done setting up demo mode...');
            } catch (err) {
                log.error(`Fatal error when setting up demo mode : ${err.message}
${err.stack}`);
            }
        }
    }
}

export default async function init() {
    try {
        // Initialize models.
        await initModels();

        await checkDemoMode();

        // Localize Kresus
        // TODO : do not localize Kresus globally when Kresus is multi-user.
        const locale = await Setting.getLocale(process.kresus.user.id);
        setupTranslator(locale);

        // Start bank polling
        log.info('Starting bank accounts polling et al...');
        await Poller.runAtStartup();

        log.info("Server is ready, let's start the show!");
    } catch (err) {
        log.error(`Error at initialization:
Message: ${err.message}
${err.stack}`);
    }
}
