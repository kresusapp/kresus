// The list of the available sections and settings subsections.
//
// For each of these keys, there must be a `client.menu.{key}` defined in the
// locales file, that are used for displaying the name of the section in the
// menu.
const SECTIONS = [
    'about',
    'accesses',
    'budget',
    'categories',
    'charts',
    'dashboard',
    'duplicates',
    'reports',
    'settings',
];

const SETTINGS_SUBSECTIONS = ['backup', 'customization', 'emails', 'admin'];

const URLs = {
    duplicates: {
        pattern: '/duplicates/:driver/:value',
        url(driver) {
            return `/duplicates/${driver.type}/${driver.value}`;
        },
    },

    reports: {
        pattern: '/reports/:driver/:value',
        url(driver) {
            return `/reports/${driver.type}/${driver.value}`;
        },
    },

    budgets: {
        pattern: '/budget/:driver/:value',
        url(driver) {
            return `/budget/${driver.type}/${driver.value}`;
        },
    },

    charts: {
        pattern: '/charts/:subsection?/:driver/:value',
        url(subsection, driver) {
            return `/charts/${subsection}/${driver.type}/${driver.value}`;
        },
    },

    categories: {
        pattern: '/categories',
    },

    settings: {
        pattern: '/settings/:subsection',
        url(subsection) {
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
        url(subsection = null) {
            if (subsection === null) {
                return '/onboarding/';
            }
            return `/onboarding/${subsection}`;
        },
    },

    sections: {
        pattern: '/:section/:subsection?',
        genericPattern: [],
        title(params) {
            if (!params) {
                return null;
            }
            if (SETTINGS_SUBSECTIONS.includes(params.subsection)) {
                return params.subsection;
            }
            if (SECTIONS.includes(params.section)) {
                return params.section;
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

for (let [key, value] of Object.entries(URLs)) {
    if (key !== 'sections') {
        URLs.sections.genericPattern.push(value.pattern);
    }
}

export default URLs;
