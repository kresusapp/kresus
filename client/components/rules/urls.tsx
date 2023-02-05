import URL from '../../urls';

const BASE = URL.rules.pattern;

export default {
    list: BASE,

    new: `${BASE}/new`,

    predefinedNew: {
        pattern: `${BASE}/new/:label/:amount/:categoryId`,
        url(label: string, amount: number, categoryId: number | null) {
            return `${BASE}/new/${window.encodeURIComponent(label)}/${amount}/${
                categoryId !== null ? categoryId : ''
            }`;
        },
    },

    edit: {
        pattern: `${BASE}/edit/:ruleId`,
        url(id: number) {
            return `${BASE}/edit/${id}`;
        },
    },
};
