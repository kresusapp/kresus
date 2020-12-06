import URL from '../../urls';

const BASE = URL.rules.pattern;

export default {
    list: BASE,
    new: `${BASE}/new`,
    edit: {
        pattern: `${BASE}/edit/:ruleId`,
        url(id: number) {
            return `${BASE}/edit/${id}`;
        },
    },
};
