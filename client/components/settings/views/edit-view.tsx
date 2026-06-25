import React, { useCallback } from 'react';
import { useNavigate } from 'react-router';

import { notify, translate as $t } from '../../../helpers';
import { useRequiredParams } from '../../../hooks';

import * as ViewsStore from '../../../store/views';
import { useKresusState } from '../../../store';

import URL from './urls';

import NewViewForm from './new-view-form';

export default () => {
    const { viewId: viewIdStr } = useRequiredParams<{ viewId: string }>();

    const viewId = Number.parseInt(viewIdStr, 10);

    const navigate = useNavigate();

    const view = useKresusState(state => {
        return ViewsStore.fromId(state.views, viewId);
    });

    const onSubmit = useCallback(() => {
        notify.success($t('client.settings.views.edit_success'));
        navigate(URL.viewsList);
    }, [navigate]);

    if (!view) {
        return null;
    }

    return (
        <NewViewForm
            backText={$t('client.settings.views.back_to_views_list')}
            backUrl={URL.viewsList}
            formTitle={$t('client.settings.views.edit')}
            onSubmitSuccess={onSubmit}
            view={view}
        />
    );
};
