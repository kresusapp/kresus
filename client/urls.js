// The list of the available sections.
const SECTIONS = ['about', 'budget', 'categories', 'charts', 'duplicates', 'reports', 'settings'];
const SETTINGS_SUBSECTIONS = [
    'accounts',
    'backup',
    'categories',
    'customization',
    'emails',
    'logs',
    'weboob'
];

function getCurrentAccountId(match) {
    return match.params.currentAccountId;
}

const URLs = {
    duplicates: {
        pattern: '/duplicates/:currentAccountId',
        url(accountId) {
            return `/duplicates/${accountId}`;
        },
        accountId: getCurrentAccountId
    },

    reports: {
        pattern: '/reports/:currentAccountId',
        url(accountId) {
            return `/reports/${accountId}`;
        },
        accountId: getCurrentAccountId
    },

    budgets: {
        pattern: '/budget/:currentAccountId',
        url(accountId) {
            return `/budget/${accountId}`;
        },
        accountId: getCurrentAccountId
    },

    charts: {
        pattern: '/charts/:subsection?/:currentAccountId',
        url(subsection, accountId) {
            return `/charts/${subsection}/${accountId}`;
        },
        accountId: getCurrentAccountId
    },

    settings: {
        pattern: '/settings/:subsection/:currentAccountId',
        url(subsection, accountId) {
            return `/settings/${subsection}/${accountId}`;
        },
        accountId: getCurrentAccountId
    },

    about: {
        pattern: '/about/:currentAccountId',
        url(accountId) {
            return `/about/${accountId}`;
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
        genericPattern: '/:section/:subsection?/:currentAccountId',
        sub(match, section, defaultValue) {
            let { section: matchSection, subsection: matchSubsection } = match.params;
            return matchSection === section && typeof matchSubsection !== 'undefined'
                ? matchSubsection
                : defaultValue;
        },
        title(match) {
            if (!match || !match.params) {
                return null;
            }
            if (SETTINGS_SUBSECTIONS.includes(match.params.subsection)) {
                return match.params.subsection;
            }
            if (SECTIONS.includes(match.params.section)) {
                return match.params.section;
            }
            return null;
        },
        accountId: getCurrentAccountId
    }
};

export default URLs;
