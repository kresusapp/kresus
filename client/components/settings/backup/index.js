import React from 'react';

import { translate as $t } from '../../../helpers';

import ImportModule from './import';
import ExportModule from './export';

const BackupSection = () => {
    return (
        <form className="settings-form">
            <div>
                <label htmlFor="exportInstance">{$t('client.settings.export_instance')}</label>
                <div>
                    <p className="button-desc">{$t('client.settings.export_instance_help')}</p>
                    <ExportModule />
                </div>
            </div>

            <div>
                <label htmlFor="importInstance">{$t('client.settings.import_instance')}</label>
                <div>
                    <p className="button-desc">{$t('client.settings.import_instance_help')}</p>
                    <ImportModule />
                </div>
            </div>
        </form>
    );
};

export default BackupSection;
