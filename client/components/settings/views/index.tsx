import React from 'react';

import { Routes, Route, Navigate } from 'react-router';

import ViewsList from './views-list';
import NewView from './new-view';
import EditView from './edit-view';

import URL from './urls';

export default () => {
    return (
        <Routes>
            <Route path="new" element={<NewView />} />
            <Route path="edit-view/:viewId" element={<EditView />} />
            <Route path="/" element={<ViewsList />} />
            <Route path="*" element={<Navigate to={URL.viewsList} replace={true} />} />
        </Routes>
    );
};
