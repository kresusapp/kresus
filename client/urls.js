// The list of the available sections.
const SECTIONS = ['about', 'budget', 'categories', 'charts', 'duplicates', 'reports', 'settings'];
const SETTINGS_SUBSECTIONS = [
    'accounts',
    'backup',
    'categories',
    'customization',
    'emails',
    'admin'
];

const URLs = {
    duplicates: {
        pattern: '/duplicates/:currentAccountId',
        url(accountId) {
            return `/duplicates/${accountId}`;
        }
    },

    reports: {
        pattern: '/reports/:currentAccountId',
        url(accountId) {
            return `/reports/${accountId}`;
        }
    },

    budgets: {
        pattern: '/budget/:currentAccountId',
        url(accountId) {
            return `/budget/${accountId}`;
        }
    },

    charts: {
        pattern: '/charts/:subsection?/:currentAccountId',
        url(subsection, accountId) {
            return `/charts/${subsection}/${accountId}`;
        }
    },

    settings: {
        pattern: '/settings/:subsection',
        url(subsection) {
            return `/settings/${subsection}`;
        }
    },

    about: {
        pattern: '/about',
        url() {
            return '/about';
        }
    },

    weboobReadme: {
        pattern: '/weboob-readme',
        url() {
            return '/weboob-readme';
        }
    },

    initialize: {
        pattern: '/initialize/:subsection?',
        url(subsection = null) {
            if (subsection === null) {
                return '/initialize/';
            }
            return `/initialize/${subsection}`;
        }
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
        }
    }
};

for (let [key, value] of Object.entries(URLs)) {
    if (key !== 'sections') {
        URLs.sections.genericPattern.push(value.pattern);
    }
}

export default URLs;
