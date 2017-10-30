import React from 'react';
import { connect } from 'react-redux';

import { get } from '../../../store';
import { translate as $t } from '../../../helpers';

import BankAccessItem from './item';
import FoldablePanel from '../../ui/foldable-panel';
import NewBankForm from './form';

export default connect(state => {
    return {
        accesses: get.accesses(state)
    };
})(props => {
    let accesses = props.accesses.map(access => <BankAccessItem key={access.id} access={access} />);
    return (
        <div key="bank-accesses-section">
            <FoldablePanel
                className="new-bank-panel"
                initiallyExpanded={false}
                title={$t('client.settings.new_bank_form_title')}
                iconTitle={$t('client.settings.add_bank_button')}
                top={true}>
                <NewBankForm isOnboarding={false} />
            </FoldablePanel>
            <div>{accesses}</div>
        </div>
    );
});
