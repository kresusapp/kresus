import { useCallback } from 'react';
import { useNavigate } from 'react-router';

import { translate as $t, notify } from '../../helpers';
import NewAccessForm from './new-access-form';
import URL from './urls';

export default () => {
    const navigate = useNavigate();

    const onSubmit = useCallback(() => {
        notify.success($t('client.accesses.creation_success'));
        navigate(URL.accessList);
    }, [navigate]);

    return (
        <NewAccessForm
            backText={$t('client.accesses.back_to_access_list')}
            backUrl={URL.accessList}
            formTitle={$t('client.accesses.new_bank_form_title')}
            onSubmitSuccess={onSubmit}
        />
    );
};
