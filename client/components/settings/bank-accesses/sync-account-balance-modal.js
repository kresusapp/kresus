import React from 'react';
import { connect } from 'react-redux';

import { translate as $t, assertHas } from '../../../helpers';
import { actions, get } from '../../../store';

import Modal from '../../ui/modal';

export default connect(null, (dispatch, props) => {
    return {
        handleResyncBalance: () => {
            actions.resyncBalance(dispatch, props.account.id);
        }
    };
})(props => {

    let modalId = `syncBalanceModal${props.account.id}`;
    let modalBody = 'test';
    let modalTitle = $t('client.settings.resync_account_title', { title: props.account.title });
    let modalFooter = (
        <div>
            <input type="button" className="btn btn-default" data-dismiss="modal"
              value={ $t('client.settings.resync_account.cancel') }
            />
            <input type="button" className="btn btn-warning"
              onClick = { this.handleResyncBalance }
              value={ $t('client.settings.resync_account.submit') }
            />
        </div>
    )

    return (
        <Modal
          modalId={ modalId }
          modalBody={ modalBody }
          modalTitle= { modalTitle }
          modalFooter= { modalFooter }
        />
    );
});
