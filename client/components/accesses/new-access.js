import React from 'react';
import { Link, useHistory } from 'react-router-dom';

import { translate as $t } from '../../helpers';
import URL from '../../urls';

import NewAccessForm from './new-access-form';

export default () => {
    let history = useHistory();
    const handleSubmitSuccess = () => {
        history.push(URL.accesses.url());
    };
    let cancelButton = (
        <Link className="btn" to={URL.accesses.url()}>
            {$t('client.accesses.back_to_access_list')}
        </Link>
    );

    return (
        <div>
            <h3>{$t('client.accesses.new_bank_form_title')}</h3>
            <div className="new-access-form-container">
                {/* eslint-disable-next-line react/jsx-no-bind */}
                <NewAccessForm cancelButton={cancelButton} onSubmitSuccess={handleSubmitSuccess} />
            </div>
        </div>
    );
};
