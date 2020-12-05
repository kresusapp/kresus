import URL from '../../urls';

const BASE = URL.accesses.pattern;

export default {
    list: BASE,
    new: `${BASE}/new`,
    edit(id: number) {
        return `${BASE}/edit/${id}`;
    },
    EDIT_PATTERN: `${BASE}/edit/:accessId`,
};
