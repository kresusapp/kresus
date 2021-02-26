import MainURLs from '../../../urls';

const BASE = MainURLs.settings.url('emails');

export default {
    all: BASE,

    newAlert: {
        pattern: `${BASE}/alert/new/:type`,
        url(type: 'balance' | 'transaction') {
            return `${BASE}/alert/new/${type}`;
        },
    },

    newReport: {
        pattern: `${BASE}/report/new`,
        url() {
            return this.pattern;
        },
    },
};
