import { makeLogger } from './helpers';
import { DEMO_MODE } from './shared/settings';

import { initModels, Setting, User } from './models';
import Poller from './lib/poller';
import * as DemoController from './controllers/demo';

const log = makeLogger('init');

// Checks if the demo mode is enabled, and set it up if that's the case.
async function checkDemoMode() {
    if (process.kresus.forceDemoMode) {
        // Enable the demo mode for every user (even though it does not make sense to have several users with the demo).
        const users = await User.all();
        for (const user of users) {
            const isDemoModeEnabled = await Setting.findOrCreateDefaultBooleanValue(
                user.id,
                DEMO_MODE
            );
            if (!isDemoModeEnabled) {
                try {
                    log.info(`Setting up demo mode for user id ${user.id}...`);
                    await DemoController.setupDemoMode(user.id);
                    log.info('Done setting up demo mode...');
                } catch (err) {
                    log.error(`Fatal error when setting up demo mode for user ${user.login}: ${err.message}
    ${err.stack}`);
                }
            }
        }
    }
}

export default async function init() {
    try {
        // Initialize models.
        await initModels();

        await checkDemoMode();

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
