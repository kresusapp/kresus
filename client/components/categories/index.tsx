import React from 'react';
import { Route, Routes, Navigate } from 'react-router';

import List from './list';
import DeleteForm from './delete-form';
import { EditForm, NewForm } from './form';
import URL from './urls';

export default () => {
    return (
        <Routes>
            <Route path="new" element={<NewForm />} />
            <Route path="edit/:categoryId" element={<EditForm />} />
            <Route path="delete/:categoryId" element={<DeleteForm />} />
            <Route path="/" element={<List />} />
            <Route path="*" element={<Navigate to={URL.list} replace={true} />} />
        </Routes>
    );
};
