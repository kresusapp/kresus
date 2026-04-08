import React from 'react';
import { Route, Routes, Navigate } from 'react-router';

import URL from '../../urls';

import BackupParameters from './backup';
import CustomizationParameters from './customization';
import EmailsParameters from './emails';
import AdminSection from './admin';
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
