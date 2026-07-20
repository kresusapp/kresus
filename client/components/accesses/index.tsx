import { Routes, Route, Navigate } from 'react-router';

import AccessesList from './accesses-list';
import NewAccess from './new-access';
import EditAccess from './edit-access';
import EditAccount from './edit-account';
import ManualSync from './manual-sync';
import ManualResyncAccount from './manual-resync-account';

import URL from './urls';
import './accesses.css';

export default () => {
    return (
        <Routes>
            <Route path="new" element={<NewAccess />} />
            <Route path="edit-access/:accessId" element={<EditAccess />} />
            <Route path="edit-account/:accountId" element={<EditAccount />} />
            <Route path="manual-sync/:accessId" element={<ManualSync />} />
            <Route path="manual-resync-account/:accountId" element={<ManualResyncAccount />} />
            <Route path="/" element={<AccessesList />} />
            <Route path="*" element={<Navigate to={URL.accessList} replace={true} />} />
        </Routes>
    );
};
