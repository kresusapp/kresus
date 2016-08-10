import React from 'react';
import { connect } from 'react-redux';

import { translate as $t } from '../../../helpers';
import { actions } from '../../../store';

import Modal from '../../ui/modal';

export default connect(null, (dispatch, props) => {
    return {
        handleResyncBalance: () => {
            actions.resyncBalance(dispatch, props.account.id);
        }
    };
})(props => {

    let modalId = `syncBalanceModal${props.account.id}`;

    let modalTitle = $t('client.settings.resync_account.title', { title: props.account.title });

    let modalBody = (
        <div className="text-uppercase">
            { $t('client.settings.resync_account.make_sure') }
            <ul className="bullet">
                <li>{ $t('client.settings.resync_account.manage_duplicates') }</li>
                <li>{ $t('client.settings.resync_account.add_operation') }</li>
                <li>{ $t('client.settings.resync_account.delete_operation') }</li>
            </ul>
            { $t('client.settings.resync_account.are_you_sure') }
        </div>
    );

    let modalFooter = (
        <div>
            <input type="button" className="btn btn-default" data-dismiss="modal"
              value={ $t('client.settings.resync_account.cancel') }
            />
            <input type="button" className="btn btn-warning"
              onClick = { props.handleResyncBalance }
              value={ $t('client.settings.resync_account.submit') }
            />
        </div>
    );

    return (
        <Modal
          key={ modalId }
          modalId={ modalId }
          modalBody={ modalBody }
          modalTitle={ modalTitle }
          modalFooter={ modalFooter }
        />
    );
});
