import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';

import { actions, get } from '../../store';
import { translate as $t, useKresusState } from '../../helpers';

import URL from './urls';

import { Form } from '../ui';
import DisplayIf from '../ui/display-if';
import BankAccessItem from './access';
import AccountSelector from '../ui/account-select';

const AccessList = () => {
    const accessIds = useKresusState(state => get.accessIds(state));
    const isDemoMode = useKresusState(state => get.isDemoMode(state));
    const defaultAccountId = useKresusState(state => get.defaultAccountId(state));

    const dispatch = useDispatch();

    const setDefault = useCallback(
        (id: number) => {
            const finalId = id === -1 ? null : id;
            return actions.setDefaultAccountId(dispatch, finalId);
        },
        [dispatch]
    );

    const accesses = accessIds.map(id => <BankAccessItem key={id} accessId={id} />);
    const defaultAccountKey = defaultAccountId === null ? -1 : defaultAccountId;
    return (
        <div className="bank-accesses-section">
            <Form.Input
                label={$t('client.accesses.default_account')}
                id="default-account-selector"
                help={$t('client.accesses.default_account_helper')}>
                <AccountSelector
                    includeNone={true}
                    onChange={setDefault}
                    initial={defaultAccountKey}
                />
            </Form.Input>
            <DisplayIf condition={!isDemoMode}>
                <p className="top-toolbar">
                    <Link className="btn primary" to={URL.new}>
                        {$t('client.accesses.new_bank_form_title')}
                    </Link>
                </p>
            </DisplayIf>
            <div>{accesses}</div>
        </div>
    );
};

AccessList.displayName = 'AccessList';

export default AccessList;
