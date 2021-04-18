import React from 'react';

import { get } from '../../../store';
import { translate as $t, useKresusState } from '../../../helpers';
import DisplayIf from '../../../components/ui/display-if';

import ImportModule from './import';
import ExportModule from './export';

const BackupSection = () => {
    const isDemoEnabled = useKresusState(state => get.isDemoMode(state));

    const importHelp = isDemoEnabled
        ? $t('client.settings.import_disabled_help')
        : $t('client.settings.import_instance_help');

    return (
        <>
            <h3>{$t('client.settings.export_instance')}</h3>
            <p>{$t('client.settings.export_instance_help')}</p>
            <ExportModule />

            <hr />

            <h3>{$t('client.settings.import_instance')}</h3>
            <p>{importHelp}</p>
            <DisplayIf condition={!isDemoEnabled}>
                <ImportModule />
            </DisplayIf>
        </>
    );
};

BackupSection.displayName = 'BackupSection';

export default BackupSection;
