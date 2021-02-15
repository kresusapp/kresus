import React, { useCallback } from 'react';
import { useHistory } from 'react-router-dom';

import { notify, translate as $t } from '../../helpers';
import URL from './urls';

import NewAccessForm from './new-access-form';

export default () => {
    const history = useHistory();

    const onSubmit = useCallback(() => {
        notify.success($t('client.accesses.creation_success'));
        history.push(URL.list);
    }, [history]);

    return (
        <NewAccessForm
            backText={$t('client.accesses.back_to_access_list')}
            backUrl={URL.list}
            formTitle={$t('client.accesses.new_bank_form_title')}
            onSubmitSuccess={onSubmit}
        />
    );
};
