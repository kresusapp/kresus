import {
    APPRISE_URL,
    BUDGET_DISPLAY_NO_THRESHOLD,
    BUDGET_DISPLAY_PERCENT,
    DARK_MODE,
    DEFAULT_ACCOUNT_ID,
    DEFAULT_CHART_DISPLAY_TYPE,
    DEFAULT_CHART_FREQUENCY,
    DEFAULT_CHART_PERIOD,
    DEFAULT_CHART_TYPE,
    DEFAULT_CURRENCY,
    DEMO_MODE,
    DISCOVERY_MODE,
    DUPLICATE_IGNORE_DIFFERENT_CUSTOM_FIELDS,
    DUPLICATE_THRESHOLD,
    EMAIL_RECIPIENT,
    FLUID_LAYOUT,
    LOCALE,
    MIGRATION_VERSION,
    WOOB_AUTO_MERGE_ACCOUNTS,
    WOOB_AUTO_UPDATE,
    WOOB_ENABLE_DEBUG,
    WOOB_FETCH_THRESHOLD,
} from './settings';

// TODO use an enum for settings
const DefaultSettings = new Map<string, string>();

DefaultSettings.set(APPRISE_URL, '');
DefaultSettings.set(BUDGET_DISPLAY_NO_THRESHOLD, 'true');
DefaultSettings.set(BUDGET_DISPLAY_PERCENT, 'false');
DefaultSettings.set(DARK_MODE, 'false');
DefaultSettings.set(DEFAULT_ACCOUNT_ID, '');
DefaultSettings.set(DEFAULT_CHART_DISPLAY_TYPE, 'all');
DefaultSettings.set(DEFAULT_CHART_FREQUENCY, 'monthly');
DefaultSettings.set(DEFAULT_CHART_PERIOD, 'current-month');
DefaultSettings.set(DEFAULT_CHART_TYPE, 'all');
DefaultSettings.set(DEFAULT_CURRENCY, 'EUR');
DefaultSettings.set(DEMO_MODE, 'false');
DefaultSettings.set(DISCOVERY_MODE, 'true');
DefaultSettings.set(DUPLICATE_IGNORE_DIFFERENT_CUSTOM_FIELDS, 'true');
DefaultSettings.set(DUPLICATE_THRESHOLD, '24');
DefaultSettings.set(EMAIL_RECIPIENT, '');
DefaultSettings.set(LOCALE, 'en');
DefaultSettings.set(MIGRATION_VERSION, '0');
DefaultSettings.set(FLUID_LAYOUT, 'false');
DefaultSettings.set(WOOB_AUTO_MERGE_ACCOUNTS, 'true');
DefaultSettings.set(WOOB_AUTO_UPDATE, 'true');
DefaultSettings.set(WOOB_ENABLE_DEBUG, 'false');
DefaultSettings.set(WOOB_FETCH_THRESHOLD, '1');

export default DefaultSettings;
