import { Navigate, Route, Routes } from 'react-router';
import DeleteForm from './delete-form';
import { EditForm, NewForm } from './form';
import List from './list';
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
