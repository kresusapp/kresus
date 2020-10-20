import React from 'react';
import { useHistory } from 'react-router-dom';

import { translate as $t } from '../../helpers';
import URL from '../../urls';

import NewAccessForm from './new-access-form';

export default () => {
    let history = useHistory();
    const handleSubmitSuccess = () => {
        history.push(URL.accesses.url());
    };

    return (
        <NewAccessForm
            backText={$t('client.accesses.back_to_access_list')}
            backUrl={URL.accesses.url()}
            formTitle={$t('client.accesses.new_bank_form_title')}
            /* eslint-disable-next-line react/jsx-no-bind */
            onSubmitSuccess={handleSubmitSuccess}
        />
    );
};
