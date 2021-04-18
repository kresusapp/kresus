import URL from '../../urls';

const BASE = URL.categories.pattern;

export default {
    list: BASE,
    new: `${BASE}/new`,
    edit(id: number) {
        return `${BASE}/edit/${id}`;
    },
    EDIT_PATTERN: `${BASE}/edit/:categoryId`,
    delete(id: number) {
        return `${BASE}/delete/${id}`;
    },
    DELETE_PATTERN: `${BASE}/delete/:categoryId`,
};
