import { Navigate, Route, Routes } from 'react-router';
import EditView from './edit-view';
import NewView from './new-view';
import URL from './urls';
import ViewsList from './views-list';

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
