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
})(
    class Index extends React.Component {
        refPanel = React.createRef();

        togglePanel = () => {
            this.refPanel.current.handleToggleExpand();
        };

        render = () => {
            let accesses = this.props.accessIds.map(id => (
                <BankAccessItem key={id} accessId={id} />
            ));

            return (
                <div key="bank-accesses-section">
                    <DisplayIf condition={!this.props.isDemoMode}>
                        <FoldablePanel
                            ref={this.refPanel}
                            className="new-bank-panel"
                            initiallyExpanded={false}
                            title={$t('client.settings.new_bank_form_title')}
                            iconTitle={$t('client.settings.add_bank_button')}
                            top={true}>
                            <NewAccessForm isOnboarding={false} togglePanel={this.togglePanel} />
                        </FoldablePanel>
                    </DisplayIf>
                    <div>{accesses}</div>
                </div>
            );
        };
    }
);
