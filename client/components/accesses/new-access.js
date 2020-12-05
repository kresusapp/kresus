import React from 'react';
import { useHistory } from 'react-router-dom';

import { notify, translate as $t } from '../../helpers';
import URL from './urls';

import NewAccessForm from './new-access-form';

export default () => {
    let history = useHistory();

    const onSubmit = () => {
        notify.success($t('client.accesses.creation_success'));
        history.push(URL.list);
    };

    return (
        <NewAccessForm
            backText={$t('client.accesses.back_to_access_list')}
            backUrl={URL.list}
            formTitle={$t('client.accesses.new_bank_form_title')}
            /* eslint-disable-next-line react/jsx-no-bind */
            onSubmitSuccess={onSubmit}
        />
    );
};
