import React from 'react';
import { Routes, Route, Navigate } from 'react-router';

import AccessesList from './accesses-list';
import NewAccess from './new-access';
import EditAccess from './edit-access';
import EditAccount from './edit-account';

import URL from './urls';
import './accesses.css';

export default () => {
    return (
        <Routes>
            <Route path="new" element={<NewAccess />} />
            <Route path="edit-access/:accessId" element={<EditAccess />} />
            <Route path="edit-account/:accountId" element={<EditAccount />} />
            <Route path="/" element={<AccessesList />} />
            <Route path="*" element={<Navigate to={URL.accessList} replace={true} />} />
        </Routes>
    );
};
