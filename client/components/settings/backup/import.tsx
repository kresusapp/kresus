import React from 'react';

// Global variables
import { get } from '../../../store';
import { translate as $t, useKresusState } from '../../../helpers';

import ImportForm from './import-form';

const Import = (props: { dontResetOnSubmit?: boolean }) => {
    const isDemoEnabled = useKresusState(state => get.isDemoMode(state));

    if (isDemoEnabled) {
        return <p className="alerts info">{$t('client.settings.import_disabled_help')}</p>;
    }

    const jsonImportHelper = `
        ${$t('client.onboarding.import')} 
        ${$t('client.settings.import_instance_help')}
    `;

    return (
        <>
            <ImportForm
                {...props}
                type="json"
                title={$t('client.settings.import_instance')}
                helper={jsonImportHelper}
            />

            <hr />

            <ImportForm
                {...props}
                type="ofx"
                title={$t('client.settings.import_ofx')}
                helper={$t('client.settings.import_ofx_desc')}
                isMonoAccess={true}
            />
        </>
    );
};

Import.displayName = 'ImportModule';

export default Import;
