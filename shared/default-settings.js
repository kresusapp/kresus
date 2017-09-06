const DefaultSettings = new Map;

DefaultSettings.set('weboob-installed', 'false');
DefaultSettings.set('weboob-version', '?');
DefaultSettings.set('standalone-mode', 'false');
DefaultSettings.set('url-prefix', '/');

DefaultSettings.set('locale', 'en');
DefaultSettings.set('migration-version', '0');
DefaultSettings.set('weboob-auto-update', 'true');
DefaultSettings.set('weboob-auto-merge-accounts', 'true');
DefaultSettings.set('weboob-enable-debug', 'false');
DefaultSettings.set('duplicateThreshold', '24');
DefaultSettings.set('defaultChartDisplayType', 'all');
DefaultSettings.set('defaultChartType', 'all');
DefaultSettings.set('defaultChartPeriod', 'current-month');
DefaultSettings.set('defaultAccountId', '');
DefaultSettings.set('defaultCurrency', 'EUR');
DefaultSettings.set('theme', 'default');

DefaultSettings.set('mail-config', JSON.stringify({
    fromEmail: 'kresus@example.tld',
    toEmail: '',
    host: 'localhost',
    port: 25,
    secure: false,
    auth: {
        // user
        // pass
    },
    tls: {
        rejectUnauthorized: true
    }
}));

export default DefaultSettings;
