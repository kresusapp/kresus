import { makeLogger, setupTranslator } from './helpers';
import { initModels, Settings } from './models';
import Poller from './lib/poller';

let log = makeLogger('init');

// Checks if the demo mode is enabled, and set it up if that's the case.
async function checkDemoMode() {
    if (process.kresus.forceDemoMode) {
        let isDemoModeEnabled = await Settings.findOrCreateDefaultBooleanValue(0, 'demo-mode');
        if (!isDemoModeEnabled) {
            try {
                log.info('Setting up demo mode...');
                let demoController = require('./controllers/demo');
                await demoController.setupDemoMode(0);
                log.info('Done setting up demo mode...');
            } catch (err) {
                log.error(`Fatal error when setting up demo mode : ${err.message}
${err.stack}`);
            }
        }
    }
}

export default async function(options) {
    try {
        // Initialize models.
        await initModels(options);

        await checkDemoMode();

        // Localize Kresus
        // TODO : do not localize Kresus globally when Kresus is multi-user.
        let locale = await Settings.getLocale(process.kresus.user.id);
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
