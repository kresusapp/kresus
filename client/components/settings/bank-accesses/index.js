import React from 'react';
import { connect } from 'react-redux';

import { get } from '../../../store';
import { translate as $t } from '../../../helpers';

import FoldablePanel from '../../ui/foldable-panel';
import DisplayIf from '../../ui/display-if';

import BankAccessItem from './item';
import NewAccessForm from './new-access-form';

export default connect(state => {
    return {
        accessIds: get.accessIds(state),
        isDemoMode: get.isDemoMode(state)
    };
})(props => {
    let accesses = props.accessIds.map(id => <BankAccessItem key={id} accessId={id} />);
    return (
        <div key="bank-accesses-section">
            <DisplayIf condition={!props.isDemoMode}>
                <FoldablePanel
                    className="new-bank-panel"
                    initiallyExpanded={false}
                    title={$t('client.settings.new_bank_form_title')}
                    iconTitle={$t('client.settings.add_bank_button')}
                    top={true}>
                    <NewAccessForm isOnboarding={false} />
                </FoldablePanel>
            </DisplayIf>
            <div>{accesses}</div>
        </div>
    );
});
