import { Navigate, Route, Routes } from 'react-router';

import URL from '../../urls';
import AdminSection from './admin';
import BackupParameters from './backup';
import CustomizationParameters from './customization';
import EmailsParameters from './emails';
import Views from './views';

import './settings.css';

const SettingsComponents = () => {
    return (
        <Routes>
            <Route path="backup" element={<BackupParameters />} />
            <Route path="customization" element={<CustomizationParameters />} />
            <Route path="emails/*" element={<EmailsParameters />} />
            <Route path="admin" element={<AdminSection />} />
            <Route path="views/*" element={<Views />} />
            <Route
                path="*"
                element={<Navigate to={URL.settings.url('accounts')} replace={true} />}
            />
        </Routes>
    );
};

export default SettingsComponents;
