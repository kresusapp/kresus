/**
 * Settings API endpoints
 */
import selfapi from 'selfapi';

import * as settingsControllers from '../settings';

const settings = selfapi({
    title: 'Settings'
});

settings.get({
    title: 'Get stored Kresus settings',
    handler: settingsControllers.getAllSettings,
    examples: [
        {
            response: {
                status: 200,
                body: {
                    data: {
                        settings: [
                            {
                                name: 'weboob-auto-merge-accounts',
                                value: true
                            }
                        ]
                    }
                }
            }
        }
    ]
});
settings.put({
    title: 'Update stored Kresus settings',
    handler: settingsControllers.save,
    examples: [
        {
            request: {
                body: {
                    'weboob-auto-merge-accounts': false
                }
            },
            response: {
                status: 200,
                body: {
                    data: {
                        settings: [
                            {
                                name: 'weboob-auto-merge-accounts',
                                value: false
                            }
                        ]
                    }
                }
            }
        }
    ]
});

export default settings;
