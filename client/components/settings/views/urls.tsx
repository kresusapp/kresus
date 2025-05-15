import URL from '../../../urls';

const BASE = URL.settings.url('views');

export default {
    viewsList: BASE,

    newView: `${BASE}/new`,

    editView(id: number) {
        return `${BASE}/edit-view/${id}`;
    },
    EDIT_VIEW_PATTERN: `${BASE}/edit-view/:viewId`,
};
