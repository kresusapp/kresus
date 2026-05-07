import URL from '../../urls';

const BASE = URL.accesses.pattern;

export default {
    accessList: BASE,

    newAccess: `${BASE}/new`,

    editAccess(id: number) {
        return `${BASE}/edit-access/${id}`;
    },
    EDIT_ACCESS_PATTERN: `${BASE}/edit-access/:accessId`,

    editAccount(id: number) {
        return `${BASE}/edit-account/${id}`;
    },
    EDIT_ACCOUNT_PATTERN: `${BASE}/edit-account/:accountId`,

    manualSync(id: number) {
        return `${BASE}/manual-sync/${id}`;
    },
    MANUAL_SYNC_PATTERN: `${BASE}/manual-sync/:accessId`,

    manualResyncAccount(id: number) {
        return `${BASE}/manual-resync-account/${id}`;
    },
    MANUAL_RESYNC_ACCOUNT_PATTERN: `${BASE}/manual-resync-account/:accountId`,
};
