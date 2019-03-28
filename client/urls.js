// The list of the available sections.
const SECTIONS = ['about', 'budget', 'categories', 'charts', 'duplicates', 'reports', 'settings'];

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

    categories: {
        pattern: '/categories/:currentAccountId',
        url(accountId) {
            return `/categories/${accountId}`;
        }
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
        pattern: '/:section',
        genericPattern: '/:section/:subsection?/:currentAccountId',
        sub(match, section, defaultValue) {
            let { section: matchSection, subsection: matchSubsection } = match.params;
            return matchSection === section && typeof matchSubsection !== 'undefined'
                ? matchSubsection
                : defaultValue;
        },
        title(match) {
            return match && SECTIONS.includes(match.params.section) ? match.params.section : null;
        },
        accountId: getCurrentAccountId
    }
};

export default URLs;
