import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import { actions, get } from '../../store';
import { translate as $t } from '../../helpers';

import URL from './urls';

import { Form } from '../ui';
import DisplayIf from '../ui/display-if';
import BankAccessItem from './access';
import AccountSelector from '../ui/account-select';
import DefaultSettings from '../../../shared/default-settings';
import { DEFAULT_ACCOUNT_ID } from '../../../shared/settings';

export default connect(
    state => {
        return {
            accessIds: get.accessIds(state),
            isDemoMode: get.isDemoMode(state),
            defaultAccountId: get.defaultAccountId(state),
        };
    },
    dispatch => {
        return {
            setDefault: id => {
                const finalId = id === -1 ? DefaultSettings.get(DEFAULT_ACCOUNT_ID) : id;
                return actions.setDefaultAccountId(dispatch, finalId);
            },
        };
    }
)(props => {
    const accesses = props.accessIds.map(id => <BankAccessItem key={id} accessId={id} />);
    const defaultAccountKey =
        props.defaultAccountId === DefaultSettings.get(DEFAULT_ACCOUNT_ID)
            ? -1
            : props.defaultAccountId;
    return (
        <div className="bank-accesses-section">
            <Form.Input
                label={$t('client.accesses.default_account')}
                id="default-account-selector"
                help={$t('client.accesses.default_account_helper')}>
                <AccountSelector
                    includeNone={true}
                    onChange={props.setDefault}
                    initial={defaultAccountKey}
                />
            </Form.Input>
            <DisplayIf condition={!props.isDemoMode}>
                <p className="buttons-toolbar top-toolbar">
                    <Link className="btn primary" to={URL.new}>
                        {$t('client.accesses.new_bank_form_title')}
                    </Link>
                </p>
            </DisplayIf>
            <div>{accesses}</div>
        </div>
    );
});
