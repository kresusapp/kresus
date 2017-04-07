import React from 'react';
import { connect } from 'react-redux';

import { assertHas, translate as $t } from '../../helpers';
import { actions } from '../../store';

export default connect(null, dispatch => {
    return {
        handleSync: accessId => {
            actions.runAccountsSync(dispatch, accessId);
        }
    };
})(props => {
    assertHas(props, 'account');

    const handleSync = () => {
        props.handleSync(props.account.bankAccess);
    };

    return (
        <div
          key="sync-button"
          className="panel-options">
            <div className="last-sync">
                <span className="option-legend">
                    { $t('client.operations.last_sync') }
                    &nbsp;
                    { new Date(props.account.lastChecked).toLocaleString() }
                </span>
                <span
                  onClick={ handleSync }
                  className="option-legend fa fa-refresh"
                />
            </div>
        </div>
    );
});
