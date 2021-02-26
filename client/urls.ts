import { Driver } from './components/drivers/';

// The list of the available sections and settings subsections.
//
// For each of these keys, there must be a `client.menu.{key}` defined in the
// locales file, that are used for displaying the name of the section in the
// menu.
const SECTIONS = ['about', 'accesses', 'categories', 'dashboard', 'settings', 'view'];

const SETTINGS_SUBSECTIONS = ['backup', 'customization', 'emails', 'admin'];

const VIEW_SUBSECTIONS = ['budget', 'charts', 'duplicates', 'reports', 'transactions'];

const URLs = {
    duplicates: {
        pattern: '/view/:driver/:value/duplicates',
        url(driver: Driver) {
            return `/view/${driver.type}/${driver.value}/duplicates`;
        },
    },

    reports: {
        pattern: '/view/:driver/:value/reports',
        url(driver: Driver) {
            return `/view/${driver.type}/${driver.value}/reports`;
        },
    },

    transactions: {
        pattern: '/view/:driver/:value/transactions',
        url(driver: Driver) {
            return `/view/${driver.type}/${driver.value}/transactions`;
        },
    },

    budgets: {
        pattern: '/view/:driver/:value/budget',
        url(driver: Driver) {
            return `/view/${driver.type}/${driver.value}/budget`;
        },
    },

    charts: {
        pattern: '/view/:driver/:value/charts/:subsection?/',
        url(subsection: string, driver: Driver) {
            return `/view/${driver.type}/${driver.value}/charts/${subsection}`;
        },
    },

    view: {
        pattern: '/view/:driver/:value',
    },

    categories: {
        pattern: '/categories',
    },

    settings: {
        pattern: '/settings/:subsection',
        url(subsection: string) {
            return `/settings/${subsection}`;
        },
    },

    about: {
        pattern: '/about',
        url() {
            return '/about';
        },
    },

    weboobReadme: {
        pattern: '/weboob-readme',
        url() {
            return '/weboob-readme';
        },
    },

    onboarding: {
        pattern: '/onboarding/:subsection?',
        url(subsection: string | null = null) {
            if (subsection === null) {
                return '/onboarding/';
            }
            return `/onboarding/${subsection}`;
        },
    },

    sections: {
        pattern: '/:part1/:part2?/:part3?/:part4?',
        genericPattern: [] as string[],
        title(params?: { part1: string; part2: string; part3: string; part4: string }) {
            if (!params) {
                return null;
            }
            if (params.part2 && SETTINGS_SUBSECTIONS.includes(params.part2)) {
                // Settings URLs look like: /settings/:subsection.
                return params.part2;
            }
            if (params.part4 && VIEW_SUBSECTIONS.includes(params.part4)) {
                // View URLs look like: /view/{driverType}/{driverValue}/:subsection
                return params.part4;
            }
            if (SECTIONS.includes(params.part1)) {
                return params.part1;
            }
            return null;
        },
    },

    accesses: {
        pattern: '/accesses',
    },

    dashboard: {
        pattern: '/dashboard',
        url() {
            return '/dashboard';
        },
    },
};

for (const [key, value] of Object.entries(URLs)) {
    if (key !== 'sections') {
        URLs.sections.genericPattern.push(value.pattern);
    }
}

export default URLs;
