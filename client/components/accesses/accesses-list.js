import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import { actions, get } from '../../store';
import { translate as $t } from '../../helpers';

import URL from '../../urls';

import { FormRow } from '../ui';
import DisplayIf from '../ui/display-if';
import BankAccessItem from './access';
import AccountSelector from '../ui/account-select';

export default connect(
    state => {
        let accessIds = get.accessIds(state);
        let accesses = accessIds.map(id => get.accessById(state, id));

        return {
            accessIds,
            isDemoMode: get.isDemoMode(state),
            accesses,
        };
    },
    dispatch => {
        return {
            setDefault: id => actions.setDefaultAccountId(dispatch, id),
        };
    }
)(props => {
    const accesses = props.accessIds.map(id => <BankAccessItem key={id} accessId={id} />);
    function handleChangeAccount(accountId) {
        props.setDefault(accountId);
    }

    return (
        <div className="bank-accesses-section">
            <FormRow
                label={$t('client.accesses.default_account')}
                inputId="default-account-selector"
                input={<AccountSelector onChange={handleChangeAccount} />}
                help={$t('client.accesses.default_account_helper')}
            />
            <DisplayIf condition={!props.isDemoMode}>
                <p className="buttons-toolbar top-toolbar">
                    <Link className="btn primary" to={URL.accesses.url('new')}>
                        {$t('client.accesses.new_bank_form_title')}
                    </Link>
                </p>
            </DisplayIf>
            <div>{accesses}</div>
        </div>
    );
});
