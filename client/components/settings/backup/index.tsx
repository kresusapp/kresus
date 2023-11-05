import React from 'react';

import { translate as $t } from '../../../helpers';

import ImportModule from './import';
import ExportModule from './export';

const BackupSection = () => {
    return (
        <>
            <h3>{$t('client.settings.export_instance')}</h3>
            <p>{$t('client.settings.export_instance_help')}</p>
            <ExportModule />

            <hr />

            <ImportModule />
        </>
    );
};

BackupSection.displayName = 'BackupSection';

export default BackupSection;
