import React from 'react';
import { Link } from 'react-router-dom';

import { get } from '../../store';
import { translate as $t, useKresusState } from '../../helpers';

import URL from './urls';

import DisplayIf from '../ui/display-if';
import BankAccessItem from './access';

const AccessList = () => {
    const accessIds = useKresusState(state => get.accessIds(state));
    const isDemoMode = useKresusState(state => get.isDemoMode(state));

    const accesses = accessIds.map(id => <BankAccessItem key={id} accessId={id} />);
    return (
        <div className="bank-accesses-section">
            <DisplayIf condition={!isDemoMode}>
                <p className="top-toolbar">
                    <Link className="btn primary" to={URL.newAccess}>
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
