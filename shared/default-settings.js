const DefaultSettings = new Map();

// Ghost settings: can't be defined by the user, aren't present in exports.
DefaultSettings.set('weboob-installed', 'false');
DefaultSettings.set('weboob-version', null);
DefaultSettings.set('url-prefix', '/');
DefaultSettings.set('emails-enabled', 'false');
DefaultSettings.set('can-encrypt', 'false');
DefaultSettings.set('force-demo-mode', 'false');

// User settings.
DefaultSettings.set('budget-display-percent', 'false');
DefaultSettings.set('budget-display-no-threshold', 'true');
DefaultSettings.set('default-account-id', '');
DefaultSettings.set('default-chart-display-type', 'all');
DefaultSettings.set('default-chart-type', 'all');
DefaultSettings.set('default-chart-period', 'current-month');
DefaultSettings.set('default-currency', 'EUR');
DefaultSettings.set('duplicate-ignore-different-custom-fields', 'true');
DefaultSettings.set('duplicate-threshold', '24');
DefaultSettings.set('email-recipient', '');
DefaultSettings.set('locale', 'en');
DefaultSettings.set('migration-version', '0');
DefaultSettings.set('theme', 'default');
DefaultSettings.set('weboob-auto-merge-accounts', 'true');
DefaultSettings.set('weboob-auto-update', 'true');
DefaultSettings.set('weboob-enable-debug', 'false');
DefaultSettings.set('weboob-fetch-threshold', '1');
DefaultSettings.set('demo-mode', 'false');
DefaultSettings.set('discovery-mode', 'true');

export default DefaultSettings;
