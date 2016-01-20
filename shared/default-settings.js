let DefaultSettings = new Map;

DefaultSettings.set('weboob-auto-update', 'true');
DefaultSettings.set('weboob-auto-merge-accounts', 'true');
DefaultSettings.set('weboob-installed', 'false');
DefaultSettings.set('duplicateThreshold', '24');
DefaultSettings.set('defaultChartType', 'all');
DefaultSettings.set('defaultChartPeriod', 'current-month');
DefaultSettings.set('defaultAccountId', '');
DefaultSettings.set('showFutureOperations', 'false');

module.exports = DefaultSettings;
