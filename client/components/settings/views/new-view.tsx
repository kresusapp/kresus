import { useCallback } from 'react';
import { useNavigate } from 'react-router';

import { translate as $t, notify } from '../../../helpers';
import NewViewForm from './new-view-form';
import URL from './urls';

export default () => {
    const navigate = useNavigate();

    const onSubmit = useCallback(() => {
        notify.success($t('client.settings.views.creation_success'));
        navigate(URL.viewsList);
    }, [navigate]);

    return (
        <NewViewForm
            backText={$t('client.settings.views.back_to_views_list')}
            backUrl={URL.viewsList}
            formTitle={$t('client.settings.views.new')}
            onSubmitSuccess={onSubmit}
        />
    );
};
