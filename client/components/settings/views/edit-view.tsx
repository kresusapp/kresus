import React, { useCallback } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import { notify, translate as $t } from '../../../helpers';

import * as ViewsStore from '../../../store/views';
import { useKresusState } from '../../../store';

import URL from './urls';

import NewViewForm from './new-view-form';

export default () => {
    const { viewId: viewIdStr } = useParams<{ viewId: string }>();

    const viewId = Number.parseInt(viewIdStr, 10);

    const history = useHistory();

    const view = useKresusState(state => {
        return ViewsStore.fromId(state.views, viewId);
    });

    const onSubmit = useCallback(() => {
        notify.success($t('client.settings.views.edit_success'));
        history.push(URL.viewsList);
    }, [history]);

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
