import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import { get } from '../../store';
import { translate as $t } from '../../helpers';

import URL from '../../urls';

import DisplayIf from '../ui/display-if';
import BankAccessItem from './access';

export default connect(state => {
    return {
        accessIds: get.accessIds(state),
        isDemoMode: get.isDemoMode(state)
    };
})(props => {
    let accesses = props.accessIds.map(id => <BankAccessItem key={id} accessId={id} />);

    return (
        <div className="bank-accesses-section">
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
