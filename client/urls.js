// The list of the available sections.
const SECTIONS = ['about', 'budget', 'categories', 'charts', 'duplicates', 'reports', 'settings'];

const URLs = {
    duplicates: {
        pattern: '/duplicates/:currentAccountId',
        url(accountId) {
            return `/duplicates/${accountId}`;
        },
        accountId(match) {
            return match.params.currentAccountId;
        }
    },

    reports: {
        pattern: '/reports/:currentAccountId',
        url(accountId) {
            return `/reports/${accountId}`;
        },
        accountId(match) {
            return match.params.currentAccountId;
        }
    },

    budgets: {
        pattern: '/budget/:currentAccountId',
        url(accountId) {
            return `/budget/${accountId}`;
        },
        accountId(match) {
            return match.params.currentAccountId;
        }
    },

    charts: {
        pattern: '/charts/:chartsPanel?/:currentAccountId',
        url(subsection, accountId) {
            return `/charts/${subsection}/${accountId}`;
        },
        subsection(match) {
            return match.params.currentAccountId;
        },
        accountId(match) {
            return match.params.currentAccountId;
        }
    },

    categories: {
        pattern: '/categories/:currentAccountId',
        url(accountId) {
            return `/categories/${accountId}`;
        }
    },

    settings: {
        pattern: '/settings/:tab?/:currentAccountId',
        url(subsection, accountId) {
            return `/settings/${subsection}/${accountId}`;
        },
        accountId(match) {
            return match.params.currentAccountId;
        }
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
        pattern: '/:section',
        genericPattern: '/:section/:subsection?/:currentAccountId',
        sub(match, section, defaultValue) {
            let { matchSection, matchSubsection } = match.params;
            return matchSection === section && typeof matchSubsection !== 'undefined'
                ? matchSubsection
                : defaultValue;
        },
        accountId(match) {
            return match.params.currentAccountId;
        },
        title(match) {
            return match && SECTIONS.includes(match.params.section) ? match.params.section : null;
        }
    }
};

export default URLs;
